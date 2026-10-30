import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { auth, signupOpen } from "./auth.js";
import { pool } from "./db.js";
import { env } from "./env.js";
import { createChallenge, verifyPayload } from "./altcha.js";
import { QueryError, querySchema, runQuery } from "./data.js";
import { readScreenshot, saveScreenshot } from "./uploads.js";
import { importTrades, userIdForWebhookKey } from "./routes/import.js";
import { FlexError, syncIbkr } from "./ibkr.js";
import { sendContactMail } from "./mail.js";
import { clientIp, createLimiter, isHoneypotFilled } from "./limits.js";
import { buildExport } from "./export.js";
import { marketEventsBetween } from "./marketEvents.js";
import { allowFeedback, feedbackSchema, submitFeedback } from "./feedback.js";
import { adminStats, isAdmin } from "./admin.js";
import { countRecipients, createCampaign, listCampaigns, sendTest, unsubscribe, verifyUnsubscribe, type CampaignKind } from "./campaigns.js";

type Vars = { userId: string; userEmail: string; isAdmin: boolean };

export const app = new Hono<{ Variables: Vars }>();

app.onError((err, c) => {
  if (err instanceof QueryError) return c.json({ error: err.message }, err.status as 400);
  if (err instanceof z.ZodError) return c.json({ error: "Invalid request", details: err.issues }, 400);
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

// Basic security headers; on tradenot.es Caddy sets them as well. A self-hosted instance stays out
// of search engines: it is somebody's private journal, not a public site.
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("X-Frame-Options", "DENY");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (env.selfHosted) c.header("X-Robots-Tag", "noindex, nofollow");
});

if (env.selfHosted) {
  app.get("/robots.txt", (c) => c.text("User-agent: *\nDisallow: /\n"));
  app.get("/sitemap.xml", (c) => c.notFound());
}

app.get("/api/health", async (c) => {
  await pool.query("select 1");
  return c.json({ ok: true });
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// --- public endpoints -------------------------------------------------------

app.get("/api/altcha/challenge", (c) => c.json(createChallenge()));

// what the login page needs to know before anyone is signed in
app.get("/api/instance", async (c) =>
  c.json({ signupOpen: await signupOpen(), firstRun: env.selfHosted && !(await pool.query(`select 1 from "user" limit 1`)).rowCount }),
);

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  altcha: z.string(),
});

// at most 5 messages per IP and hour
const contactLimit = createLimiter(5, 60 * 60 * 1000);

app.post("/api/contact", async (c) => {
  const raw = await c.req.json();
  if (isHoneypotFilled(raw)) return c.json({ error: "Captcha verification failed" }, 400);
  if (!contactLimit(clientIp(c.req.raw.headers))) return c.json({ error: "Too many messages, please try again later" }, 429);
  const body = contactSchema.parse(raw);
  if (!verifyPayload(body.altcha)) return c.json({ error: "Captcha verification failed" }, 400);
  await sendContactMail(body);
  return c.json({ success: true });
});

// NinjaTrader / TradingView webhook: authenticated by the per-user key instead of a session
app.post("/api/import-trades", async (c) => {
  const key = c.req.header("x-api-key");
  let userId: string | null = null;
  if (key) {
    userId = await userIdForWebhookKey(key);
    if (!userId) return c.json({ error: "Invalid API key" }, 401);
  } else {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    userId = session?.user.id ?? null;
    if (!userId) return c.json({ error: "Unauthorized" }, 401);
  }
  const result = await importTrades(userId, await c.req.json());
  return c.json(result.body as object, result.status as 200);
});

// --- mentor mode: shared trades, readable without login ------------------------

// what a shared trade shows; the account name and everything else stay private
const SHARED_COLUMNS = `t.symbol, t.market, t.side, t.qty, t.entry_price, t.exit_price, t.entry_time, t.exit_time, t.fees,
  t.pnl_net, t.r, t.initial_risk, t.setup, t.rating, t.mistakes, t.emotions, t.account_type, t.mfe_price, t.mae_price,
  t.note, t.screenshot_url, t.user_id`;

