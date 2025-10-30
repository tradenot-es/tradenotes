import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Daily Goal Progress
          </CardTitle>
          {goalAchieved && (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Ziel erreicht
            </Badge>
          )}
          {overTraded && (
            <Badge variant="destructive" className="gap-1">
              <XCircle className="h-3 w-3" />
              Übertrieben
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PnL Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Täglicher P&L</span>
            <span className={`font-bold ${dailyPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
              ${dailyPnL.toFixed(2)} / ${goalAmount.toFixed(2)}
            </span>
          </div>
          <Progress 
            value={Math.max(0, goalProgress)} 
            className="h-3"
          />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            {goalProgress.toFixed(0)}% des Ziels erreicht
          </div>
        </div>

        {/* Trades Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trades heute</span>
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
              ? `Noch ${maxTrades - dailyTrades} Trades verfügbar`
              : overTraded 
                ? `${dailyTrades - maxTrades} Trades über Limit`
                : 'Limit erreicht'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
