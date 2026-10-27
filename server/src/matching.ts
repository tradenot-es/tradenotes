// Turns broker executions (fills) into round-trip trades: a trade starts when the
// position leaves flat and ends when it is flat again. Entries are closed FIFO,
// partial fills, scaling in/out and reversals are handled. Pure, so it is unit
// tested in test/matching.ts; src/routes/import.ts stores the results.

export interface Fill {
  id: string;
  side: "buy" | "sell";
  qty: number;
  price: number;
  /** ISO time */
  time: string;
  commission: number;
  /** highest/lowest price seen since the position opened, if the client tracks it */
  high: number | null;
  low: number | null;
  /** set on the remainder of a fill that reversed the position; not stored yet */
  copyOf?: string;
}

export interface RoundTrip {
  side: "long" | "short";
  /** the fills (or parts of a reversing fill) that make up the trade */
  fills: Fill[];
  qty: number;
  entryPrice: number;
  exitPrice: number;
  /** price difference × quantity in the trade's favour, before the point value */
  points: number;
  commission: number;
  entryTime: string;
  exitTime: string;
  high: number;
  low: number;
}

const EPS = 1e-9;

export function matchFills(input: Fill[]): { trades: RoundTrip[]; open: Fill[] } {
  const queue = [...input].sort((a, b) => a.time.localeCompare(b.time));
  const trades: RoundTrip[] = [];
  let lots: { qty: number; price: number }[] = [];
  let position = 0;
  let cur: {
    side: "long" | "short";
    fills: Fill[];
    entryQty: number;
    entryValue: number;
    exitQty: number;
    exitValue: number;
    points: number;
    high: number;
    low: number;
  } | null = null;

  for (let i = 0; i < queue.length; i++) {
    const fill = queue[i];
    const signed = fill.side === "buy" ? fill.qty : -fill.qty;
    if (!cur) {
      cur = {
        side: signed > 0 ? "long" : "short",
        fills: [],
        entryQty: 0,
        entryValue: 0,
        exitQty: 0,
        exitValue: 0,
        points: 0,
        high: fill.price,
        low: fill.price,
      };
    }
    const dir = cur.side === "long" ? 1 : -1;
    cur.high = Math.max(cur.high, fill.price, fill.high ?? -Infinity);
    cur.low = Math.min(cur.low, fill.price, fill.low ?? Infinity);

    if (Math.sign(signed) === dir) {
      // opening or adding
      lots.push({ qty: fill.qty, price: fill.price });
      cur.fills.push(fill);
      cur.entryQty += fill.qty;
      cur.entryValue += fill.qty * fill.price;
      position += signed;
      continue;
    }

    // closing; a fill larger than the position closes it and opens the other side
    const closeQty = Math.min(fill.qty, Math.abs(position));
    let part = fill;
    if (fill.qty - closeQty > EPS) {
      const share = closeQty / fill.qty;
      part = { ...fill, qty: closeQty, commission: fill.commission * share };
      queue.splice(i + 1, 0, {
        ...fill,
        id: `${fill.id}#r`,
        copyOf: fill.copyOf ?? fill.id,
        qty: fill.qty - closeQty,
        commission: fill.commission - part.commission,
        // the new position starts at this fill
        high: fill.price,
        low: fill.price,
      });
    }
    let remaining = closeQty;
    while (remaining > EPS && lots.length) {
      const lot = lots[0];
      const q = Math.min(lot.qty, remaining);
      cur.points += (fill.price - lot.price) * q * dir;
      lot.qty -= q;
      remaining -= q;
      if (lot.qty <= EPS) lots.shift();
    }
    cur.fills.push(part);
    cur.exitQty += closeQty;
    cur.exitValue += closeQty * fill.price;
    position -= dir * closeQty;

    if (Math.abs(position) <= EPS) {
      const entries = cur.fills.filter((f) => (f.side === "buy") === (cur!.side === "long"));
      const exits = cur.fills.filter((f) => (f.side === "buy") !== (cur!.side === "long"));
      trades.push({
        side: cur.side,
        fills: cur.fills,
        qty: cur.entryQty,
        entryPrice: cur.entryValue / cur.entryQty,
        exitPrice: cur.exitValue / cur.exitQty,
        points: cur.points,
        commission: cur.fills.reduce((s, f) => s + f.commission, 0),
        entryTime: entries[0].time,
        exitTime: exits[exits.length - 1].time,
        high: cur.high,
        low: cur.low,
      });
      cur = null;
      lots = [];
      position = 0;
    }
  }
  return { trades, open: cur ? cur.fills : [] };
}