async function sharedTrade(token: string) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  const { rows } = await pool.query(
    `select ${SHARED_COLUMNS}, s.show_note, p.nickname, coalesce(us.base_currency, 'USD') as currency
     from trade_shares s join trades t on t.id = s.trade_id left join profiles p on p.id = s.user_id
       left join user_settings us on us.user_id = s.user_id
     where s.token = $1`,
    [token],
  );
  return rows[0] ?? null;
}

app.get("/api/public/share/:token", async (c) => {
  const row = await sharedTrade(c.req.param("token"));
  if (!row) return c.json({ error: "Not found" }, 404);
  await pool.query("update trade_shares set view_count = view_count + 1, last_viewed_at = now() where token = $1", [c.req.param("token")]);
  const { user_id, show_note, nickname, currency, note, screenshot_url, ...trade } = row;
  return c.json(
    {
      trade: { ...trade, note: show_note ? note : null, has_screenshot: !!screenshot_url },
      sharedBy: nickname ?? null,
      currency,
    },
    200,
    { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "no-store" },
  );
});

app.get("/api/public/share/:token/screenshot", async (c) => {
  const row = await sharedTrade(c.req.param("token"));
  const prefix = row ? `/api/screenshots/${row.user_id}/` : null;
  if (!row || !prefix || !row.screenshot_url?.startsWith(prefix)) return c.notFound();
  const file = await readScreenshot(row.user_id, row.screenshot_url.slice(prefix.length));
  if (!file) return c.notFound();
  return c.body(file.data, 200, { "Content-Type": file.contentType, "Cache-Control": "private, max-age=3600", "X-Robots-Tag": "noindex" });
});

// --- newsletter: unsubscribe link from the mail (signed, works without login) -------------

const UUID = /^[0-9a-f-]{36}$/;

app.get("/api/newsletter/unsubscribe", async (c) => {
  const userId = c.req.query("u") ?? "";
  const ok = UUID.test(userId) && verifyUnsubscribe(userId, c.req.query("t") ?? "");
  if (ok) await unsubscribe(userId);
  return c.redirect(`/newsletter-abgemeldet${ok ? "" : "?error=1"}`);
});

// one-click unsubscribe from the mail app's own button (RFC 8058)
app.post("/api/newsletter/unsubscribe", async (c) => {
  const userId = c.req.query("u") ?? "";
  if (!UUID.test(userId) || !verifyUnsubscribe(userId, c.req.query("t") ?? "")) return c.json({ error: "Invalid link" }, 400);
  await unsubscribe(userId);
  return c.json({ success: true });
});

// --- endpoints for logged-in users ------------------------------------------

// "active users" for the admin dashboard: last activity, written at most once an hour per user
const lastTouched = new Map<string, number>();
function touchActivity(userId: string) {
  const now = Date.now();
  if ((lastTouched.get(userId) ?? 0) > now - 60 * 60 * 1000) return;
  lastTouched.set(userId, now);
  pool.query("update user_settings set last_active_at = now() where user_id = $1", [userId]).catch(() => {});
}

app.use("/api/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", session.user.id);
  c.set("userEmail", session.user.email);
  c.set("isAdmin", await isAdmin(session.user));
  touchActivity(session.user.id);
  await next();
});

app.post("/api/db", async (c) => {
  const query = querySchema.parse(await c.req.json());
  return c.json({ data: await runQuery(c.get("userId"), query) });
});

