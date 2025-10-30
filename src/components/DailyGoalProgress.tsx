import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadialProgress } from "@/components/RadialProgress";
import { Target, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DailyGoalProgressProps {
  dailyPnL: number;
  dailyTrades: number;
  goalAmount: number;
  maxTrades: number;
  date: string;
}

export function DailyGoalProgress({ 
  dailyPnL, 
  dailyTrades, 
  goalAmount, 
  maxTrades,
  date 
}: DailyGoalProgressProps) {
  const { t } = useTranslation();
  
  const goalProgress = Math.min((dailyPnL / goalAmount) * 100, 100);
  const tradesProgress = (dailyTrades / maxTrades) * 100;
  const goalAchieved = dailyPnL >= goalAmount && dailyTrades <= maxTrades;
  const overTraded = dailyTrades > maxTrades;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Goal Progress
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(date).toLocaleDateString('de-DE', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex gap-2">
            {goalAchieved && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {t("reports.goalAchieved")}
              </Badge>
            )}
            {overTraded && (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                {t("reports.overtraded")}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Radial Progress for Goal */}
          <div className="flex flex-col items-center justify-center">
            <RadialProgress
              value={Math.max(0, Math.min(100, goalProgress))}
              size={140}
              strokeWidth={10}
              label="Goal Progress"
              color="warning"
            />
            <div className="mt-4 text-center">
              <div className={`text-lg font-bold ${dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${dailyPnL.toFixed(2)} / ${goalAmount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t("reports.dailyPnl")}
              </div>
            </div>
          </div>

          {/* Trades Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("reports.tradesToday")}</span>
                <span className={`font-bold ${overTraded ? 'text-destructive' : 'text-foreground'}`}>
                  {dailyTrades} / {maxTrades}
                </span>
              </div>
              <Progress 
                value={tradesProgress} 
                className={`h-3 ${overTraded ? '[&>div]:bg-destructive' : ''}`}
              />
              <div className="text-xs text-muted-foreground">
                {maxTrades - dailyTrades > 0 
                  ? t("reports.tradesRemaining", { remaining: maxTrades - dailyTrades })
                  : overTraded 
                    ? t("reports.tradesOverLimit", { over: dailyTrades - maxTrades })
                    : t("reports.limitReached")
                }
              </div>
            </div>

            {goalAchieved && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="flex items-center gap-2 text-success text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">{t("reports.goalAchievedPerfect")}</span>
                </div>
              </div>
            )}

            {overTraded && !goalAchieved && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">{t("reports.goalNotAchievedOvertraded")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
