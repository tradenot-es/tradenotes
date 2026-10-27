// Port of the Supabase edge function "import-trades": webhook for NinjaTrader
// (TradeNotesSync.cs) and TradingView, authenticated by the user's webhook key,
// plus batch import for logged-in users.
import { pool } from "../db.js";

interface NinjaTraderSingleExecution {
  source: "ninjatrader";
  account: string;
  instrument: string;
  action: string;
  quantity: number;
  price: number;
  timestamp: string;
  executionId: string;
  orderId?: string;
  marketPosition: string;
  accountType?: "sim" | "evaluation" | "performance" | "live";
  // MFE/MAE tracking: high and low prices during the trade
  highDuringTrade?: number;
  lowDuringTrade?: number;
}

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

  const futuresMatch = normalized.match(/^([A-Z]{1,3})[FGHJKMNQUVXZ]\d{2}$/); // "ESH25" → "ES"
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

function calculatePnL(symbol: string, market: string, side: "long" | "short", entry: number, exit: number, qty: number, fees: number) {
  let multiplier = 1;
  if (market === "Futures") multiplier = FUTURES_POINT_VALUES[symbol] || 1;
  else if (market === "Option") multiplier = OPTIONS_MULTIPLIER;
  const direction = side === "long" ? 1 : -1;
  return (exit - entry) * qty * multiplier * direction - fees;
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

export async function userIdForWebhookKey(key: string): Promise<string | null> {
  const { rows } = await pool.query("select user_id from user_settings where webhook_api_key = $1", [key]);
  return rows[0]?.user_id ?? null;
}

export async function importTrades(userId: string, payload: any): Promise<{ status: number; body: unknown }> {
  // NinjaTrader single execution (MarketPosition-based matching)
  if (payload?.source === "ninjatrader" && payload.executionId) {
    const execution = payload as NinjaTraderSingleExecution;
    const { symbol, market } = parseInstrument(execution.instrument);
    // "Buy", "BuyToCover" → "Buy" | "Sell", "SellShort" → "Sell"
    const action = execution.action.toUpperCase().startsWith("BUY") ? "Buy" : "Sell";
    // "Flat" means the position was closed, so this execution is an exit
    const isExit = execution.marketPosition?.toUpperCase() === "FLAT";

    if (!isExit) {
      await pool.query(
        `insert into ninjatrader_executions
           (user_id, account, instrument, symbol, market, action, quantity, price, timestamp, execution_id, order_id, market_position, account_type)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         on conflict (execution_id) do nothing`,
        [userId, execution.account, execution.instrument, symbol, market, action, execution.quantity, execution.price,
          execution.timestamp, execution.executionId, execution.orderId ?? null, execution.marketPosition, execution.accountType || "live"],
      );
      return { status: 200, body: { success: true, message: "Entry execution stored", executionId: execution.executionId } };
    }

    // Exit: pair with the oldest open entry of the opposite action within 12 hours (FIFO)
    const minTime = new Date(new Date(execution.timestamp).getTime() - 12 * 60 * 60 * 1000);
    const { rows: open } = await pool.query(
      `select * from ninjatrader_executions
       where user_id = $1 and symbol = $2 and account = $3 and action = $4 and timestamp >= $5
       order by timestamp asc limit 1`,
      [userId, symbol, execution.account, action === "Buy" ? "Sell" : "Buy", minTime.toISOString()],
    );
    const entry = open[0];
    if (!entry) {
      return { status: 200, body: { success: false, message: "Exit received but no matching entry found", executionId: execution.executionId } };
    }

    const side = entry.action === "Buy" ? "long" : "short";
    const qty = Math.min(Number(entry.quantity), execution.quantity);
    let mfe: number | null = null;
    let mae: number | null = null;
    if (execution.highDuringTrade && execution.lowDuringTrade && execution.highDuringTrade > 0 && execution.lowDuringTrade > 0) {
      // MFE = best price in the trader's favour, MAE = worst price against
      mfe = side === "long" ? execution.highDuringTrade : execution.lowDuringTrade;
      mae = side === "long" ? execution.lowDuringTrade : execution.highDuringTrade;
    }

    const [trade] = await insertTrades([{
      user_id: userId,
      symbol,
      market,
      side,
      qty,
      entry_price: Number(entry.price),
      exit_price: execution.price,
      entry_time: entry.timestamp,
      exit_time: execution.timestamp,
      fees: 0,
      pnl_net: calculatePnL(symbol, market, side, Number(entry.price), execution.price, qty, 0),
      tags: ["NinjaTrader"],
      account_type: entry.account_type || execution.accountType || "live",
      account_name: execution.account,
      mfe_price: mfe,
      mae_price: mae,
    }]);
    await pool.query("delete from ninjatrader_executions where id = $1", [entry.id]);
    return { status: 200, body: { success: true, message: "Trade completed (Flat position)", trade } };
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
  } else if (Array.isArray(payload) && payload.length === 2 && payload[0]?.avgFillPrice !== undefined) {
    // NinjaTrader pair of executions (legacy format)
    const [entry, exit] = payload;
    trades = [{
      user_id: userId,
      symbol: entry.instrument,
      side: entry.action === "BUY" ? "long" : "short",
      qty: entry.quantity,
      entry_price: entry.avgFillPrice,
      exit_price: exit.avgFillPrice,
      entry_time: entry.time,
      exit_time: exit.time,
      fees: 0,
      pnl_net: (exit.avgFillPrice - entry.avgFillPrice) * entry.quantity * (entry.action === "BUY" ? 1 : -1),
      tags: [],
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
      account_type: t.account_type,
      account_name: t.account_name,
    }));
  } else {
    return { status: 400, body: { error: "Unsupported payload format" } };
  }

  if (trades.length === 0) return { status: 200, body: { success: true, message: "No trades to insert" } };
  const inserted = await insertTrades(trades);
  return { status: 200, body: { success: true, imported: inserted.length, trades: inserted } };
}
