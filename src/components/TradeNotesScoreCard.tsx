import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Gauge, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCountUp } from "@/hooks/useCountUp";
import { SCORE_MIN_TRADES, ScoreComponent, tradeNotesScore } from "@/lib/behavior";

interface TradeNotesScoreCardProps {
  trades: { pnl_net: number; exit_time: string }[];
}

const formatRaw = (c: ScoreComponent) => {
  switch (c.key) {
    case "winRate":
    case "drawdown":
    case "consistency":
      return `${c.raw.toFixed(0)} %`;
    default:
      return c.raw >= 99 ? "∞" : c.raw.toFixed(2);
  }
};

/** Score band → label key; the number is the headline, the band only names it. */
const band = (total: number) => (total >= 80 ? "excellent" : total >= 60 ? "good" : total >= 40 ? "fair" : "weak");

/**
 * The TradeNot.es Score: one 0–100 rating of the record, shown as a hero number
 * with one meter per component (each component is a ratio against a "very good" target).
 */
export function TradeNotesScoreCard({ trades }: TradeNotesScoreCardProps) {
  const { t } = useTranslation();
  const score = useMemo(() => tradeNotesScore(trades), [trades]);
  const total = useCountUp(score?.total ?? 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" aria-hidden />
          {t("score.title")}
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label={t("score.howTitle")} className="text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-sm">{t("score.how")}</TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>{t("score.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        {!score ? (
          <p className="text-sm text-muted-foreground">
            {t("score.notEnough", { count: SCORE_MIN_TRADES, have: trades.length })}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center sm:pr-6 sm:border-r">
              <p className="tabular text-6xl font-bold leading-none text-primary">{Math.round(total)}</p>
              <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">{t(`score.band.${band(score.total)}`)}</p>
            </div>
            <ul className="space-y-2.5">
              {score.components.map((c, i) => (
                <li key={c.key} className="grid grid-cols-[minmax(6.5rem,9rem)_1fr_3.5rem] items-center gap-3 text-sm">
                  <span className="truncate text-muted-foreground">{t(`score.components.${c.key}`)}</span>
                  <div
                    className="h-2 rounded-full bg-chart-track"
                    role="meter"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(c.score)}
                    aria-label={t(`score.components.${c.key}`)}
                  >
                    <div
                      className="h-full origin-left rounded-full bg-primary animate-grow-x motion-stagger"
                      style={{ width: `${c.score}%`, "--stagger": i } as React.CSSProperties}
                    />
                  </div>
                  <span className="tabular text-right font-medium">{formatRaw(c)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
