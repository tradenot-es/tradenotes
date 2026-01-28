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
    <Card className="hover:shadow-glow transition-all">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div 
            className="flex items-center gap-2 cursor-pointer flex-1"
            onClick={() => navigate("/dashboard/reports?tab=goals")}
          >
            <Target className="h-5 w-5 text-primary" />
            {t("tradingGoals.title")}
          </div>
          <button
            onClick={() => navigate("/dashboard/reports?tab=goals")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Zu Trading Goals"
          >
            <ArrowRight className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-6">
        <TooltipProvider>
          <div className="flex items-center gap-8">
            {/* Weekly Average Score - Radial only, no duplicate text */}
            <div className="flex flex-col items-center">
              <RadialProgress
                value={avgScore}
                size={90}
                strokeWidth={8}
                showPercentage={true}
                color={avgScore >= 75 ? "success" : avgScore >= 50 ? "warning" : "destructive"}
              />
              <span className="text-xs text-muted-foreground mt-2">
                {t("tradingGoals.weeklyAvg")}
              </span>
              <span className="text-xs text-muted-foreground">
                {daysAchieved}/7 {t("tradingGoals.daysAchieved")}
              </span>
            </div>

            {/* Last 7 Days Indicators */}
            <div className="flex items-center gap-3 flex-1 justify-center">
              {Array.from({ length: 7 }).map((_, idx) => {
                const date = subDays(now, 6 - idx);
                const dateStr = format(date, "yyyy-MM-dd");
                const dayResult = dailyResults.find((r) => r.date === dateStr);
                const score = dayResult?.compositeScore || 0;
                const hasTrades = dayResult && dayResult.tradesCount > 0;

                return (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-transform hover:scale-110",
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
                    <span className="text-xs text-muted-foreground">
                      {format(date, "EEE", { locale: de })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Goals Count */}
            <div className="text-center min-w-[60px]">
              <span className="text-3xl font-bold block">{enabledGoalsCount}</span>
              <span className="text-sm text-muted-foreground">{t("tradingGoals.goals")}</span>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
