import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, OctagonX, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrency } from "@/hooks/useCurrency";
import { useCountUp } from "@/hooks/useCountUp";
import { cn } from "@/lib/utils";
import type { DayGoalResult, GoalKey, TradingGoalsConfig } from "@/types/tradingGoals";
import { BehaviorTrade, RuleState, detectPatterns, disciplineSummary, todayRuleStatus } from "@/lib/behavior";

interface DisciplinePanelProps {
  trades: BehaviorTrade[];
  goals: TradingGoalsConfig;
  dailyResults: DayGoalResult[];
}

const LABEL_KEYS: Partial<Record<GoalKey, string>> = {
  max_trades: "tradingGoals.maxTrades",
  max_drawdown: "tradingGoals.maxDrawdown",
  max_losing_streak: "tradingGoals.maxLosingStreak",
  max_losses: "tradingGoals.maxLosses",
  max_worst_trade: "tradingGoals.maxWorstTrade",
  max_risk_per_trade: "tradingGoals.maxRiskPerTrade",
};
const MONEY_RULES: GoalKey[] = ["max_drawdown", "max_worst_trade", "max_risk_per_trade"];

const STATE_STYLE: Record<RuleState, { bar: string; text: string; icon: typeof CheckCircle2 }> = {
  ok: { bar: "bg-primary", text: "text-primary", icon: CheckCircle2 },
  warning: { bar: "bg-warning", text: "text-warning", icon: AlertTriangle },
  stopped: { bar: "bg-destructive", text: "text-destructive", icon: OctagonX },
};

/**
 * Today's trading rules (the limit goals) with live usage, a stop banner once a
 * limit is reached, and the 30-day discipline score. Rules are not enforced at
 * the broker; the panel makes breaking them visible.
 */
export function DisciplinePanel({ trades, goals, dailyResults }: DisciplinePanelProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const todayKey = format(new Date(), "yyyy-MM-dd");

  const { rules, overall, summary, revengeToday } = useMemo(() => {
    const flags = detectPatterns(trades, goals.max_trades.enabled ? goals.max_trades.target : undefined);
    const revengeDays = new Set(
      trades.filter((tr) => flags.revenge.has(tr.id)).map((tr) => format(parseISO(tr.entry_time), "yyyy-MM-dd")),
    );
    const rules = todayRuleStatus(goals, dailyResults.find((d) => d.date === todayKey));
    const overall: RuleState = rules.some((r) => r.state === "stopped")
      ? "stopped"
      : rules.some((r) => r.state === "warning")
        ? "warning"
        : "ok";
    return {
      rules,
      overall,
      summary: disciplineSummary(goals, dailyResults, revengeDays),
      revengeToday: trades.filter((tr) => flags.revenge.has(tr.id) && tr.entry_time.startsWith(todayKey)).length,
    };
  }, [trades, goals, dailyResults, todayKey]);

  const score = useCountUp(summary.score ?? 0);
  const StatusIcon = STATE_STYLE[overall].icon;

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-col-reverse items-start gap-2 sm:flex-row sm:justify-between sm:gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              {t("discipline.title")}
            </CardTitle>
            <CardDescription>{t("discipline.subtitle")}</CardDescription>
          </div>
          {rules.length > 0 && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                overall === "stopped" && "border-destructive/50 bg-destructive/10 text-destructive",
                overall === "warning" && "border-warning/50 bg-warning/10 text-warning",
                overall === "ok" && "border-primary/40 bg-primary/10 text-primary",
              )}
            >
              <StatusIcon className="h-3.5 w-3.5" aria-hidden />
              {t(`discipline.state.${overall}`)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {overall === "stopped" && (
          <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm animate-rise-in">
            <p className="font-semibold text-destructive">{t("discipline.stoppedTitle")}</p>
            <p className="mt-1 text-muted-foreground">{t("discipline.stoppedText")}</p>
          </div>
        )}
        {revengeToday > 0 && (
          <div role="status" className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
            <p className="font-medium">{t("discipline.revengeToday", { count: revengeToday })}</p>
          </div>
        )}

        {rules.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm">
            <p className="text-muted-foreground">{t("discipline.noRules")}</p>
            <Button asChild variant="outline" size="sm" className="mt-3 gap-2">
              <Link to="/dashboard/settings#trading-goals">
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                {t("discipline.setRules")}
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {rules.map((rule, i) => {
              const style = STATE_STYLE[rule.state];
              const fmt = (v: number) => (MONEY_RULES.includes(rule.key) ? formatCurrency(v) : String(Math.round(v)));
              return (
                <li key={rule.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5">
                      <style.icon className={cn("h-3.5 w-3.5", style.text)} aria-hidden />
                      {t(LABEL_KEYS[rule.key]!)}
                    </span>
                    <span className="tabular text-muted-foreground">
                      <span className="font-semibold text-foreground">{fmt(rule.value)}</span> / {fmt(rule.limit)}
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full bg-chart-track"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={rule.limit}
                    aria-valuenow={rule.value}
                    aria-label={t(LABEL_KEYS[rule.key]!)}
                  >
                    <div
                      className={cn("h-full origin-left rounded-full animate-grow-x motion-stagger", style.bar)}
                      style={{ width: `${Math.min(100, (rule.value / rule.limit) * 100)}%`, "--stagger": i } as React.CSSProperties}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {summary.score !== null && (
          <div className="border-t pt-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("discipline.scoreLabel")}</p>
                <p className="tabular text-4xl font-bold leading-tight">{Math.round(score)}%</p>
                <p className="text-xs text-muted-foreground">
                  {t("discipline.scoreDetail", { clean: summary.cleanDays, total: summary.tradingDays })}
                </p>
              </div>
              {/* one cell per trading day in the last 30 days */}
              <div className="flex max-w-[60%] flex-wrap justify-end gap-1" aria-label={t("discipline.daysStrip")}>
                {summary.days.map((d) => (
                  <Tooltip key={d.date}>
                    <TooltipTrigger asChild>
                      <span
                        className={cn(
                          "block h-3.5 w-3.5 rounded-[3px] transition-transform hover:scale-125",
                          d.kept ? "bg-chart-profit" : "bg-chart-loss",
                        )}
                        aria-label={`${d.date}: ${d.kept ? t("discipline.dayKept") : t("discipline.dayBroken")}`}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {format(parseISO(d.date), "dd.MM.yyyy")} · {d.kept ? t("discipline.dayKept") : t("discipline.dayBroken")}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
