// Port of the Supabase edge function "import-trades": webhook for NinjaTrader
// (the TradeNotesSync add-on) and TradingView, authenticated by the user's webhook
// key, plus batch import for logged-in users.
import type pg from "pg";
import { z } from "zod";
import { pool } from "../db.js";
import { Fill, matchFills } from "../matching.js";

// One fill as sent by the add-on (public/TradeNotesSync.cs, batch format)
const executionSchema = z.object({
  id: z.string().min(1).max(200),
  account: z.string().min(1).max(200),
  instrument: z.string().min(1).max(100),
  /** master instrument name, e.g. "ES" for "ES 12-26" */
  symbol: z.string().min(1).max(50).optional(),
  /** NinjaTrader InstrumentType: Future, Stock, Forex, CryptoCurrency, Option, Index … */
  instrumentType: z.string().max(50).optional(),
  side: z.enum(["buy", "sell"]),
  qty: z.number().positive(),
  price: z.number().positive(),
  time: z.string().datetime({ offset: true }),
  commission: z.number().min(0).default(0),
  pointValue: z.number().positive().optional(),
  high: z.number().positive().nullable().optional(),
  low: z.number().positive().nullable().optional(),
});
type IncomingExecution = z.infer<typeof executionSchema>;

const ACCOUNT_TYPES = ["sim", "evaluation", "performance", "live"] as const;
type AccountType = (typeof ACCOUNT_TYPES)[number];

const batchSchema = z.object({
  // ninjatrader: the add-on; tradingview: the trading panel CSV export (src/lib/csvImport.ts)
  source: z.enum(["ninjatrader", "tradingview"]),
  executions: z.array(executionSchema).max(5000),
  /** overrides the detection from the account name (a CSV does not say paper or live) */
  accountType: z.enum(ACCOUNT_TYPES).optional(),
});

// Futures point values (value of 1 point movement)
const FUTURES_POINT_VALUES: Record<string, number> = {
  ES: 50, MES: 5, NQ: 20, MNQ: 2, YM: 5, MYM: 0.5,
  RTY: 50, M2K: 5,
  GC: 100, MGC: 10, SI: 5000, SIL: 1000, HG: 25000, QC: 12500,
  CL: 1000, MCL: 100, NG: 10000, QG: 2500, RB: 42000, HO: 42000,
  ZB: 1000, ZN: 1000, ZF: 1000, ZT: 2000, UB: 1000,
  ZC: 50, ZS: 50, ZW: 50, ZL: 600, ZM: 100,
  "6E": 125000, "6B": 62500, "6J": 12500000, "6A": 100000, "6C": 100000, "6S": 125000,
};

const OPTIONS_MULTIPLIER = 100;

