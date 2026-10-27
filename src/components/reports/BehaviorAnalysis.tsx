import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Brain, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DivergingBarList } from "@/components/charts/DivergingBarList";
import { useCurrency } from "@/hooks/useCurrency";
import { BehaviorTrade, detectPatterns, effectiveMistakes, statsByTag } from "@/lib/behavior";

interface BehaviorAnalysisProps {
  trades: BehaviorTrade[];
  /** daily trade limit from the goals, if enabled; drives overtrading detection */
  maxTradesPerDay?: number;
}

/** What mistakes and emotional states cost: P&L, frequency and win rate per tag. */
export function BehaviorAnalysis({ trades, maxTradesPerDay }: BehaviorAnalysisProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const analysis = useMemo(() => {
    const flags = detectPatterns(trades, maxTradesPerDay);
    const mistakesOf = (tr: BehaviorTrade) => effectiveMistakes(tr, flags);
    const withMistakes = trades.filter((tr) => mistakesOf(tr).length > 0);
    const clean = trades.filter((tr) => mistakesOf(tr).length === 0);
    const avg = (list: BehaviorTrade[]) => (list.length ? list.reduce((s, tr) => s + tr.pnl_net, 0) / list.length : 0);
    return {
      mistakes: statsByTag(trades, mistakesOf),
      emotions: statsByTag(trades, (tr) => tr.emotions ?? []),
      mistakePnl: withMistakes.reduce((s, tr) => s + tr.pnl_net, 0),
      mistakeShare: trades.length ? (withMistakes.length / trades.length) * 100 : 0,
      avgWithMistakes: avg(withMistakes),
      avgClean: avg(clean),
      withMistakesCount: withMistakes.length,
      autoDetected: flags.revenge.size + flags.overtrading.size,
    };
  }, [trades, maxTradesPerDay]);

  const detail = (count: number, winRate: number) =>
    t("behavior.tagDetail", { count, winRate: winRate.toFixed(0) });

  if (analysis.mistakes.length === 0 && analysis.emotions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t("behavior.reportTitle")}
          </CardTitle>
          <CardDescription>{t("behavior.reportEmpty")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* headline: cost of mistakes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 animate-rise-in">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" aria-hidden />
              {t("behavior.mistakeCost")}
            </p>
            <p className="tabular mt-2 text-4xl font-bold">{formatCurrency(analysis.mistakePnl)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("behavior.mistakeShare", { count: analysis.withMistakesCount, share: analysis.mistakeShare.toFixed(0) })}
            </p>
          </CardContent>
        </Card>
        <Card className="animate-rise-in motion-stagger" style={{ "--stagger": 1 } as React.CSSProperties}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("behavior.avgClean")}</p>
            <p className="tabular mt-2 text-2xl font-semibold">{formatCurrency(analysis.avgClean)}</p>
            <p className="mt-3 text-sm text-muted-foreground">{t("behavior.avgWithMistakes")}</p>
            <p className="tabular mt-1 text-2xl font-semibold">{formatCurrency(analysis.avgWithMistakes)}</p>
          </CardContent>
        </Card>
        <Card className="animate-rise-in motion-stagger" style={{ "--stagger": 2 } as React.CSSProperties}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t("behavior.autoDetected")}</p>
            <p className="tabular mt-2 text-2xl font-semibold">{analysis.autoDetected}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("behavior.autoDetectedHint")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("behavior.byMistake")}</CardTitle>
            <CardDescription>{t("behavior.byMistakeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.mistakes.length ? (
              <DivergingBarList
                label={t("behavior.byMistake")}
                formatValue={formatCurrency}
                items={analysis.mistakes.map((m) => ({
                  key: m.key,
                  label: t(`behavior.mistakes.${m.key}`),
                  value: m.pnl,
                  detail: detail(m.count, m.winRate),
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("behavior.noMistakes")}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("behavior.byEmotion")}</CardTitle>
            <CardDescription>{t("behavior.byEmotionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.emotions.length ? (
              <DivergingBarList
                label={t("behavior.byEmotion")}
                formatValue={formatCurrency}
                items={analysis.emotions.map((e) => ({
                  key: e.key,
                  label: t(`behavior.emotions.${e.key}`),
                  value: e.pnl,
                  detail: detail(e.count, e.winRate),
                }))}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{t("behavior.noEmotions")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
