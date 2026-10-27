// Interactive Brokers: fetches the executions of a user's Flex Query through the
// Flex Web Service (read-only report token) and imports them like the NinjaTrader
// add-on does. Runs daily for every connection and on demand from the import page.
import { pool } from "./db.js";
import { importExecutions } from "./routes/import.js";

const FLEX_URL = "https://ndcdyn.interactivebrokers.com/AccountManagement/FlexWebService";
const USER_AGENT = "TradeNot.es/1.0";

export interface FlexExecution {
  id: string;
  account: string;
  instrument: string;
  symbol: string;
  instrumentType: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  time: string;
  commission: number;
  pointValue?: number;
}

const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1]?.trim() ?? null;

function attributes(element: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of element.matchAll(/(\w+)="([^"]*)"/g)) attrs[m[1]] = m[2].replace(/&amp;/g, "&").replace(/&quot;/g, '"');
  return attrs;
}

/** Offset of a time zone at a given moment, in minutes (e.g. -240 for New York in summer). */
function zoneOffset(date: Date, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUtc - date.getTime()) / 60_000;
}

/**
 * Flex dateTime ("20261026;093102", "2026-10-26;09:31:02", "2026-10-26, 09:31:02") →
 * ISO. IBKR reports times in US Eastern time.
 */
export function flexTime(value: string, timeZone = "America/New_York"): string | null {
  const m = value.match(/^(\d{4})-?(\d{2})-?(\d{2})[;, T]+(\d{2}):?(\d{2}):?(\d{2})/);
  if (!m) return null;
  const local = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  // two passes get the offset right around daylight saving changes
  let utc = local - zoneOffset(new Date(local), timeZone) * 60_000;
  utc = local - zoneOffset(new Date(utc), timeZone) * 60_000;
  return new Date(utc).toISOString();
}

const TYPES: Record<string, string> = { STK: "Stock", FUT: "Future", OPT: "Option", FOP: "Option", CASH: "Forex", CRYPTO: "CryptoCurrency" };

/** Executions from a Flex statement (XML). Order summaries and closed lots are skipped. */
export function parseFlexTrades(xml: string): FlexExecution[] {
  const executions: FlexExecution[] = [];
  for (const m of xml.matchAll(/<Trade\s[^>]*?\/?>/g)) {
    const a = attributes(m[0]);
    if (a.levelOfDetail && a.levelOfDetail.toUpperCase() !== "EXECUTION") continue;
    const qty = Math.abs(parseFloat(a.quantity));
    const price = parseFloat(a.tradePrice);
    const time = flexTime(a.dateTime ?? "");
    const type = TYPES[a.assetCategory?.toUpperCase()];
    if (!(qty > 0) || !(price > 0) || !time || !type) continue;
    const futures = type === "Future";
    const multiplier = parseFloat(a.multiplier);
    executions.push({
      id: a.ibExecID || a.tradeID || `${a.accountId}|${a.symbol}|${a.dateTime}|${a.quantity}|${a.tradePrice}`,
      account: a.accountId || "IBKR",
      instrument: a.symbol,
      // futures by their root ("ES" for "ESZ6"), so the point value table applies
      symbol: futures && a.underlyingSymbol ? a.underlyingSymbol : a.symbol.replace(/\s+/g, " "),
      instrumentType: type,
      side: (a.buySell ?? "").toUpperCase().startsWith("BUY") ? "buy" : "sell",
      qty,
      price,
      time,
      commission: Math.abs(parseFloat(a.ibCommission) || 0),
      pointValue: multiplier > 0 ? multiplier : undefined,
    });
  }
  return executions;
}

export class FlexError extends Error {}

/** SendRequest, then GetStatement until the report is ready. */
export async function fetchFlexStatement(token: string, queryId: string, wait = (ms: number) => new Promise((r) => setTimeout(r, ms))) {
  const headers = { "User-Agent": USER_AGENT };
  const send = await (await fetch(`${FLEX_URL}/SendRequest?t=${encodeURIComponent(token)}&q=${encodeURIComponent(queryId)}&v=3`, { headers })).text();
  if (tag(send, "Status") !== "Success") {
    throw new FlexError(`${tag(send, "ErrorCode") ?? ""} ${tag(send, "ErrorMessage") ?? "Flex request failed"}`.trim());
  }
  const reference = tag(send, "ReferenceCode");
  const url = tag(send, "Url") ?? `${FLEX_URL}/GetStatement`;
  for (let attempt = 0; attempt < 10; attempt++) {
    const body = await (await fetch(`${url}?q=${reference}&t=${encodeURIComponent(token)}&v=3`, { headers })).text();
    if (body.includes("<FlexQueryResponse")) return body;
    // 1019: statement generation in progress
    if (tag(body, "ErrorCode") !== "1019") {
      throw new FlexError(`${tag(body, "ErrorCode") ?? ""} ${tag(body, "ErrorMessage") ?? "Flex statement failed"}`.trim());
    }
    await wait(5000);
  }
  throw new FlexError("Statement not ready after 50 seconds");
}

/** Fetches and imports one user's IBKR executions; records the outcome on the connection. */
export async function syncIbkr(userId: string) {
  const { rows } = await pool.query("select token, query_id from broker_connections where user_id = $1 and broker = 'ibkr'", [userId]);
  if (!rows.length) throw new FlexError("No IBKR connection");
  try {
    const executions = parseFlexTrades(await fetchFlexStatement(rows[0].token, rows[0].query_id));
    const result = await importExecutions(userId, "ibkr", executions);
    const status = `${result.received} executions, ${result.tradesCreated} new trades`;
    await pool.query(
      "update broker_connections set last_sync_at = now(), last_status = $2, last_error = null where user_id = $1 and broker = 'ibkr'",
      [userId, status],
    );
    return { received: result.received, duplicates: result.duplicates, tradesCreated: result.tradesCreated };
  } catch (e) {
    await pool.query("update broker_connections set last_sync_at = now(), last_error = $2 where user_id = $1 and broker = 'ibkr'", [
      userId,
      (e as Error).message.slice(0, 500),
    ]);
    throw e;
  }
}

/** Daily run: every connection that was not synced in the last 20 hours. */
export async function syncDueIbkr() {
  const { rows } = await pool.query(
    "select user_id from broker_connections where broker = 'ibkr' and (last_sync_at is null or last_sync_at < now() - interval '20 hours')",
  );
  for (const { user_id } of rows) await syncIbkr(user_id).catch((e) => console.error("ibkr sync failed", user_id, (e as Error).message));
}