// Parse NinjaTrader instrument format to extract symbol and market
function parseInstrument(instrument: string): { symbol: string; market: string } {
  const normalized = instrument
    .replace(/\s+\d{2}-\d{2}$/, "") // "NQ 03-25" → "NQ"
    .replace(/\s+/g, "")
    .replace(/\//g, "") // "EUR/USD" → "EURUSD"
    .toUpperCase();

  const continuous = normalized.match(/^([A-Z0-9]{1,4}?)\d!$/); // TradingView "ES1!" → "ES"
  if (continuous) return { symbol: continuous[1], market: "Futures" };
  const futuresMatch = normalized.match(/^([A-Z0-9]{1,4}?)[FGHJKMNQUVXZ](\d{2}|\d{4})$/); // "ESH25", "ESZ2025" → "ES"
  if (futuresMatch) return { symbol: futuresMatch[1], market: "Futures" };
  if (FUTURES_POINT_VALUES[normalized]) return { symbol: normalized, market: "Futures" };
  if (normalized.length === 6 && (normalized.includes("USD") || normalized.includes("EUR") || normalized.includes("GBP"))) {
    return { symbol: normalized, market: "Forex" };
  }
  if (normalized.includes("BTC") || normalized.includes("ETH") || (normalized.endsWith("USD") && normalized.length <= 7)) {
    return { symbol: normalized, market: "Crypto" };
  }
  return { symbol: normalized, market: "Stock" };
}

const TRADE_COLUMNS = [
  "user_id", "symbol", "market", "side", "qty", "entry_price", "exit_price", "entry_time", "exit_time",
  "fees", "pnl_net", "r", "tags", "setup", "note", "account_type", "account_name", "mfe_price", "mae_price",
] as const;

async function insertTrades(trades: Record<string, unknown>[]) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const inserted = [];
    for (const t of trades) {
      const keys = TRADE_COLUMNS.filter((k) => t[k] !== undefined && t[k] !== null);
      const { rows } = await client.query(
        `insert into trades (${keys.join(", ")}) values (${keys.map((_, i) => `$${i + 1}`).join(", ")}) returning *`,
        keys.map((k) => t[k]),
      );
      inserted.push(rows[0]);
    }
    await client.query("commit");
    return inserted;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

// --- executions → trades -------------------------------------------------------

const MARKET_BY_TYPE: Record<string, string> = {
  future: "Futures",
  stock: "Stock",
  forex: "Forex",
  cryptocurrency: "Crypto",
  option: "Option",
  index: "Index",
};

function pointValueFor(symbol: string, market: string, reported?: number) {
  if (reported) return reported;
  if (market === "Futures") return FUTURES_POINT_VALUES[symbol] ?? 1;
  if (market === "Option") return OPTIONS_MULTIPLIER;
  return 1;
}

/** Prop firm / sim detection from the account name (moved here from the NinjaScript). */
export function detectAccountType(account: string): "sim" | "evaluation" | "performance" | "live" {
  const a = account.toUpperCase();
  if (a.startsWith("SIM") || /REPLAY|PLAYBACK|DEMO|PAPER/.test(a)) return "sim";
  // Interactive Brokers paper accounts: DU1234567
  if (/^DU\d/.test(a)) return "sim";
  const firms: [RegExp, RegExp][] = [
    [/APEX/, /PA|FUNDED/],
    [/TOPSTEP|^TS/, /XFA|FUNDED|PRO/],
    [/TRADEIFY|^TF/, /PA|FUNDED/],
    [/MFF|MYFUNDEDFUTURES/, /PRO|LIVE/],
    [/TPT|TAKEPROFIT/, /PRO/],
    [/BULENOX/, /MASTER/],
    [/E2T|EARN2TRADE/, /FUNDED|GAUNTLET/],
    [/LEELOO/, /INVESTOR/],
    [/TRADEDAY|^TD/, /FUNDED|LIVE/],
    [/UPROFIT/, /FUNDED/],
    [/TRADINGPIT|TTP/, /FUNDED/],
  ];
  for (const [firm, funded] of firms) if (firm.test(a)) return funded.test(a) ? "performance" : "evaluation";
  return "live";
}

const SOURCE_TAG: Record<string, string> = { ninjatrader: "NinjaTrader", tradingview: "TradingView", ibkr: "IBKR" };

/**
 * Stores executions (duplicates by execution id are skipped, so clients may resend)
 * and turns every position that went flat into a trade.
 */
export async function importExecutions(userId: string, source: string, list: IncomingExecution[], accountType?: AccountType) {
  const groups = new Map<string, { account: string; symbol: string }>();
  let duplicates = 0;
  for (const e of list) {
    const parsed = parseInstrument(e.symbol ?? e.instrument);
    const market = MARKET_BY_TYPE[e.instrumentType?.toLowerCase() ?? ""] ?? parsed.market;
    const symbol = e.symbol ? e.symbol.toUpperCase() : parsed.symbol;
    const { rowCount } = await pool.query(
      `insert into executions
         (user_id, source, external_id, account, instrument, symbol, market, side, qty, price, commission, point_value, time, high, low)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       on conflict (user_id, source, external_id) do nothing`,
      [userId, source, e.id, e.account, e.instrument, symbol, market, e.side, e.qty, e.price, e.commission,
        pointValueFor(symbol, market, e.pointValue), e.time, e.high ?? null, e.low ?? null],
    );
    if (!rowCount) duplicates++;
    groups.set(`${e.account}\u0000${symbol}`, { account: e.account, symbol });
  }
  const trades = [];
  for (const { account, symbol } of groups.values()) trades.push(...(await settlePosition(userId, account, symbol, accountType)));
  return { received: list.length, duplicates, tradesCreated: trades.length, trades };
}

/** Matches the open executions of one account/symbol and stores finished trades. */
async function settlePosition(userId: string, account: string, symbol: string, accountType?: AccountType) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    // one settlement per position at a time
    await client.query("select pg_advisory_xact_lock(hashtext($1))", [`${userId}|${account}|${symbol}`]);
    const { rows } = await client.query(
      `select * from executions where user_id = $1 and account = $2 and symbol = $3 and not matched order by time, created_at`,
      [userId, account, symbol],
    );
    if (!rows.length) {
      await client.query("commit");
      return [];
    }
    const byId = new Map(rows.map((r) => [r.id as string, r]));
    const fills: Fill[] = rows.map((r) => ({
      id: r.id,
      side: r.side,
      qty: Number(r.qty),
      price: Number(r.price),
      time: (r.time as Date).toISOString(),
      commission: Number(r.commission),
      high: r.high === null ? null : Number(r.high),
      low: r.low === null ? null : Number(r.low),
    }));
    const { trades, open } = matchFills(fills);

    const created = [];
    for (const t of trades) {
      const first = byId.get(t.fills[0].copyOf ?? t.fills[0].id)!;
      const pointValue = Number(first.point_value ?? 1);
      const pnl = t.points * pointValue - t.commission;
      const { rows: [trade] } = await client.query(
        `insert into trades (user_id, symbol, market, side, qty, entry_price, exit_price, entry_time, exit_time, fees, pnl_net,
           tags, account_type, account_name, mfe_price, mae_price)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) returning *`,
        [userId, symbol, first.market, t.side, t.qty, round(t.entryPrice), round(t.exitPrice), t.entryTime, t.exitTime,
          round(t.commission), round(pnl), [SOURCE_TAG[first.source] ?? first.source], accountType ?? detectAccountType(account), account,
          t.side === "long" ? t.high : t.low, t.side === "long" ? t.low : t.high],
      );
      created.push(trade);
      for (const f of t.fills) await saveFill(client, byId, f, trade.id);
    }
    // the remainder of a reversal that is still open
    for (const f of open) if (f.copyOf) await saveFill(client, byId, f, null);
    await client.query("commit");
    return created;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}

