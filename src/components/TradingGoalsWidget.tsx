import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RadialProgress } from "@/components/RadialProgress";
import { Target, ArrowRight, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DayGoalResult, GoalKey } from "@/types/tradingGoals";
import { format, parseISO, subDays } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TradingGoalsWidgetProps {
  dailyResults: DayGoalResult[];
  enabledGoalsCount: number;
}

export function TradingGoalsWidget({ dailyResults, enabledGoalsCount }: TradingGoalsWidgetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get last 7 days of results
  const now = new Date();
  const last7Days = dailyResults.filter((r) => parseISO(r.date) >= subDays(now, 7));

  const avgScore = last7Days.length > 0
    ? last7Days.reduce((sum, r) => sum + r.compositeScore, 0) / last7Days.length
    : 0;

  const daysAchieved = last7Days.filter((r) => r.compositeScore >= 100).length;

  if (enabledGoalsCount === 0) {
    return (
      <Card className="cursor-pointer hover:shadow-glow transition-all" onClick={() => navigate("/dashboard/settings")}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            {t("tradingGoals.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Settings className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              {t("tradingGoals.noGoalsConfigured")}
            </p>
            <Button variant="outline" size="sm">
              {t("tradingGoals.configureGoals")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="cursor-pointer hover:shadow-glow transition-all" 
      onClick={() => navigate("/dashboard/reports?tab=goals")}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t("tradingGoals.title")}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex items-center gap-6">
            {/* Weekly Average Score */}
            <div className="flex flex-col items-center">
              <RadialProgress
                value={avgScore}
                size={64}
                strokeWidth={5}
                showPercentage={true}
                color={avgScore >= 75 ? "success" : avgScore >= 50 ? "warning" : "destructive"}
              />
              <span className="text-xs text-muted-foreground mt-1">
                {t("tradingGoals.weeklyAvg")}
              </span>
            </div>

            {/* Last 7 Days Mini Indicators */}
            <div className="flex-1">
              <div className="flex gap-1 justify-end">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const date = subDays(now, 6 - idx);
                  const dateStr = format(date, "yyyy-MM-dd");
                  const dayResult = dailyResults.find((r) => r.date === dateStr);
                  const score = dayResult?.compositeScore || 0;
                  const hasTrades = dayResult && dayResult.tradesCount > 0;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold",
                          !hasTrades
                            ? "bg-muted text-muted-foreground"
                            : score >= 100
                            ? "bg-success text-success-foreground"
                            : score >= 75
                            ? "bg-success/70 text-success-foreground"
                            : score >= 50
                            ? "bg-warning text-warning-foreground"
                            : "bg-destructive text-destructive-foreground"
                        )}
                      >
                        {hasTrades ? Math.round(score) : "-"}
                      </div>
                      <span className="text-[9px] text-muted-foreground mt-0.5">
                        {format(date, "EEE", { locale: de })}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{daysAchieved}/7 {t("tradingGoals.daysAchieved")}</span>
                <span>{enabledGoalsCount} {t("tradingGoals.goals")}</span>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