app.post("/api/screenshots", async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return c.json({ error: "No file" }, 400);
  try {
    return c.json({ url: await saveScreenshot(c.get("userId"), file) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

app.get("/api/screenshots/:userId/:name", async (c) => {
  // only the owner can see their screenshots
  if (c.req.param("userId") !== c.get("userId")) return c.notFound();
  const file = await readScreenshot(c.get("userId"), c.req.param("name"));
  if (!file) return c.notFound();
  return c.body(file.data, 200, { "Content-Type": file.contentType, "Cache-Control": "private, max-age=86400" });
});

app.get("/api/webhook-key", async (c) => {
  const { rows } = await pool.query("select webhook_api_key from user_settings where user_id = $1", [c.get("userId")]);
  return c.json({ success: true, webhook_api_key: rows[0]?.webhook_api_key ?? null });
});

app.post("/api/webhook-key", async (c) => {
  const key = randomBytes(24).toString("hex");
  await pool.query("update user_settings set webhook_api_key = $1 where user_id = $2", [key, c.get("userId")]);
  return c.json({ success: true, webhook_api_key: key });
});

// --- mentor mode: the owner's side ------------------------------------------------

app.get("/api/shares/:tradeId", async (c) => {
  const { rows } = await pool.query(
    "select token, show_note, view_count, last_viewed_at, created_at from trade_shares where trade_id = $1 and user_id = $2",
    [c.req.param("tradeId"), c.get("userId")],
  );
  return c.json({ share: rows[0] ?? null });
});

app.post("/api/shares", async (c) => {
  const parsed = z.object({ tradeId: z.string().uuid(), showNote: z.boolean().default(true) }).safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);
  const { tradeId, showNote } = parsed.data;
  const own = await pool.query("select 1 from trades where id = $1 and user_id = $2", [tradeId, c.get("userId")]);
  if (!own.rowCount) return c.json({ error: "Not found" }, 404);
  const { rows } = await pool.query(
    `insert into trade_shares (user_id, trade_id, token, show_note) values ($1, $2, $3, $4)
     on conflict (trade_id) do update set show_note = excluded.show_note
     returning token, show_note, view_count, last_viewed_at, created_at`,
    [c.get("userId"), tradeId, randomBytes(24).toString("base64url"), showNote],
  );
  return c.json({ share: rows[0] });
});

app.delete("/api/shares/:tradeId", async (c) => {
  await pool.query("delete from trade_shares where trade_id = $1 and user_id = $2", [c.req.param("tradeId"), c.get("userId")]);
  return c.json({ success: true });
});

// --- Interactive Brokers (Flex Web Service) ----------------------------------

const ibkrSchema = z.object({
  token: z.string().trim().regex(/^[A-Za-z0-9]{10,64}$/, "token"),
  queryId: z.string().trim().regex(/^\d{3,12}$/, "queryId"),
});

app.get("/api/connections/ibkr", async (c) => {
  const { rows } = await pool.query(
    "select query_id, last_sync_at, last_status, last_error from broker_connections where user_id = $1 and broker = 'ibkr'",
    [c.get("userId")],
  );
  // the token is never sent back
  return c.json({ connection: rows[0] ?? null });
});

app.put("/api/connections/ibkr", async (c) => {
  const parsed = ibkrSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid token or query id", field: parsed.error.issues[0]?.message }, 400);
  await pool.query(
    `insert into broker_connections (user_id, broker, token, query_id) values ($1, 'ibkr', $2, $3)
     on conflict (user_id, broker) do update set token = excluded.token, query_id = excluded.query_id,
       last_sync_at = null, last_status = null, last_error = null`,
    [c.get("userId"), parsed.data.token, parsed.data.queryId],
  );
  return c.json({ success: true });
});

app.delete("/api/connections/ibkr", async (c) => {
  await pool.query("delete from broker_connections where user_id = $1 and broker = 'ibkr'", [c.get("userId")]);
  return c.json({ success: true });
});

app.post("/api/connections/ibkr/sync", async (c) => {
  try {
    return c.json({ success: true, ...(await syncIbkr(c.get("userId"))) });
  } catch (e) {
    return c.json({ error: (e as Error).message }, e instanceof FlexError ? 400 : 500);
  }
});

// --- calendar: announced Fed speeches and presidential appearances ---------------

const DATE = /^\d{4}-\d{2}-\d{2}$/;

app.get("/api/market-events", async (c) => {
  const from = c.req.query("from") ?? "";
  const to = c.req.query("to") ?? "";
  if (!DATE.test(from) || !DATE.test(to)) return c.json({ error: "from and to must be YYYY-MM-DD" }, 400);
  return c.json({ events: await marketEventsBetween(from, to) });
});

// --- in-app feedback: bug or idea ------------------------------------------------

app.post("/api/feedback", async (c) => {
  const parsed = feedbackSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid feedback", field: parsed.error.issues[0]?.path[0] }, 400);
  if (!allowFeedback(c.get("userId"))) return c.json({ error: "Too many messages, please try again later" }, 429);
  return c.json({ success: true, ...(await submitFeedback(parsed.data, { email: c.get("userEmail") })) });
});

// --- newsletter subscription (opt-in, the moment of consent is stored) ---------------------

app.post("/api/newsletter", async (c) => {
  const parsed = z.object({ subscribed: z.boolean() }).safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);
  await pool.query(
    `update user_settings set newsletter = $2, newsletter_consent_at = case when $2 then now() else newsletter_consent_at end
     where user_id = $1`,
    [c.get("userId"), parsed.data.subscribed],
  );
  return c.json({ success: true });
});

// --- admin dashboard -----------------------------------------------------------------------

app.get("/api/me/admin", (c) => c.json({ admin: c.get("isAdmin") }));

app.use("/api/admin/*", async (c, next) => {
  if (!c.get("isAdmin")) return c.json({ error: "Not found" }, 404);
  await next();
});

app.get("/api/admin/stats", async (c) => c.json(await adminStats()));

const campaignSchema = z.object({
  kind: z.enum(["service", "newsletter"]),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(20000),
});

app.get("/api/admin/campaigns", async (c) =>
  c.json({
    campaigns: await listCampaigns(),
    recipients: { service: await countRecipients("service"), newsletter: await countRecipients("newsletter") },
  }),
);

app.post("/api/admin/campaigns/test", async (c) => {
  const parsed = campaignSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid campaign" }, 400);
  await sendTest(parsed.data.kind, parsed.data.subject, parsed.data.body, { id: c.get("userId"), email: c.get("userEmail") });
  return c.json({ success: true });
});

app.post("/api/admin/campaigns", async (c) => {
  const parsed = campaignSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid campaign" }, 400);
  const { kind, subject, body } = parsed.data;
  return c.json({ success: true, ...(await createCampaign(kind as CampaignKind, subject, body, c.get("userEmail"))) });
});

// --- data export ---------------------------------------------------------------

app.get("/api/export", async (c) => {
  const zip = await buildExport(c.get("userId"));
  const date = new Date().toISOString().slice(0, 10);
  return c.body(new Uint8Array(zip), 200, {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="tradenotes-export-${date}.zip"`,
    "Cache-Control": "no-store",
  });
});

// re-checks the password for destructive actions without touching the session
async function checkPassword(userId: string, password: unknown) {
  if (typeof password !== "string" || !password) return false;
  const ctx = await auth.$context;
  const accounts = await ctx.internalAdapter.findAccounts(userId);
  const hash = accounts.find((a) => a.providerId === "credential")?.password;
  return !!hash && (await ctx.password.verify({ hash, password }));
}

app.post("/api/account/reset", async (c) => {
  const { password } = await c.req.json();
  if (!(await checkPassword(c.get("userId"), password))) return c.json({ error: "Incorrect password" }, 401);
  const userId = c.get("userId");
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const table of ["trade_shares", "trades", "journal_entries", "daily_prep", "executions", "broker_connections"]) {
      await client.query(`delete from ${table} where user_id = $1`, [userId]);
    }
    // back to the column defaults
    await client.query(
      `update user_settings set default_fees = default, default_slippage = default, setup_definitions = default,
         daily_goal_amount = default, daily_goal_max_trades = default, base_currency = default, timezone = default,
         setups = default, tags = default
       where user_id = $1`,
      [userId],
    );
    await client.query("commit");
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
  return c.json({ success: true, message: "All data reset successfully" });
});

const stockPriceSchema = z.object({
  symbol: z.string().trim().min(1).max(20).regex(/^[A-Za-z0-9.\-=^]+$/),
  market: z.enum(["Stock", "Futures", "Crypto", "Forex", "Option"]).default("Stock"),
});

app.post("/api/stock-price", async (c) => {
  const { symbol, market } = stockPriceSchema.parse(await c.req.json());
  let formatted = symbol;
  if (market === "Futures") formatted = `${symbol}=F`; // ES=F
  else if (market === "Crypto" && !symbol.includes("-")) formatted = `${symbol}-USD`; // BTC-USD
  else if (market === "Forex") formatted = `${symbol}=X`; // EURUSD=X
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(formatted)}`, {
      signal: AbortSignal.timeout(8000),
    });
    const data: any = res.ok ? await res.json() : null;
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
    if (!price) return c.json({ error: "Price not available", price: null });
    return c.json({ price: Number(price.toFixed(2)), symbol: formatted, originalSymbol: symbol });
  } catch {
    return c.json({ error: "Failed to fetch price", price: null });
  }
});

app.all("/api/*", (c) => c.json({ error: "Not found" }, 404));
