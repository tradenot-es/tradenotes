// Trading behaviour: mistake/emotion catalogue, automatic pattern detection,
// daily discipline against the user's limit goals, and the TradeNot.es Score.
// Pure functions on plain trade rows, so dashboard, reports and day view share them.
import { format, parseISO, subDays } from "date-fns";
import type { DayGoalResult, GoalKey, TradingGoalsConfig } from "@/types/tradingGoals";

export const MISTAKES = [
  "revenge",
  "overtrading",
  "fomo",
  "no_plan",
  "broke_rules",
  "moved_stop",
  "oversized",
  "early_exit",
  "late_exit",
  "chased_entry",
] as const;
export type Mistake = (typeof MISTAKES)[number];

export const EMOTIONS = ["calm", "confident", "fearful", "greedy", "frustrated", "impatient", "euphoric", "tired"] as const;
export type Emotion = (typeof EMOTIONS)[number];

export interface BehaviorTrade {
  id: string;
  pnl_net: number;
  qty: number;
  entry_time: string;
  exit_time: string;
  mistakes?: string[] | null;
  emotions?: string[] | null;
}

/** A trade opened within this many minutes after a losing trade closed counts as a possible revenge trade. */
export const REVENGE_WINDOW_MINUTES = 10;

export interface DetectedFlags {
  revenge: Set<string>;
  overtrading: Set<string>;
}

const dayOf = (iso: string) => format(parseISO(iso), "yyyy-MM-dd");

/**
 * Flags trades automatically:
 * - revenge: entered shortly after a loss closed on the same day, with at least the same size
 * - overtrading: every trade of a day beyond the daily trade limit (if the limit goal is on)
 */
export function detectPatterns(trades: BehaviorTrade[], maxTradesPerDay?: number): DetectedFlags {
  const revenge = new Set<string>();
  const overtrading = new Set<string>();
  const byEntry = [...trades].sort((a, b) => a.entry_time.localeCompare(b.entry_time));

  for (let i = 0; i < byEntry.length; i++) {
    const t = byEntry[i];
    const entry = parseISO(t.entry_time).getTime();
    // the most recent loss that closed before this trade was opened, same day
    for (let j = i - 1; j >= 0; j--) {
      const prev = byEntry[j];
      if (dayOf(prev.exit_time) !== dayOf(t.entry_time)) continue;
      const prevExit = parseISO(prev.exit_time).getTime();
      if (prevExit > entry) continue;
      if (prev.pnl_net < 0 && entry - prevExit <= REVENGE_WINDOW_MINUTES * 60_000 && t.qty >= prev.qty) {
        revenge.add(t.id);
      }
      break;
    }
  }

  if (maxTradesPerDay && maxTradesPerDay > 0) {
    const perDay = new Map<string, BehaviorTrade[]>();
    for (const t of byEntry) {
      const d = dayOf(t.entry_time);
      perDay.set(d, [...(perDay.get(d) ?? []), t]);
    }
    for (const dayTrades of perDay.values()) {
      dayTrades.slice(maxTradesPerDay).forEach((t) => overtrading.add(t.id));
    }
  }
  return { revenge, overtrading };
}

/** Manual tags plus automatically detected ones, without duplicates. */
export function effectiveMistakes(trade: BehaviorTrade, flags: DetectedFlags): string[] {
  const set = new Set(trade.mistakes ?? []);
  if (flags.revenge.has(trade.id)) set.add("revenge");
  if (flags.overtrading.has(trade.id)) set.add("overtrading");
  return [...set];
}

export interface TagStats {
  key: string;
  count: number;
  pnl: number;
  winRate: number;
  avgPnl: number;
}

/** Per mistake (or emotion): how often, what it cost/earned, win rate. Sorted by P&L, worst first. */
export function statsByTag(trades: BehaviorTrade[], tagsOf: (t: BehaviorTrade) => string[]): TagStats[] {
  const map = new Map<string, BehaviorTrade[]>();
  for (const t of trades) for (const tag of tagsOf(t)) map.set(tag, [...(map.get(tag) ?? []), t]);
  return [...map.entries()]
    .map(([key, list]) => {
      const pnl = list.reduce((s, t) => s + t.pnl_net, 0);
      return {
        key,
        count: list.length,
        pnl,
        winRate: (list.filter((t) => t.pnl_net > 0).length / list.length) * 100,
        avgPnl: pnl / list.length,
      };
    })
    .sort((a, b) => a.pnl - b.pnl);
}

// --- discipline -------------------------------------------------------------

/** Limit goals ("<=") that work as daily trading rules. */
export const RULE_KEYS: GoalKey[] = ["max_trades", "max_drawdown", "max_losing_streak", "max_losses", "max_worst_trade", "max_risk_per_trade"];

export type RuleState = "ok" | "warning" | "stopped";

export interface RuleStatus {
  key: GoalKey;
  value: number;
  limit: number;
  state: RuleState;
}

