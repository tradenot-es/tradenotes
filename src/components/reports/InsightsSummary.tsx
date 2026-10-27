import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb, ThumbsDown, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { INSIGHT_MIN_TRADES, Insight, InsightTrade, strengthsAndWeaknesses } from "@/lib/insights";

interface InsightsSummaryProps {
  trades: InsightTrade[];
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Rule-based "what works for you": the best and worst setups, weekdays, hours, symbols and directions. */
export function InsightsSummary({ trades }: InsightsSummaryProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const { strengths, weaknesses } = useMemo(() => strengthsAndWeaknesses(trades), [trades]);

  const subject = (i: Insight) => {
    switch (i.dimension) {
      case "weekday":
        return t(`reports.${WEEKDAYS[Number(i.key)]}`);
      case "hour":
        return t("insights.hourRange", { from: i.key.padStart(2, "0"), to: String((Number(i.key) + 1) % 24).padStart(2, "0") });
      case "side":
        return t(`insights.side.${i.key}`);
      default:
        return i.key;
    }
  };

  const item = (i: Insight, positive: boolean, index: number) => (
    <li
      key={`${i.dimension}-${i.key}`}
      className="flex items-start justify-between gap-3 rounded-lg border p-3 animate-rise-in motion-stagger"
      style={{ "--stagger": index } as React.CSSProperties}
    >
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{t(`insights.dimension.${i.dimension}`)}</p>
        <p className="truncate font-semibold">{subject(i)}</p>
        <p className="text-xs text-muted-foreground">
          {t("insights.detail", { count: i.count, winRate: i.winRate.toFixed(0), avg: formatCurrency(i.avgPnl) })}
        </p>
      </div>
      <span className={cn("tabular shrink-0 font-bold", positive ? "text-success" : "text-destructive")}>
        {i.pnl > 0 ? "+" : ""}
        {formatCurrency(i.pnl)}
      </span>
    </li>
  );

  const column = (list: Insight[], positive: boolean) => (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        {positive ? (
          <ThumbsUp className="h-4 w-4 text-success" aria-hidden />
        ) : (
          <ThumbsDown className="h-4 w-4 text-destructive" aria-hidden />
        )}
        {t(positive ? "insights.strengths" : "insights.weaknesses")}
      </h3>
      {list.length ? (
        <ul className="space-y-2">{list.map((i, idx) => item(i, positive, idx))}</ul>
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          {t(positive ? "insights.noStrengths" : "insights.noWeaknesses")}
        </p>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" aria-hidden />
          {t("insights.title")}
        </CardTitle>
        <CardDescription>{t("insights.subtitle", { min: INSIGHT_MIN_TRADES })}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        {column(strengths, true)}
        {column(weaknesses, false)}
      </CardContent>
    </Card>
  );
}
