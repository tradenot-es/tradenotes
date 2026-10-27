// Rule adherence (process vs. outcome) and the strengths/weaknesses summary.
// Pure functions on plain trade rows, like src/lib/behavior.ts.
import { getDay, getHours, parseISO } from "date-fns";

// --- rule adherence -----------------------------------------------------------

export interface AdherenceTrade {
  id: string;
  pnl_net: number;
  setup?: string | null;
  setup_checklist_completed?: boolean[] | null;
  mistakes?: string[] | null;
}

/** followed = every checklist item ticked; partial = some; broken = none ticked or tagged "broke_rules". */
export type Adherence = "followed" | "partial" | "broken";

/**
 * How well a trade followed its setup's rules, or null when there is nothing to judge
 * (no checklist on the trade and no "broke_rules" tag).
 */
export function adherenceOf(trade: AdherenceTrade): Adherence | null {
  if (trade.mistakes?.includes("broke_rules")) return "broken";
  const list = trade.setup_checklist_completed ?? [];
  if (list.length === 0) return null;
  const done = list.filter(Boolean).length;
  return done === list.length ? "followed" : done === 0 ? "broken" : "partial";
}

export interface Quadrant {
  count: number;
  pnl: number;
}

export interface AdherenceGroup {
  count: number;
  pnl: number;
  winRate: number;
  avgPnl: number;
}

export interface SetupAdherence {
  setup: string;
  rated: number;
  /** share of rated trades with every rule followed, 0–100 */
  adherence: number;
  followed: AdherenceGroup | null;
  notFollowed: AdherenceGroup | null;
}

export interface AdherenceReport {
  rated: number;
  unrated: number;
  /** process × outcome: rules followed (partial counts as not followed) × win/loss */
  matrix: { goodWin: Quadrant; goodLoss: Quadrant; badWin: Quadrant; badLoss: Quadrant };
  followed: AdherenceGroup | null;
  partial: AdherenceGroup | null;
  broken: AdherenceGroup | null;
  /** share of rated trades with every rule followed, 0–100 */
  adherence: number;
  bySetup: SetupAdherence[];
}

function group(list: AdherenceTrade[]): AdherenceGroup | null {
  if (!list.length) return null;
  const pnl = list.reduce((s, t) => s + t.pnl_net, 0);
  return {
    count: list.length,
    pnl,
    winRate: (list.filter((t) => t.pnl_net > 0).length / list.length) * 100,
    avgPnl: pnl / list.length,
  };
}

export function adherenceReport(trades: AdherenceTrade[]): AdherenceReport {
  const rated = trades.map((t) => ({ t, a: adherenceOf(t) })).filter((x): x is { t: AdherenceTrade; a: Adherence } => x.a !== null);
  const matrix = {
    goodWin: { count: 0, pnl: 0 },
    goodLoss: { count: 0, pnl: 0 },
    badWin: { count: 0, pnl: 0 },
    badLoss: { count: 0, pnl: 0 },
  };
  for (const { t, a } of rated) {
    const q = a === "followed" ? (t.pnl_net > 0 ? matrix.goodWin : matrix.goodLoss) : t.pnl_net > 0 ? matrix.badWin : matrix.badLoss;
    q.count++;
    q.pnl += t.pnl_net;
  }

  const bySetupMap = new Map<string, { t: AdherenceTrade; a: Adherence }[]>();
  for (const x of rated) {
    const key = x.t.setup || "—";
    bySetupMap.set(key, [...(bySetupMap.get(key) ?? []), x]);
  }
  const bySetup = [...bySetupMap.entries()]
    .map(([setup, list]) => ({
      setup,
      rated: list.length,
      adherence: (list.filter((x) => x.a === "followed").length / list.length) * 100,
      followed: group(list.filter((x) => x.a === "followed").map((x) => x.t)),
      notFollowed: group(list.filter((x) => x.a !== "followed").map((x) => x.t)),
    }))
    .sort((a, b) => b.rated - a.rated);

  const of = (a: Adherence) => rated.filter((x) => x.a === a).map((x) => x.t);
  return {
    rated: rated.length,
    unrated: trades.length - rated.length,
    matrix,
    followed: group(of("followed")),
    partial: group(of("partial")),
    broken: group(of("broken")),
    adherence: rated.length ? (of("followed").length / rated.length) * 100 : 0,
    bySetup,
  };
}

// --- strengths & weaknesses ---------------------------------------------------

export interface InsightTrade {
  pnl_net: number;
  entry_time: string;
  symbol: string;
  side: string;
  setup?: string | null;
}

export type InsightDimension = "setup" | "weekday" | "hour" | "symbol" | "side";

export interface Insight {
  dimension: InsightDimension;
  /** raw group key: setup/symbol name, weekday 0–6, hour 0–23, "long"/"short" */
  key: string;
  count: number;
  pnl: number;
  avgPnl: number;
  winRate: number;
}

/** A group needs this many trades before it can count as a strength or weakness. */
export const INSIGHT_MIN_TRADES = 5;

const DIMENSIONS: Record<InsightDimension, (t: InsightTrade) => string | null> = {
  setup: (t) => t.setup || null,
  weekday: (t) => String(getDay(parseISO(t.entry_time))),
  hour: (t) => String(getHours(parseISO(t.entry_time))),
  symbol: (t) => t.symbol || null,
  side: (t) => t.side || null,
};

/**
 * Best and worst groups across setup, weekday, entry hour, symbol and direction.
 * Ranked by total P&L; a strength must be net positive, a weakness net negative,
 * and dimensions with a single group (e.g. only one setup) are skipped.
 */
export function strengthsAndWeaknesses(trades: InsightTrade[], limit = 3): { strengths: Insight[]; weaknesses: Insight[] } {
  const all: Insight[] = [];
  for (const [dimension, keyOf] of Object.entries(DIMENSIONS) as [InsightDimension, (t: InsightTrade) => string | null][]) {
    const map = new Map<string, InsightTrade[]>();
    for (const t of trades) {
      const key = keyOf(t);
      if (key !== null) map.set(key, [...(map.get(key) ?? []), t]);
    }
    if (map.size < 2) continue;
    for (const [key, list] of map) {
      if (list.length < INSIGHT_MIN_TRADES) continue;
      const pnl = list.reduce((s, t) => s + t.pnl_net, 0);
      all.push({
        dimension,
        key,
        count: list.length,
        pnl,
        avgPnl: pnl / list.length,
        winRate: (list.filter((t) => t.pnl_net > 0).length / list.length) * 100,
      });
    }
  }
  // groups with identical trades (e.g. one setup only traded on one symbol) say the same
  // thing twice; keep the first by dimension order
  const distinct = (list: Insight[]) => {
    const seen = new Set<string>();
    return list.filter((i) => {
      const sig = `${i.count}|${i.pnl}|${i.winRate}`;
      if (seen.has(sig)) return false;
      seen.add(sig);
      return true;
    });
  };
  return {
    strengths: distinct(all.filter((i) => i.pnl > 0).sort((a, b) => b.pnl - a.pnl)).slice(0, limit),
    weaknesses: distinct(all.filter((i) => i.pnl < 0).sort((a, b) => a.pnl - b.pnl)).slice(0, limit),
  };
}
