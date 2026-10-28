// End-to-end smoke test against a running dev server (npm run dev):
//   npx tsx test/smoke.ts [baseUrl] [devLogFile]
// Signs up two users (solving the captcha), verifies them via the link the dev
// server prints instead of mailing, and exercises the data API, isolation between
// users, webhook import, screenshots, feedback, data export, data reset and account deletion.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const devLog = process.argv[3];
const origin = "http://localhost:8080";
let failures = 0;

function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok || detail === undefined ? "" : ` → ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
}

class Client {
  cookies = new Map<string, string>();
  async req(path: string, init: RequestInit & { json?: unknown } = {}) {
    const headers = new Headers(init.headers);
    headers.set("origin", origin);
    if (init.json !== undefined) headers.set("content-type", "application/json");
    if (this.cookies.size) headers.set("cookie", [...this.cookies].map(([k, v]) => `${k}=${v}`).join("; "));
    const res = await fetch(base + path, {
      ...init,
      headers,
      body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
      redirect: "manual",
    });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(";");
      const [k, v] = pair.split("=");
      if (v) this.cookies.set(k, v);
      else this.cookies.delete(k);
    }
    const text = await res.text();
    let body: any = text;
    try { body = JSON.parse(text); } catch {}
    return { status: res.status, body, headers: res.headers };
  }
  db(query: object) {
    return this.req("/api/db", { method: "POST", json: query });
  }
}

async function solveCaptcha(c: Client) {
  const { body: ch } = await c.req("/api/altcha/challenge");
  for (let n = 0; n <= ch.maxnumber; n++) {
    if (createHash("sha256").update(ch.salt + n).digest("hex") === ch.challenge) {
      return Buffer.from(JSON.stringify({ challenge: ch.challenge, salt: ch.salt, number: n, algorithm: ch.algorithm })).toString("base64");
    }
  }
  throw new Error("captcha unsolvable");
}

async function signUpAndVerify(email: string, firstName: string) {
  const c = new Client();
  const r = await c.req("/api/auth/sign-up/email", {
    method: "POST",
    json: { email, password: "Passwort123", name: firstName, firstName, lastName: "Test", altcha: await solveCaptcha(c), callbackURL: "/dashboard" },
  });
  check(`sign up ${email}`, r.status === 200, r.body);
  const login = await c.req("/api/auth/sign-in/email", { method: "POST", json: { email, password: "Passwort123" } });
  check("login blocked before email verification", login.status === 403, login.status);

  if (!devLog) throw new Error("pass the dev server log file to read verification links");
  await new Promise((r) => setTimeout(r, 300));
  const line = readFileSync(devLog, "utf8").split("\n").reverse().find((l) => l.includes(`verify → ${email}`));
  const url = line?.split(": ").slice(1).join(": ");
  check("verification mail logged", !!url);
  const v = await c.req(new URL(url!).pathname + new URL(url!).search);
  check("verification link signs in", v.status === 302 && c.cookies.size > 0, v.status);
  return c;
}

const stamp = Date.now();
const anna = await signUpAndVerify(`anna${stamp}@example.com`, "Anna");
const bob = await signUpAndVerify(`bob${stamp}@example.com`, "Bob");

const profile = await anna.db({ table: "profiles", action: "select", columns: "first_name, last_name" });
check("profile created on sign up", profile.body.data?.[0]?.first_name === "Anna", profile.body);
const settings = await anna.db({ table: "user_settings", action: "select", columns: "base_currency, setup_definitions" });
check("settings created with defaults", settings.body.data?.[0]?.base_currency === "USD", settings.body);

const trade = {
  symbol: "ES", side: "long", qty: 1, entry_price: 5000, exit_price: 5010,
  entry_time: "2026-10-27T14:00:00Z", exit_time: "2026-10-27T15:00:00Z", pnl_net: 500,
  market: "Futures", tags: ["test"], user_id: "00000000-0000-0000-0000-000000000000",
};
const ins = await anna.db({ table: "trades", action: "insert", values: trade, returning: true });
check("insert trade", ins.status === 200 && ins.body.data?.[0]?.pnl_net === 500, ins.body);
check("owner forced on insert", ins.body.data?.[0]?.user_id !== trade.user_id);
const tradeId = ins.body.data?.[0]?.id;

const sel = await anna.db({
  table: "trades", action: "select", columns: "id, symbol, tags",
  filters: [{ column: "exit_time", op: "gte", value: "2026-10-27T00:00:00" }, { column: "account_name", op: "is", value: null }],
  order: [{ column: "exit_time", ascending: false }], limit: 5,
});
check("select with filters", sel.body.data?.length === 1 && sel.body.data[0].tags[0] === "test", sel.body);

const bobSees = await bob.db({ table: "trades", action: "select" });
check("other user sees no trades", bobSees.body.data?.length === 0, bobSees.body);
const bobUpd = await bob.db({ table: "trades", action: "update", values: { note: "hacked" }, filters: [{ column: "id", op: "eq", value: tradeId }], returning: true });
check("other user cannot update", bobUpd.body.data?.length === 0, bobUpd.body);
const bad = await anna.db({ table: "trades", action: "select", columns: "id; drop table trades" });
check("unknown column rejected", bad.status === 400, bad.body);
const forbidden = await anna.db({ table: "user_settings", action: "delete" });
check("forbidden action rejected", forbidden.status === 403, forbidden.body);
const noTable = await anna.db({ table: "user", action: "select" });
check("auth tables not reachable", noTable.status === 404, noTable.body);

const up = await anna.db({ table: "daily_prep", action: "upsert", values: { date: "2026-10-27", mindset: "calm", checklist: { a: true } }, returning: true });
const up2 = await anna.db({ table: "daily_prep", action: "upsert", values: { date: "2026-10-27", mindset: "focused" }, returning: true });
check("upsert daily_prep", up.body.data?.[0]?.id === up2.body.data?.[0]?.id && up2.body.data[0].mindset === "focused", [up.body, up2.body]);

const upd = await anna.db({ table: "user_settings", action: "update", values: { setup_definitions: [{ name: "ORB" }], webhook_api_key: "x" }, returning: true });
check("jsonb array saved, protected column ignored", upd.body.data?.[0]?.setup_definitions?.[0]?.name === "ORB" && upd.body.data[0].webhook_api_key !== "x", upd.body);

// webhook import (NinjaTrader add-on)
const key = (await anna.req("/api/webhook-key")).body.webhook_api_key;
check("webhook key exists", typeof key === "string" && key.length === 48);
const hook = (payload: object, k = key) =>
  fetch(base + "/api/import-trades", { method: "POST", headers: { "content-type": "application/json", "x-api-key": k }, body: JSON.stringify(payload) }).then(async (r) => ({ status: r.status, body: await r.json() }));
// add-on batch: scale out of 2 ES with commission, resent once
const fills = [
  { id: `a1-${stamp}`, side: "buy", qty: 2, price: 6850, time: "2026-10-27T16:00:00Z" },
  { id: `a2-${stamp}`, side: "sell", qty: 1, price: 6852, time: "2026-10-27T16:03:00Z" },
  { id: `a3-${stamp}`, side: "sell", qty: 1, price: 6854, time: "2026-10-27T16:07:00Z", high: 6855, low: 6849 },
].map((f) => ({ ...f, account: "APEX-1-PA", instrument: "ES 12-26", symbol: "ES", instrumentType: "Future", pointValue: 50, commission: 2.5 * f.qty }));
const batch = await hook({ source: "ninjatrader", executions: fills });
check("add-on batch creates one trade", batch.body.tradesCreated === 1 && Number(batch.body.trades[0].pnl_net) === 290, batch.body);
check("add-on account type detected", batch.body.trades?.[0]?.account_type === "performance", batch.body.trades?.[0]);
const resend = await hook({ source: "ninjatrader", executions: fills });
check("resent executions are skipped", resend.body.duplicates === 3 && resend.body.tradesCreated === 0, resend.body);
const badBatch = await hook({ source: "ninjatrader", executions: [{ id: "x" }] });
check("invalid execution rejected", badBatch.status === 400, badBatch.body);
const badKey = await hook({ source: "ninjatrader", executions: [] }, "nope");
check("wrong webhook key rejected", badKey.status === 401, badKey);

// mentor mode: read-only link to one trade
const shareTrade = (await anna.db({ table: "trades", action: "insert", values: { ...trade, note: "private thoughts", account_name: "Apex-PA-1" }, returning: true })).body.data[0];
const share = await anna.req("/api/shares", { method: "POST", json: { tradeId: shareTrade.id, showNote: false } });
check("share created", typeof share.body.share?.token === "string" && share.body.share.token.length >= 20, share.body);
const anon = new Client();
const pub = await anon.req(`/api/public/share/${share.body.share.token}`);
check("shared trade readable without login", pub.status === 200 && pub.body.trade?.symbol === "ES" && pub.body.sharedBy === "Anna", pub.body);
check("shared trade hides account name, user id and hidden note", !("account_name" in pub.body.trade) && !("user_id" in pub.body.trade) && pub.body.trade.note === null, pub.body.trade);
check("share page not indexed", pub.headers.get("x-robots-tag")?.includes("noindex") === true);
check("other user cannot share foreign trade", (await bob.req("/api/shares", { method: "POST", json: { tradeId: shareTrade.id } })).status === 404);
check("share view counted", (await anna.req(`/api/shares/${shareTrade.id}`)).body.share?.view_count === 1);
await anna.req(`/api/shares/${shareTrade.id}`, { method: "DELETE" });
check("revoked share is gone", (await anon.req(`/api/public/share/${share.body.share.token}`)).status === 404);
check("unknown token 404", (await anon.req("/api/public/share/aaaaaaaaaaaaaaaaaaaaaaaa")).status === 404);

// Interactive Brokers connection (the Flex fetch itself is covered by test/ibkr.ts)
const badIbkr = await anna.req("/api/connections/ibkr", { method: "PUT", json: { token: "x", queryId: "1" } });
check("ibkr: invalid token rejected", badIbkr.status === 400, badIbkr.body);
const putIbkr = await anna.req("/api/connections/ibkr", { method: "PUT", json: { token: "123456789012345678901234", queryId: "987654" } });
const getIbkr = await anna.req("/api/connections/ibkr");
check("ibkr: connection saved, token not returned", putIbkr.status === 200 && getIbkr.body.connection?.query_id === "987654" && !("token" in getIbkr.body.connection), getIbkr.body);
check("ibkr: other user sees no connection", (await bob.req("/api/connections/ibkr")).body.connection === null);
await anna.req("/api/connections/ibkr", { method: "DELETE" });
check("ibkr: connection removed", (await anna.req("/api/connections/ibkr")).body.connection === null);

// screenshots
const form = new FormData();
form.append("file", new Blob([Buffer.from("iVBORw0KGgo=", "base64")], { type: "image/png" }), "x.png");
const shot = await anna.req("/api/screenshots", { method: "POST", body: form });
check("screenshot upload", typeof shot.body.url === "string", shot.body);
check("owner can read screenshot", (await anna.req(shot.body.url)).status === 200);
check("other user cannot read screenshot", (await bob.req(shot.body.url)).status === 404);

// in-app feedback (no SMTP/GitHub in dev: the server logs it)
const fb = await anna.req("/api/feedback", { method: "POST", json: { type: "idea", title: "PDF-Export", message: "Ein Monatsbericht als PDF wäre super." } });
check("feedback accepted with reference", fb.status === 200 && /^[0-9a-f]{6}$/.test(fb.body.ref ?? ""), fb.body);
check("feedback validated", (await anna.req("/api/feedback", { method: "POST", json: { type: "idea", title: "x", message: "y" } })).status === 400);
check("feedback needs login", (await new Client().req("/api/feedback", { method: "POST", json: { type: "bug", title: "abc", message: "0123456789" } })).status === 401);

// data export: everything of the user as ZIP, without secrets and without other users' data
const exp = await anna.req("/api/export");
const zip = typeof exp.body === "string" ? exp.body : JSON.stringify(exp.body);
check("export is a zip", exp.status === 200 && exp.headers.get("content-type") === "application/zip" && zip.startsWith("PK"), exp.status);
check("export has data, csv and screenshot", zip.includes("data.json") && zip.includes("trades.csv") && zip.includes(`screenshots/${shot.body.url.split("/").pop()}`));
check("export holds own account, no webhook key", zip.includes(`anna${stamp}@example.com`) && !zip.includes(key) && !zip.includes("webhook_api_key"));
check("export has no data of other users", !zip.includes(`bob${stamp}@example.com`));
check("export needs login", (await new Client().req("/api/export")).status === 401);

// reset and delete
const wrongPw = await anna.req("/api/account/reset", { method: "POST", json: { password: "falsch" } });
check("reset needs correct password", wrongPw.status === 401, wrongPw.body);
const reset = await anna.req("/api/account/reset", { method: "POST", json: { password: "Passwort123" } });
const after = await anna.db({ table: "trades", action: "select" });
check("reset deletes trades", reset.status === 200 && after.body.data?.length === 0, [reset.body, after.body]);

const del = await bob.req("/api/auth/delete-user", { method: "POST", json: { password: "Passwort123" } });
check("delete account", del.status === 200, del.body);
const gone = await bob.db({ table: "trades", action: "select" });
check("deleted user has no session", gone.status === 401, gone.status);

console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
