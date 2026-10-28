// Finds texts the app asks for that no language file has. Opens every page (public and,
// logged in as the demo account, the dashboard with all report and import tabs) against the
// dev server and collects the "[i18n] missing key" warnings from src/i18n/config.ts.
//   cd server && npx tsx tools/seed-demo.ts   (once, creates the demo account)
//   CHROMIUM=<chrome> node scripts/check-i18n.mjs
import { chromium } from "playwright-core";
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "en-US" });
const page = await ctx.newPage();
const missing = new Map();
let where = "";
page.on("console", (m) => { const k = m.text().match(/\[i18n\] missing key: (.+)/)?.[1]; if (k) missing.set(k, where); });
const B = "http://localhost:8080";
const visit = async (path, scroll = true) => {
  where = path;
  await page.goto(B + path, { waitUntil: "networkidle" });
  if (scroll) for (let y = 0; y < 12; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(120); }
};
for (const p of ["/", "/features", "/warum-trading-journal", "/auth", "/kontakt", "/hilfe", "/status", "/datenschutz", "/agb", "/impressum", "/gibtsnicht"]) await visit(p);
await visit("/auth", false);
await page.fill('input[type="email"]', "demo-screens@example.com");
await page.fill('input[type="password"]', "Demo-Screens-2026");
await page.keyboard.press("Enter");
await page.waitForURL(/dashboard/, { timeout: 20000 });
for (const p of ["", "/trades", "/days", "/import", "/journal", "/settings", "/account", "/glossary", "/trades?addTrade=true"]) await visit("/dashboard" + p);
// every tab on the reports page
await visit("/dashboard/reports");
for (const tab of await page.getByRole("tab").all()) { where = "reports:" + (await tab.innerText()); await tab.click(); await page.waitForTimeout(500); for (let y = 0; y < 8; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(100); } }
// import tabs
await visit("/dashboard/import", false);
for (const tab of await page.getByRole("tab").all()) { where = "import:" + (await tab.innerText()); await tab.click(); await page.waitForTimeout(400); }
console.log(missing.size ? [...missing].map(([k, w]) => `${k}  (${w})`).join("\n") : "no missing keys");
await browser.close();