const round = (v: number) => Math.round(v * 1e8) / 1e8;

/** Marks a fill as part of a trade; the remainder of a reversing fill becomes its own row. */
async function saveFill(client: pg.PoolClient, byId: Map<string, any>, f: Fill, tradeId: string | null) {
  if (f.copyOf) {
    const orig = byId.get(f.copyOf);
    await client.query(
      `insert into executions
         (user_id, source, external_id, account, instrument, symbol, market, side, qty, price, commission, point_value, time,
          high, low, matched, trade_id)
       select user_id, source, external_id || $2, account, instrument, symbol, market, side, $3, price, $4, point_value, time,
          null, null, $5, $6
       from executions where id = $1
       on conflict (user_id, source, external_id) do nothing`,
      [orig.id, f.id.slice(orig.id.length), f.qty, f.commission, tradeId !== null, tradeId],
    );
    return;
  }
  await client.query("update executions set qty = $2, commission = $3, matched = true, trade_id = $4 where id = $1", [
    f.id, f.qty, f.commission, tradeId,
  ]);
}

export async function userIdForWebhookKey(key: string): Promise<string | null> {
  const { rows } = await pool.query("select user_id from user_settings where webhook_api_key = $1", [key]);
  return rows[0]?.user_id ?? null;
}

export async function importTrades(userId: string, payload: any): Promise<{ status: number; body: unknown }> {
  if (Array.isArray(payload?.executions)) {
    const parsed = batchSchema.safeParse(payload);
    if (!parsed.success) return { status: 400, body: { error: "Invalid executions", issues: parsed.error.issues.slice(0, 5) } };
    const { source, executions, accountType } = parsed.data;
    return { status: 200, body: await importExecutions(userId, source, executions, accountType) };
  }
  let trades: Record<string, unknown>[];
  if (payload?.symbol && payload.entryPrice && payload.exitPrice) {
    // TradingView alert
    const fees = payload.fees || 0;
    trades = [{
      user_id: userId,
      symbol: payload.symbol,
      side: payload.side,
      qty: payload.qty,
      entry_price: payload.entryPrice,
      exit_price: payload.exitPrice,
      entry_time: payload.entryTime,
      exit_time: payload.exitTime,
      fees,
      pnl_net: (payload.exitPrice - payload.entryPrice) * payload.qty * (payload.side === "long" ? 1 : -1) - fees,
      tags: payload.tags || [],
      setup: payload.setup,
      note: payload.note,
    }];
  } else if (Array.isArray(payload)) {
    // Batch import
    trades = payload.map((t: any) => ({
      user_id: userId,
      symbol: t.symbol,
      side: t.side,
      market: t.market,
      qty: t.qty,
      entry_price: t.entryPrice || t.entry_price,
      exit_price: t.exitPrice || t.exit_price,
      entry_time: t.entryTime || t.entry_time,
      exit_time: t.exitTime || t.exit_time,
      fees: t.fees || 0,
      pnl_net: t.pnlNet ?? t.pnl_net,
      r: t.r,
      tags: t.tags || [],
      setup: t.setup,
      note: t.note,
      account_type: t.accountType ?? t.account_type,
      account_name: t.accountName ?? t.account_name,
    }));
  } else {
    return { status: 400, body: { error: "Unsupported payload format" } };
  }

  if (trades.length === 0) return { status: 200, body: { success: true, message: "No trades to insert" } };
  const inserted = await insertTrades(trades);
  return { status: 200, body: { success: true, imported: inserted.length, trades: inserted } };
}
