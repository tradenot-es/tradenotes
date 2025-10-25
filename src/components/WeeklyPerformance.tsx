import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfWeek, endOfWeek, format, eachWeekOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { useTranslation } from "react-i18next";

interface Trade {
  id: string;
  pnl_net: number;
  exit_time: string;
}

interface WeeklyPerformanceProps {
  trades: Trade[];
  currentMonth: Date;
}

export function WeeklyPerformance({ trades, currentMonth }: WeeklyPerformanceProps) {
  const { t } = useTranslation();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 0 }
  );

  const getWeekStats = (weekStart: Date) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
    
    const weekTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.exit_time);
      return tradeDate >= weekStart && tradeDate <= weekEnd;
    });

    const totalPnL = weekTrades.reduce((sum, t) => sum + t.pnl_net, 0);
    const winningTrades = weekTrades.filter(t => t.pnl_net > 0).length;
    const totalTrades = weekTrades.length;

    return {
      weekNumber: weeks.indexOf(weekStart) + 1,
      totalPnL,
      totalTrades,
      winningTrades,
      winRate: totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(0) : "0"
    };
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {format(currentMonth, 'MMMM yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {weeks.map((week, idx) => {
          const stats = getWeekStats(week);
          
          return (
            <div
              key={idx}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Week {stats.weekNumber}
                </span>
                <span className={`text-lg font-bold ${
                  stats.totalPnL >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  ${stats.totalPnL.toFixed(2)}
                </span>
              </div>
              
              {stats.totalTrades > 0 && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{stats.totalTrades} trades</span>
                  <span>{stats.winRate}% win rate</span>
                </div>
              )}
            </div>
          );
        })}

        {weeks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("dashboard.noWeeks")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
