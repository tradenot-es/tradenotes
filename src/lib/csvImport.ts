// CSV import: our own template (one row per finished trade) and TradingView's
// trading panel export (one row per order; filled orders become executions that the
// server matches into trades, see server/src/matching.ts).

export interface TemplateTrade {
  symbol: string;
  side: string;
  market?: string;
  qty: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  fees: number;
  pnlNet?: number;
  tags: string[];
  setup?: string;
  note?: string;
}

export interface CsvExecution {
  id: string;
  account: string;
  instrument: string;
  instrumentType?: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  time: string;
  commission: number;
}

export type CsvImport =
  | { format: "template"; trades: TemplateTrade[] }
  | { format: "tradingview"; executions: CsvExecution[]; skipped: number }
  | { format: "unknown"; headers: string[] };

/** RFC 4180-ish: quoted fields, doubled quotes, comma or semicolon separated. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) {
      row.push(field.trim());
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && clean[i + 1] === "\n") i++;
      row.push(field.trim());
      if (row.some((f) => f !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field.trim());
  if (row.some((f) => f !== "")) rows.push(row);
  return rows;
}

/** "6,850.25", "6850,25", "1.234,5" → number */
export function parseNumber(value: string | undefined): number {
  if (!value) return NaN;
  let v = value.replace(/[^\d.,-]/g, "");
  if (v.includes(",") && v.includes(".")) {
    v = v.lastIndexOf(",") > v.lastIndexOf(".") ? v.replace(/\./g, "").replace(",", ".") : v.replace(/,/g, "");
  } else if (v.includes(",")) {
    v = v.replace(",", ".");
  }
  return parseFloat(v);
}

/** ISO with zone as is; "2026-10-27 15:30:12" (TradingView) as the browser's local time. */
export function parseTime(value: string | undefined): string | null {
  if (!value) return null;
  if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(value.trim())) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }
  const m = value.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] ?? 0));
  return isNaN(d.getTime()) ? null : d.toISOString();
}

const norm = (h: string) => h.toLowerCase().replace(/[^a-z]/g, "");
const FUTURES_EXCHANGES = /^(CME|CBOT|NYMEX|COMEX|ICE|EUREX)/i;

export function detectCsv(text: string): CsvImport {
  const rows = parseCsv(text);
  if (rows.length < 2) return { format: "unknown", headers: rows[0] ?? [] };
  const headers = rows[0].map(norm);
  // first name wins, so "closing time" (the fill) beats "placing time"
  const col = (...names: string[]) => {
    for (const name of names) {
      const i = headers.indexOf(name);
      if (i >= 0) return i;
    }
    return -1;
  };

  if (col("entryprice") >= 0 && col("exitprice") >= 0) {
    return { format: "template", trades: rows.slice(1).map((r) => templateTrade(headers, r)) };
  }

  const symbol = col("symbol", "ticker");
  const side = col("side", "action");
  const qty = col("qty", "quantity", "filledqty", "filledquantity");
  const price = col("fillprice", "avgfillprice", "averagefillprice", "avgprice", "price");
  const time = col("closingtime", "filltime", "executiontime", "time", "placingtime");
  if (symbol < 0 || side < 0 || qty < 0 || price < 0 || time < 0) return { format: "unknown", headers: rows[0] };
  const status = col("status");
  const commission = col("commission", "fee", "fees");
  const orderId = col("orderid", "id");

  const executions: CsvExecution[] = [];
  let skipped = 0;
  for (const r of rows.slice(1)) {
    const st = status >= 0 ? r[status]?.toLowerCase() ?? "" : "filled";
    const s = r[side]?.toLowerCase() ?? "";
    const q = parseNumber(r[qty]);
    const p = parseNumber(r[price]);
    const t = parseTime(r[time]);
    // cancelled, rejected and working orders have no fill
    if (!/fill|execut/.test(st) || !(q > 0) || !(p > 0) || !t || !/^(buy|sell|long|short)/.test(s)) {
      skipped++;
      continue;
    }
    const [exchange, ticker] = r[symbol].includes(":") ? r[symbol].split(":", 2) : ["", r[symbol]];
    const buy = s.startsWith("buy") || s.startsWith("long");
    executions.push({
      // without an order id, the row itself identifies the fill
      id: orderId >= 0 && r[orderId] ? r[orderId] : `${r[symbol]}|${s}|${q}|${p}|${t}`,
      account: "TradingView",
      instrument: ticker,
      instrumentType: FUTURES_EXCHANGES.test(exchange) || /\d!$/.test(ticker) ? "Future" : undefined,
      side: buy ? "buy" : "sell",
      qty: q,
      price: p,
      time: t,
      commission: commission >= 0 ? Math.abs(parseNumber(r[commission])) || 0 : 0,
    });
  }
  return { format: "tradingview", executions, skipped };
}

function templateTrade(headers: string[], values: string[]): TemplateTrade {
  const get = (...names: string[]) => {
    const i = headers.findIndex((h) => names.includes(h));
    return i >= 0 ? values[i] ?? "" : "";
  };
  const trade: TemplateTrade = {
    symbol: get("symbol"),
    side: get("side").toLowerCase(),
    market: get("market") || undefined,
    qty: parseNumber(get("qty", "quantity")),
    entryPrice: parseNumber(get("entryprice")),
    exitPrice: parseNumber(get("exitprice")),
    entryTime: get("entrytime"),
    exitTime: get("exittime"),
    fees: parseNumber(get("fees")) || 0,
    tags: get("tags") ? get("tags").split(";") : [],
    setup: get("setup") || undefined,
    note: get("note") || undefined,
  };
  if (trade.entryPrice && trade.exitPrice && trade.qty) {
    trade.pnlNet = (trade.exitPrice - trade.entryPrice) * trade.qty * (trade.side === "long" ? 1 : -1) - trade.fees;
  }
  return trade;
}
