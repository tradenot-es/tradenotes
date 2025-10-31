import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { startOfWeek, endOfWeek, format, eachWeekOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { useTranslation } from "react-i18next";
import { Calendar, Info } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

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
  const { formatCurrency } = useCurrency();
  
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
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">
                Wöchentliche Performance-Übersicht für den ausgewählten Monat. 
                Zeigt P&L, Anzahl der Trades und Win Rate pro Woche.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
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
                  {formatCurrency(stats.totalPnL)}
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
