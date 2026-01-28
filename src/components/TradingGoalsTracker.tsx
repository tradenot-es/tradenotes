import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoalRadialCell } from "@/components/GoalRadialCell";
import { RadialProgress } from "@/components/RadialProgress";
import { Settings, Target, TrendingUp, Calendar } from "lucide-react";
import { format, parseISO, subDays, subWeeks, subMonths } from "date-fns";
import { de, enUS, fr, es, nl, it } from "date-fns/locale";
import { useCurrency } from "@/hooks/useCurrency";
import { GoalKey, TradingGoalsConfig, DayGoalResult } from "@/types/tradingGoals";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const getLocale = (lang: string) => {
  switch (lang) {
    case 'de': return de;
    case 'fr': return fr;
    case 'es': return es;
    case 'nl': return nl;
    case 'it': return it;
    default: return enUS;
  }
};

interface TradingGoalsTrackerProps {
  dailyResults: DayGoalResult[];
  enabledGoals: [GoalKey, { enabled: boolean; target: number; operator: ">=" | "<=" }][];
  goals: TradingGoalsConfig;
}

const goalLabels: Record<GoalKey, string> = {
  daily_pnl: "PnL",
  max_trades: "Trades",
  min_win_rate: "Win%",
  max_drawdown: "DD",
  max_commissions: "Fees",
  min_avg_r: "Avg R",
  max_losing_streak: "L-Streak",
  min_profit_factor: "PF",
};

export function TradingGoalsTracker({
  dailyResults,
  enabledGoals,
  goals,
}: TradingGoalsTrackerProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [timeFilter, setTimeFilter] = useState<string>("30d");
  const currentLocale = getLocale(i18n.language);

  const filteredResults = dailyResults.filter((result) => {
    const date = parseISO(result.date);
    const now = new Date();
    
    switch (timeFilter) {
      case "7d":
        return date >= subDays(now, 7);
      case "14d":
        return date >= subDays(now, 14);
      case "30d":
        return date >= subDays(now, 30);
      case "3m":
        return date >= subMonths(now, 3);
      case "all":
      default:
        return true;
    }
  });

  const avgComposite = filteredResults.length > 0
    ? filteredResults.reduce((sum, r) => sum + r.compositeScore, 0) / filteredResults.length
    : 0;

  const daysAchieved = filteredResults.filter((r) => r.compositeScore >= 100).length;

  const formatGoalValue = (key: GoalKey, value: number): string => {
    switch (key) {
      case "daily_pnl":
      case "max_drawdown":
      case "max_commissions":
        return formatCurrency(value);
      case "min_win_rate":
        return `${value.toFixed(1)}%`;
      case "min_avg_r":
      case "min_profit_factor":
        return value.toFixed(2);
      default:
        return Math.round(value).toString();
    }
  };

  if (enabledGoals.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">{t("tradingGoals.noGoalsConfigured")}</p>
          <Button onClick={() => navigate("/dashboard/settings")} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            {t("tradingGoals.configureGoals")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t("tradingGoals.title")}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("tradingGoals.description")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 {t("common.days")}</SelectItem>
                  <SelectItem value="14d">14 {t("common.days")}</SelectItem>
                  <SelectItem value="30d">30 {t("common.days")}</SelectItem>
                  <SelectItem value="3m">3 {t("common.months")}</SelectItem>
                  <SelectItem value="all">{t("reports.allTime")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <RadialProgress
                value={avgComposite}
                size={80}
                strokeWidth={6}
                color={avgComposite >= 75 ? "success" : avgComposite >= 50 ? "warning" : "destructive"}
              />
              <div className="mt-2 text-sm font-medium">{t("tradingGoals.avgScore")}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-success">{daysAchieved}</div>
              <div className="text-sm text-muted-foreground">{t("tradingGoals.daysAchieved")}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold">{filteredResults.length}</div>
              <div className="text-sm text-muted-foreground">{t("tradingGoals.tradingDays")}</div>
            </div>
            <button
              onClick={() => navigate("/dashboard/settings")}
              className="p-4 rounded-lg bg-muted/50 flex flex-col items-center justify-center hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="text-3xl font-bold">{enabledGoals.length}</div>
              <div className="text-sm text-muted-foreground">{t("tradingGoals.activeGoals")}</div>
            </button>
          </div>

          {/* Goals Matrix Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">{t("common.date")}</TableHead>
                  {enabledGoals.map(([key, config]) => (
                    <TableHead key={key} className="text-center min-w-[60px]">
                      <div className="text-xs">
                        {goalLabels[key]}
                        <div className="text-[10px] text-muted-foreground">
                          {config.operator}{formatGoalValue(key, config.target)}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[70px]">{t("tradingGoals.totalGoal")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResults.slice(0, 20).map((result) => (
                  <TableRow key={result.date}>
                    <TableCell className="font-medium text-sm">
                      {format(parseISO(result.date), "dd. MMM", { locale: currentLocale })}
                    </TableCell>
                    {enabledGoals.map(([key, config]) => (
                      <TableCell key={key} className="p-1">
                        <GoalRadialCell
                          percentage={result.goals[key].percentage}
                          value={result.goals[key].value}
                          achieved={result.goals[key].achieved}
                          label={goalLabels[key]}
                          operator={config.operator}
                          target={config.target}
                          formatValue={(v) => formatGoalValue(key, v)}
                        />
                      </TableCell>
                    ))}
                    <TableCell className="p-1">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg p-2 font-bold text-sm",
                          result.compositeScore >= 100
                            ? "bg-success/20 text-success"
                            : result.compositeScore >= 75
                            ? "bg-success/10 text-success"
                            : result.compositeScore >= 50
                            ? "bg-warning/20 text-warning"
                            : "bg-destructive/20 text-destructive"
                        )}
                      >
                        {Math.round(result.compositeScore)}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredResults.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("reports.noTradesInPeriod")}
            </div>
          )}

          {filteredResults.length > 20 && (
            <div className="text-center text-sm text-muted-foreground">
              {t("tradingGoals.showingDays", { shown: 20, total: filteredResults.length })}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
