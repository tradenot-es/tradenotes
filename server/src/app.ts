import { Hono } from "hono";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { auth } from "./auth.js";
import { pool } from "./db.js";
import { createChallenge, verifyPayload } from "./altcha.js";
import { QueryError, querySchema, runQuery } from "./data.js";
import { readScreenshot, saveScreenshot } from "./uploads.js";
import { importTrades, userIdForWebhookKey } from "./routes/import.js";
import { FlexError, syncIbkr } from "./ibkr.js";
import { news } from "./routes/news.js";
import { sendContactMail } from "./mail.js";

type Vars = { userId: string; userEmail: string };

export const app = new Hono<{ Variables: Vars }>();

app.onError((err, c) => {
  if (err instanceof QueryError) return c.json({ error: err.message }, err.status as 400);
  if (err instanceof z.ZodError) return c.json({ error: "Invalid request", details: err.issues }, 400);
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

app.get("/api/health", async (c) => {
  await pool.query("select 1");
  return c.json({ ok: true });
});

app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// --- public endpoints -------------------------------------------------------

app.get("/api/altcha/challenge", (c) => c.json(createChallenge()));

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  altcha: z.string(),
});

app.post("/api/contact", async (c) => {
  const body = contactSchema.parse(await c.req.json());
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

// --- endpoints for logged-in users ------------------------------------------

app.use("/api/*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("userId", session.user.id);
  c.set("userEmail", session.user.email);
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
    for (const table of ["trades", "journal_entries", "daily_prep", "executions", "broker_connections", "news_source_preferences"]) {
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

app.post("/api/news", async (c) => {
  const result = await news(c.get("userId"), await c.req.json());
  return c.json(result.body as object, result.status as 200);
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
