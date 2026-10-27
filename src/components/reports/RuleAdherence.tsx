import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ClipboardCheck, SlidersHorizontal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DivergingBarList } from "@/components/charts/DivergingBarList";
import { useCurrency } from "@/hooks/useCurrency";
import { cn } from "@/lib/utils";
import { AdherenceTrade, Quadrant, adherenceReport } from "@/lib/insights";

interface RuleAdherenceProps {
  trades: AdherenceTrade[];
}

type QuadrantKey = "goodWin" | "goodLoss" | "badWin" | "badLoss";

const QUADRANT_STYLE: Record<QuadrantKey, string> = {
  goodWin: "border-primary/40 bg-primary/10",
  goodLoss: "border-border bg-muted/40",
  badWin: "border-warning/40 bg-warning/10",
  badLoss: "border-destructive/40 bg-destructive/10",
};

/**
 * Process vs. outcome: did the trade follow its setup checklist, and did it win?
 * Separates good decisions from lucky ones, per setup too.
 */
export function RuleAdherence({ trades }: RuleAdherenceProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const report = useMemo(() => adherenceReport(trades), [trades]);

  if (report.rated === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
            {t("adherence.title")}
          </CardTitle>
          <CardDescription>{t("adherence.empty")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/dashboard/settings">
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              {t("adherence.defineChecklists")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const quadrant = (key: QuadrantKey, q: Quadrant) => (
    <div key={key} className={cn("rounded-lg border p-4 animate-rise-in", QUADRANT_STYLE[key])}>
      <p className="text-sm font-semibold">{t(`adherence.matrix.${key}`)}</p>
      <p className="text-xs text-muted-foreground">{t(`adherence.matrix.${key}Hint`)}</p>
      <p className="tabular mt-3 text-2xl font-bold">{q.count}</p>
      <p className="tabular text-sm text-muted-foreground">
        {q.pnl > 0 ? "+" : ""}
        {formatCurrency(q.pnl)}
      </p>
    </div>
  );

  const groups = (["followed", "partial", "broken"] as const)
    .map((key) => ({ key, g: report[key] }))
    .filter((x) => x.g !== null)
    .map(({ key, g }) => ({
      key,
      label: t(`adherence.groups.${key}`),
      value: g!.avgPnl,
      detail: t("behavior.tagDetail", { count: g!.count, winRate: g!.winRate.toFixed(0) }),
    }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden />
            {t("adherence.title")}
          </CardTitle>
          <CardDescription>{t("adherence.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(12rem,1fr)_2fr]">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{t("adherence.rate")}</p>
            <p className="tabular text-5xl font-bold leading-tight">{Math.round(report.adherence)}%</p>
            <p className="text-sm text-muted-foreground">
              {t("adherence.rateDetail", {
                followed: report.followed?.count ?? 0,
                rated: report.rated,
              })}
            </p>
            {report.unrated > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">{t("adherence.unrated", { count: report.unrated })}</p>
            )}
          </div>
          {/* rows: process (rules followed or not), columns: outcome */}
          <div className="grid grid-cols-2 gap-3" role="group" aria-label={t("adherence.matrixLabel")}>
            {quadrant("goodWin", report.matrix.goodWin)}
            {quadrant("goodLoss", report.matrix.goodLoss)}
            {quadrant("badWin", report.matrix.badWin)}
            {quadrant("badLoss", report.matrix.badLoss)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("adherence.avgByGroup")}</CardTitle>
            <CardDescription>{t("adherence.avgByGroupHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DivergingBarList items={groups} formatValue={formatCurrency} label={t("adherence.avgByGroup")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("adherence.bySetup")}</CardTitle>
            <CardDescription>{t("adherence.bySetupHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="py-2 text-left font-medium">{t("adherence.setup")}</th>
                    <th className="py-2 text-right font-medium">{t("adherence.rate")}</th>
                    <th className="py-2 text-right font-medium">{t("adherence.avgFollowed")}</th>
                    <th className="py-2 text-right font-medium">{t("adherence.avgNotFollowed")}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.bySetup.map((s) => (
                    <tr key={s.setup} className="border-b last:border-0">
                      <td className="py-2.5">
                        <p className="font-medium">{s.setup}</p>
                        <p className="text-xs text-muted-foreground">{t("adherence.tradesCount", { count: s.rated })}</p>
                      </td>
                      <td className="tabular py-2.5 text-right">{Math.round(s.adherence)}%</td>
                      <td className="tabular py-2.5 text-right">{s.followed ? formatCurrency(s.followed.avgPnl) : "–"}</td>
                      <td className="tabular py-2.5 text-right">{s.notFollowed ? formatCurrency(s.notFollowed.avgPnl) : "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
