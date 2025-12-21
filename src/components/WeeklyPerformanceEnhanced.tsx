import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startOfWeek, endOfWeek, format, eachDayOfInterval, isToday, isSameWeek } from "date-fns";
import { useTranslation } from "react-i18next";
import { Calendar, TrendingUp, Target, Award, BarChart3 } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { de, enUS, fr, es, nl } from "date-fns/locale";

interface Trade {
  id: string;
  pnl_net: number;
  exit_time: string;
}

interface WeeklyPerformanceEnhancedProps {
  trades: Trade[];
}

export function WeeklyPerformanceEnhanced({ trades }: WeeklyPerformanceEnhancedProps) {
  const { t, i18n } = useTranslation();
  const { formatCurrency } = useCurrency();
  
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      case 'es': return es;
      case 'nl': return nl;
      default: return enUS;
    }
  };

  // Filter trades for current week
  const weekTrades = trades.filter(trade => {
    const tradeDate = new Date(trade.exit_time);
    return isSameWeek(tradeDate, now, { weekStartsOn: 1 });
  });

  const totalPnL = weekTrades.reduce((sum, t) => sum + t.pnl_net, 0);
  const winningTrades = weekTrades.filter(t => t.pnl_net > 0);
  const losingTrades = weekTrades.filter(t => t.pnl_net < 0);
  const winRate = weekTrades.length > 0 ? (winningTrades.length / weekTrades.length) * 100 : 0;
  
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl_net, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl_net, 0));
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  
  const avgTrade = weekTrades.length > 0 ? totalPnL / weekTrades.length : 0;

  // Get daily breakdown
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const getDayPnL = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return trades
      .filter(trade => format(new Date(trade.exit_time), 'yyyy-MM-dd') === dateStr)
      .reduce((sum, t) => sum + t.pnl_net, 0);
  };

  const getDayTradeCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return trades
      .filter(trade => format(new Date(trade.exit_time), 'yyyy-MM-dd') === dateStr)
      .length;
  };

  // Count trading days this week
  const tradingDays = weekDays.filter(day => getDayTradeCount(day) > 0).length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {t("dashboard.thisWeek")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main P&L Display */}
        <div className="text-center pb-3 border-b border-border/50">
          <p className="text-xs text-muted-foreground mb-1">
            {format(weekStart, 'MMM d', { locale: getLocale() })} - {format(weekEnd, 'MMM d', { locale: getLocale() })}
          </p>
          <p className={`text-3xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(totalPnL)}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("dashboard.winRate")}</span>
            </div>
            <p className={`text-sm font-bold ${winRate >= 50 ? 'text-success' : 'text-destructive'}`}>
              {winRate.toFixed(0)}%
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("dashboard.profitFactor")}</span>
            </div>
            <p className={`text-sm font-bold ${profitFactor >= 1 ? 'text-success' : 'text-destructive'}`}>
              {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("dashboard.tradingDays")}</span>
            </div>
            <p className="text-sm font-bold text-foreground">{tradingDays}</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t("dashboard.avgTrade")}</span>
            </div>
            <p className={`text-sm font-bold ${avgTrade >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(avgTrade)}
            </p>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {t("dashboard.dailyBreakdown")}
          </p>
          {weekDays.map((day, idx) => {
            const dayPnL = getDayPnL(day);
            const tradeCount = getDayTradeCount(day);
            const isTodayDate = isToday(day);
            
            return (
              <div
                key={idx}
                className={`
                  flex items-center justify-between py-1.5 px-2 rounded
                  ${isTodayDate ? 'bg-primary/10 border border-primary/30' : 'hover:bg-muted/30'}
                  transition-colors
                `}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium min-w-[32px] ${isTodayDate ? 'text-primary' : 'text-muted-foreground'}`}>
                    {format(day, 'EEE', { locale: getLocale() })}
                  </span>
                  {tradeCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {tradeCount} {tradeCount === 1 ? 'trade' : 'trades'}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-semibold ${
                  tradeCount === 0 
                    ? 'text-muted-foreground' 
                    : dayPnL >= 0 
                      ? 'text-success' 
                      : 'text-destructive'
                }`}>
                  {tradeCount === 0 ? '-' : formatCurrency(dayPnL)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
