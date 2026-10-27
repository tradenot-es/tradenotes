// Live previews of the discipline features for the public features page,
// rendered from the real chart components with fixed example data.
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, Coffee, Eye, Link2, OctagonX } from "lucide-react";
import { DivergingBarList } from "@/components/charts/DivergingBarList";
import { IntradayPnlChart } from "@/components/charts/IntradayPnlChart";
import { cn } from "@/lib/utils";

const usd = (v: number) => `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function DemoFrame({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="relative flex h-full w-full flex-col justify-center bg-card p-5 sm:p-6">
      <span className="absolute right-3 top-3 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        {t("features.demoLabel")}
      </span>
      {children}
    </div>
  );
}

export function DisciplineDemo() {
  const { t } = useTranslation();
  const rules = [
    { key: "maxTrades", value: 5, limit: 6, state: "warning" as const },
    { key: "maxLosingStreak", value: 3, limit: 3, state: "stopped" as const },
    { key: "maxDrawdown", value: 180, limit: 400, state: "ok" as const, money: true },
  ];
  const icon = { ok: CheckCircle2, warning: AlertTriangle, stopped: OctagonX };
  const color = { ok: "bg-primary text-primary", warning: "bg-warning text-warning", stopped: "bg-destructive text-destructive" };
  return (
    <DemoFrame>
      <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <p className="font-semibold text-destructive">{t("discipline.stoppedTitle")}</p>
      </div>
      <ul className="space-y-3">
        {rules.map((r, i) => {
          const Icon = icon[r.state];
          const [bar, text] = color[r.state].split(" ");
          return (
            <li key={r.key} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", text)} aria-hidden />
                  {t(`tradingGoals.${r.key}`)}
                </span>
                <span className="tabular text-muted-foreground">
                  <span className="font-semibold text-foreground">{r.money ? usd(r.value) : r.value}</span> / {r.money ? usd(r.limit) : r.limit}
                </span>
              </div>
              <div className="h-2 rounded-full bg-chart-track">
                <div
                  className={cn("h-full origin-left rounded-full animate-grow-x motion-stagger", bar)}
                  style={{ width: `${(r.value / r.limit) * 100}%`, "--stagger": i } as React.CSSProperties}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </DemoFrame>
  );
}

export function BehaviorDemo() {
  const { t } = useTranslation();
  const items = [
    { key: "revenge", value: -1240, count: 7, win: 14 },
    { key: "moved_stop", value: -860, count: 5, win: 20 },
    { key: "fomo", value: -410, count: 9, win: 33 },
    { key: "early_exit", value: 190, count: 6, win: 67 },
  ];
  return (
    <DemoFrame>
      <DivergingBarList
        label={t("behavior.byMistake")}
        formatValue={usd}
        items={items.map((i) => ({
          key: i.key,
          label: t(`behavior.mistakes.${i.key}`),
          value: i.value,
          detail: t("behavior.tagDetail", { count: i.count, winRate: i.win }),
        }))}
      />
    </DemoFrame>
  );
}

export function DayViewDemo() {
  const { t } = useTranslation();
  const trades = [
    ["09:41", "ES", 225],
    ["10:05", "ES", -150],
    ["10:32", "NQ", 310],
    ["11:10", "NQ", -90],
    ["13:45", "ES", 180],
  ] as const;
  let sum = 0;
  const points = trades.map(([time, symbol, pnl]) => {
    sum += pnl;
    return { time: `2026-10-26T${time}:00`, value: sum, label: `${symbol} ${pnl > 0 ? "+" : ""}${usd(pnl)}` };
  });
  return (
    <DemoFrame>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{t("days.title")}</p>
          <p className="tabular text-2xl font-bold">+{usd(sum)}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          {trades.length} {t("days.trades")} · 60 %
        </p>
      </div>
      <IntradayPnlChart points={points} formatValue={usd} height={140} ariaLabel={t("days.chartLabel", { pnl: usd(sum), count: trades.length })} />
    </DemoFrame>
  );
}

export function ScoreDemo() {
  const { t } = useTranslation();
  const comps = [
    ["winRate", 88, "53 %"],
    ["profitFactor", 74, "1.85"],
    ["winLossRatio", 66, "1.64"],
    ["drawdown", 81, "27 %"],
    ["recovery", 92, "2.76"],
    ["consistency", 83, "58 %"],
  ] as const;
  return (
    <DemoFrame>
      <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <div className="text-center sm:border-r sm:pr-6">
          <p className="tabular text-6xl font-bold leading-none text-primary">81</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{t("score.band.excellent")}</p>
        </div>
        <ul className="space-y-2">
          {comps.map(([key, score, raw], i) => (
            <li key={key} className="grid grid-cols-[minmax(6rem,8rem)_1fr_3rem] items-center gap-2 text-sm">
              <span className="truncate text-muted-foreground">{t(`score.components.${key}`)}</span>
              <div className="h-2 rounded-full bg-chart-track">
                <div
                  className="h-full origin-left rounded-full bg-primary animate-grow-x motion-stagger"
                  style={{ width: `${score}%`, "--stagger": i } as React.CSSProperties}
                />
              </div>
              <span className="tabular text-right">{raw}</span>
            </li>
          ))}
        </ul>
      </div>
    </DemoFrame>
  );
}

/** The break after a losing streak, as the discipline panel shows it. */
export function CooldownDemo() {
  const { t } = useTranslation();
  return (
    <DemoFrame>
      <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
        <Coffee className="h-6 w-6 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t("discipline.cooldownTitle", { count: 2 })}</p>
          <p className="text-muted-foreground">{t("discipline.cooldownText", { time: "15:42" })}</p>
        </div>
        <span className="tabular text-3xl font-bold text-warning">18:24</span>
      </div>
      <div className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
        <p className="font-medium">{t("discipline.cooldownIgnored", { count: 1 })}</p>
      </div>
    </DemoFrame>
  );
}

/** Mentor mode: the share link and what the mentor sees. */
export function MentorDemo() {
  const { t } = useTranslation();
  return (
    <DemoFrame>
      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
        <Link2 className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate font-mono text-xs text-muted-foreground">tradenot.es/share/q7pZl7G5vsxog…</span>
      </div>
      <div className="mt-3 rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">{t("share.sharedBy", { name: "Alex" })}</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">NQ</p>
            <p className="text-xs text-muted-foreground">Long · Opening Range · 2 × 25.412,50 → 25.431,75</p>
          </div>
          <p className="tabular text-2xl font-bold text-success">+$770</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Eye className="h-3.5 w-3.5" aria-hidden />
        {t("share.views", { count: 3, time: "12 min" })}
      </p>
    </DemoFrame>
  );
}