/** Today's usage of each enabled rule; "stopped" once a limit is reached, "warning" from 75 %. */
export function todayRuleStatus(goals: TradingGoalsConfig, today: DayGoalResult | undefined): RuleStatus[] {
  return RULE_KEYS.filter((key) => goals[key].enabled && goals[key].target > 0).map((key) => {
    const value = today?.goals[key]?.value ?? 0;
    const limit = goals[key].target;
    const state: RuleState = value >= limit ? "stopped" : value >= limit * 0.75 ? "warning" : "ok";
    return { key, value, limit, state };
  });
}

export interface DisciplineSummary {
  /** Share of trading days in the window without a broken rule and without a revenge trade, 0–100 */
  score: number | null;
  tradingDays: number;
  cleanDays: number;
  /** Per day (oldest first): true = rules kept */
  days: { date: string; kept: boolean }[];
}

export function disciplineSummary(
  goals: TradingGoalsConfig,
  dailyResults: DayGoalResult[],
  revengeDays: Set<string>,
  windowDays = 30,
): DisciplineSummary {
  const rules = RULE_KEYS.filter((key) => goals[key].enabled && goals[key].target > 0);
  const from = format(subDays(new Date(), windowDays - 1), "yyyy-MM-dd");
  const days = dailyResults
    .filter((d) => d.date >= from)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date,
      // a limit counts as broken only when exceeded; reaching it exactly is allowed
      kept: rules.every((key) => d.goals[key].value <= goals[key].target) && !revengeDays.has(d.date),
    }));
  const cleanDays = days.filter((d) => d.kept).length;
  return {
    score: days.length ? Math.round((cleanDays / days.length) * 100) : null,
    tradingDays: days.length,
    cleanDays,
    days,
  };
}

// --- TradeNot.es Score --------------------------------------------------------

export const SCORE_MIN_TRADES = 10;

export interface ScoreComponent {
  key: "winRate" | "profitFactor" | "winLossRatio" | "drawdown" | "recovery" | "consistency";
  /** 0–100 */
  score: number;
  /** the underlying metric, for display */
  raw: number;
}

export interface TradeNotesScore {
  total: number;
  components: ScoreComponent[];
}

const clamp = (v: number) => Math.max(0, Math.min(100, v));

/**
 * Composite 0–100 rating of the trading record. Each component maps a metric
 * onto 0–100 against a target that counts as "very good":
 * win rate 60 %, profit factor 2.5, avg win / avg loss 2.5, drawdown under 10 %
 * of gross profit, recovery factor 3, 70 % green days.
 */
export function tradeNotesScore(trades: { pnl_net: number; exit_time: string }[]): TradeNotesScore | null {
  if (trades.length < SCORE_MIN_TRADES) return null;
  const sorted = [...trades].sort((a, b) => a.exit_time.localeCompare(b.exit_time));
  const wins = sorted.filter((t) => t.pnl_net > 0);
  const losses = sorted.filter((t) => t.pnl_net < 0);
  const grossWin = wins.reduce((s, t) => s + t.pnl_net, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl_net, 0));
  const net = grossWin - grossLoss;

  let equity = 0;
  let peak = 0;
  let maxDd = 0;
  for (const t of sorted) {
    equity += t.pnl_net;
    peak = Math.max(peak, equity);
    maxDd = Math.max(maxDd, peak - equity);
  }

  const daily = new Map<string, number>();
  for (const t of sorted) daily.set(dayOf(t.exit_time), (daily.get(dayOf(t.exit_time)) ?? 0) + t.pnl_net);
  const greenDays = [...daily.values()].filter((v) => v > 0).length / daily.size;

  const winRate = wins.length / sorted.length;
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : grossWin > 0 ? 99 : 0;
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const winLoss = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99 : 0;
  const ddShare = grossWin > 0 ? maxDd / grossWin : 1;
  const recovery = maxDd > 0 ? net / maxDd : net > 0 ? 99 : 0;

  const components: ScoreComponent[] = [
    { key: "winRate", raw: winRate * 100, score: clamp((winRate / 0.6) * 100) },
    { key: "profitFactor", raw: profitFactor, score: clamp((profitFactor / 2.5) * 100) },
    { key: "winLossRatio", raw: winLoss, score: clamp((winLoss / 2.5) * 100) },
    // 0 % drawdown → 100, 10 % → 100, 100 % of gross profit → 0
    { key: "drawdown", raw: ddShare * 100, score: clamp(((1 - ddShare) / 0.9) * 100) },
    { key: "recovery", raw: recovery, score: clamp((recovery / 3) * 100) },
    { key: "consistency", raw: greenDays * 100, score: clamp((greenDays / 0.7) * 100) },
  ];
  const total = Math.round(components.reduce((s, c) => s + c.score, 0) / components.length);
  return { total, components };
}
