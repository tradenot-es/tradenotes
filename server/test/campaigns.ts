// Mail to all users: rendering and unsubscribe links (no database needed).
//   DATABASE_URL=postgres://x@localhost/x BASE_URL=https://tradenot.es BETTER_AUTH_SECRET=<32 chars> npx tsx test/campaigns.ts
import { renderCampaign, unsubscribeUrl, verifyUnsubscribe } from "../src/campaigns.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok || detail === undefined ? "" : ` → ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
}

const userId = "11111111-2222-3333-4444-555555555555";
const url = unsubscribeUrl(userId);
const token = new URL(url).searchParams.get("t")!;
check("unsubscribe link points to the API", url.startsWith(`${process.env.BASE_URL}/api/newsletter/unsubscribe?u=${userId}&t=`));
check("valid token accepted", verifyUnsubscribe(userId, token));
check("token of another user rejected", !verifyUnsubscribe("99999999-2222-3333-4444-555555555555", token));
check("forged token rejected", !verifyUnsubscribe(userId, token.slice(0, -1) + (token.endsWith("A") ? "B" : "A")));

const news = renderCampaign("newsletter", "Neu: <Kalender>", "Hallo!\n\nMehr unter https://tradenot.es/features <script>", url);
check("subject and body escaped", news.html.includes("Neu: &lt;Kalender&gt;") && news.html.includes("&lt;script&gt;") && !news.html.includes("<script>"));
check("URLs become links", news.html.includes('<a href="https://tradenot.es/features"'));
check("newsletter has unsubscribe link (HTML and text)", news.html.includes(url.replace(/&/g, "&amp;")) || news.html.includes(url));
check("plain text part with unsubscribe", news.text.includes(`Abmelden / Unsubscribe: ${url}`));
const service = renderCampaign("service", "Wartung", "Am Sonntag ist TradeNot.es kurz offline.");
check("service notice without unsubscribe", !service.html.includes("Unsubscribe") && service.text.includes("betrifft dein Konto"));

console.log(failures ? `\n${failures} check(s) failed` : "\nall campaign tests passed");
process.exit(failures ? 1 : 0);
