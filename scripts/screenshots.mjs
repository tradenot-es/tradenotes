// Marketing screenshots of the app in every UI language → src/assets/screens/<lang>/<name>.webp
//
// Needs the local stack and the demo account:
//   (cd server && npm run dev)          # API on :3000
//   npx vite                            # frontend on :8080
//   (cd server && npx tsx tools/seed-demo.ts)
//   CHROMIUM=/path/to/chrome node scripts/screenshots.mjs [lang ...] [--only name,name]
//
// Shots are 960×540 CSS px rendered to 1600×900 (hero 1080×750 → 1800×1250, dialogs
// 752×423 at 2×), top-aligned on an anchor element that is found by its translated
// heading, so they work in every language.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";
const LANGS = ["de", "en", "es", "fr", "it", "nl"];
const DEMO = { email: "demo-screens@example.com", password: "Demo-Screens-2026" };

/**
 * anchor: { key } = card whose heading is the translation of key, { css, nth } = element,
 * { dialog: true } = open dialog. offset = space above the anchor in CSS px.
 */
const SHOTS = [
  { name: "hero-dashboard", path: "/dashboard", anchor: { css: "main" }, offset: 0, width: 1080, height: 750, out: 1800 },
  { name: "discipline-score", path: "/dashboard", anchor: { key: "discipline.title" } },
  { name: "equity", path: "/dashboard", anchor: { key: "dashboard.equityCurve" } },
  // from 1280 px viewport the calendar shows the week panel beside it
  { name: "calendar", path: "/dashboard/trades", anchor: { css: "main button[role=combobox]" }, offset: 40, width: 1024, height: 576 },
  { name: "trades", path: "/dashboard/trades", anchor: { css: "main table" }, offset: 72, width: 1024, height: 576 },
  { name: "trade-dialog", path: "/dashboard/trades?addTrade=true", anchor: { dialog: true }, offset: 40, width: 752, height: 423, out: 1504 },
  {
    name: "position-calc",
    path: "/dashboard/trades?addTrade=true",
    anchor: { dialog: true, key: "positionCalculator.title", click: true },
    offset: 24,
    width: 752,
    height: 423,
    out: 1504,
  },
  { name: "days", path: "/dashboard/days", anchor: { css: "main .glossy-card", nth: 1 } },
  { name: "import", path: "/dashboard/import", anchor: { css: "main .glossy-card", nth: 1 } },
  { name: "import-ibkr", path: "/dashboard/import", anchor: { key: "import.ibkr.title" } },
  // guide and upload side by side
  { name: "import-tradingview", path: "/dashboard/import", anchor: { key: "import.tvTitle" } },
  { name: "insights", path: "/dashboard/reports?tab=overview", anchor: { key: "insights.title" } },
  { name: "rules", path: "/dashboard/settings", anchor: { css: "#trading-goals" } },
  { name: "reports-overview", path: "/dashboard/reports?tab=overview", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-accounts", path: "/dashboard/reports?tab=accounts", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-setup", path: "/dashboard/reports?tab=setup", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-time", path: "/dashboard/reports?tab=time", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-behavior", path: "/dashboard/reports?tab=behavior", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-symbols", path: "/dashboard/reports?tab=symbols", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-risk", path: "/dashboard/reports?tab=risk", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-simulator", path: "/dashboard/reports?tab=simulator", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "reports-rules", path: "/dashboard/reports?tab=rules", anchor: { css: "[role=tabpanel][data-state=active]" } },
  { name: "consistency", path: "/dashboard/reports?tab=overview", anchor: { key: "dashboard.consistencyTracker" } },
  { name: "streaks", path: "/dashboard/reports?tab=behavior", anchor: { key: "reports.streakAnalysis" } },
  { name: "holding", path: "/dashboard/reports?tab=behavior", anchor: { key: "reports.holdingPeriodDistribution" } },
];

const args = process.argv.slice(2);
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? args.splice(onlyIdx, 2)[1].split(",") : null;
const langs = args.length ? args : LANGS;

const executablePath = process.env.CHROMIUM;
if (!executablePath) throw new Error("set CHROMIUM to a Chromium/Chrome executable");

const translate = (dict, key) => key.split(".").reduce((o, k) => o?.[k], dict);

// Chromium encodes WebP, so no image library is needed
async function toWebp(page, png) {
  const b64 = await page.evaluate(async (data) => {
    const img = new Image();
    img.src = `data:image/png;base64,${data}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/webp", 0.82).split(",")[1];
  }, png.toString("base64"));
  return Buffer.from(b64, "base64");
}

/** Smallest card that contains a heading with exactly this text. */
async function cardByHeading(page, text) {
  const handle = await page.evaluateHandle((wanted) => {
    const headings = [...document.querySelectorAll("h1, h2, h3, h4, [class*='CardTitle'], .text-2xl")].filter(
      (h) => h.textContent.trim().replace(/\s+/g, " ") === wanted,
    );
    const cards = headings.map((h) => h.closest(".glossy-card") ?? h).filter(Boolean);
    cards.sort((a, b) => a.offsetHeight * a.offsetWidth - b.offsetHeight * b.offsetWidth);
    return cards[0] ?? null;
  }, text);
  const el = handle.asElement();
  if (!el) throw new Error(`no card with heading "${text}"`);
  return el;
}

/** Scrolls the anchor to `offset` px below the top of its scroll container. */
async function scrollTo(el, offset) {
  await el.evaluate((node, off) => {
    node.scrollIntoView({ block: "start" });
    let p = node.parentElement;
    while (p && !(p.scrollHeight > p.clientHeight && /auto|scroll/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
    (p ?? document.scrollingElement).scrollBy(0, -off);
  }, offset);
}

const en = JSON.parse(await readFile(new URL("../src/i18n/locales/en.json", import.meta.url), "utf8"));
const browser = await chromium.launch({ executablePath });
try {
  for (const lang of langs) {
    const own = JSON.parse(await readFile(new URL(`../src/i18n/locales/${lang}.json`, import.meta.url), "utf8"));
    // the app falls back to English for missing keys, and so does the anchor lookup
    const dict = { own, get: (key) => translate(own, key) ?? translate(en, key) };
    const outDir = new URL(`../src/assets/screens/${lang}/`, import.meta.url);
    await mkdir(outDir, { recursive: true });

    for (const shot of SHOTS.filter((s) => !only || only.includes(s.name))) {
      const width = shot.width ?? 960;
      const height = shot.height ?? 540;
      // sidebar is 256 px wide; the viewport leaves exactly `width` for the content
      const context = await browser.newContext({
        locale: lang,
        timezoneId: "Europe/Amsterdam",
        colorScheme: "dark",
        reducedMotion: "reduce",
        viewport: { width: 256 + width, height: 900 },
        deviceScaleFactor: (shot.out ?? 1600) / width,
      });
      await context.addInitScript(() => {
        localStorage.setItem("tradenotes-theme", "dark");
        localStorage.setItem("cookie-consent", JSON.stringify({ necessary: true, functional: true, analytics: false, marketing: false }));
      });
      const login = await context.request.post(`${BASE}/api/auth/sign-in/email`, {
        data: DEMO,
        headers: { origin: BASE },
      });
      if (!login.ok()) throw new Error(`login failed: ${login.status()} ${await login.text()}`);

      const page = await context.newPage();
      await page.goto(BASE + shot.path, { waitUntil: "networkidle" });
      // toasts (achievements, goal alerts) and confetti are not part of the product shot
      await page.addStyleTag({ content: "[data-sonner-toaster], body > canvas { display: none !important; }" });
      // the import page prints the webhook URL of the current origin
      await page.evaluate((origin) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const n = walker.currentNode;
          if (n.nodeValue.includes(origin)) n.nodeValue = n.nodeValue.replaceAll(origin, "https://tradenot.es");
        }
      }, new URL(BASE).origin);
      await page.waitForTimeout(1500);

      let el;
      let clipX;
      if (shot.anchor.dialog) {
        const dialog = await page.waitForSelector("[role=dialog]");
        el = dialog;
        if (shot.anchor.key) {
          const title = page.locator("[role=dialog]").getByText(dict.get(shot.anchor.key), { exact: true }).first();
          if (shot.anchor.click) {
            await title.click();
            await page.waitForTimeout(500);
          }
          el = await title.elementHandle();
        }
        const box = await dialog.boundingBox();
        clipX = Math.max(0, box.x + box.width / 2 - width / 2);
      } else {
        el = shot.anchor.key
          ? await cardByHeading(page, dict.get(shot.anchor.key))
          : (await page.$$(shot.anchor.css))[shot.anchor.nth ?? 0];
        if (!el) throw new Error(`${shot.name}: anchor not found`);
        clipX = 256;
      }
      await scrollTo(el, shot.offset ?? 16);
      await page.waitForTimeout(400);
      const top = (await el.boundingBox()).y - (shot.offset ?? 16);
      const png = await page.screenshot({ clip: { x: clipX, y: Math.max(0, top), width, height } });
      await writeFile(new URL(`${shot.name}.webp`, outDir), await toWebp(page, png));
      console.log(`${lang}/${shot.name}.webp`);
      await context.close();
    }
  }
} finally {
  await browser.close();
}
