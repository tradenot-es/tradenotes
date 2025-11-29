import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendingUp, Info } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface Trade {
  exit_time: string;
  pnl_net: number;
}

interface ConsistencyTrackerProps {
  trades: Trade[];
}

export function ConsistencyTracker({ trades }: ConsistencyTrackerProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    navigate(`/dashboard/trades?date=${dateStr}`);
  };

  // Get calendar weeks structure (Monday to Sunday)
  const getCalendarWeeks = () => {
    const today = new Date();
    const weeks: Date[][] = [];
    
    // Find the most recent Sunday (end of current week)
    const currentDay = today.getDay();
    const daysToSunday = currentDay === 0 ? 0 : 7 - currentDay;
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysToSunday);
    endDate.setHours(0, 0, 0, 0);
    
    // Generate 26 weeks backwards
    for (let weekIndex = 0; weekIndex < 26; weekIndex++) {
      const week: Date[] = [];
      
      // Each week: Monday (1) to Sunday (7)
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(endDate);
        date.setDate(endDate.getDate() - (weekIndex * 7) - (6 - dayIndex));
        week.push(date);
      }
      
      weeks.unshift(week); // Add to beginning so oldest week is first
    }
    
    return weeks;
  };

  const weeks = getCalendarWeeks();
  
  // Build trade data map
  const tradeDataMap: { [key: string]: { count: number; pnl: number } } = {};
  trades.forEach(trade => {
    const date = new Date(trade.exit_time).toISOString().split('T')[0];
    if (!tradeDataMap[date]) {
      tradeDataMap[date] = { count: 0, pnl: 0 };
    }
    tradeDataMap[date].count++;
    tradeDataMap[date].pnl += trade.pnl_net;
  });
  
  const maxTrades = Math.max(...Object.values(tradeDataMap).map(d => d.count), 1);

  // Calculate statistics
  const calculateStats = () => {
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    const dayOfWeekCounts: { [key: number]: number } = {};
    let totalTrades = 0;
    let daysWithTrades = 0;

    // Flatten all dates from weeks
    const allDates = weeks.flat();
    
    allDates.forEach(date => {
      const dateKey = date.toISOString().split('T')[0];
      const data = tradeDataMap[dateKey] || { count: 0, pnl: 0 };
      
      // Count trades by day of week
      if (data.count > 0) {
        const dayOfWeek = date.getDay();
        dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + data.count;
        totalTrades += data.count;
        daysWithTrades++;
      }

      // Calculate streaks
      if (data.pnl > 0) {
        currentWinStreak++;
        currentLossStreak = 0;
        longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
      } else if (data.pnl < 0) {
        currentLossStreak++;
        currentWinStreak = 0;
        longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
      } else {
        currentWinStreak = 0;
        currentLossStreak = 0;
      }
    });

    // Find most active day
    const mostActiveDay = Object.entries(dayOfWeekCounts).reduce(
      (max, [day, count]) => (count > max.count ? { day: parseInt(day), count } : max),
      { day: 0, count: 0 }
    );

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      longestWinStreak,
      longestLossStreak,
      mostActiveDay: dayNames[mostActiveDay.day],
      avgDailyTrades: daysWithTrades > 0 ? (totalTrades / daysWithTrades).toFixed(1) : '0',
    };
  };

  const stats = calculateStats();

  const getIntensityColor = (count: number, pnl: number) => {
    if (count === 0) return "bg-muted border border-border/40";
    const intensity = Math.min(count / maxTrades, 1);
    
    if (pnl > 0) {
      if (intensity > 0.75) return "bg-success border border-success/30";
      if (intensity > 0.5) return "bg-success/70 border border-success/30";
      if (intensity > 0.25) return "bg-success/50 border border-success/30";
      return "bg-success/30 border border-success/30";
    } else if (pnl < 0) {
      if (intensity > 0.75) return "bg-destructive border border-destructive/30";
      if (intensity > 0.5) return "bg-destructive/70 border border-destructive/30";
      if (intensity > 0.25) return "bg-destructive/50 border border-destructive/30";
      return "bg-destructive/30 border border-destructive/30";
    }
    return "bg-muted border border-border/40";
  };

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("dashboard.consistencyTracker")}
            </CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{t("dashboard.consistencyTrackerTooltip")}</p>
                <a 
                  href="/dashboard/glossary#consistency-tracker" 
                  className="text-xs text-primary hover:underline mt-2 block"
                >
                  Learn more in glossary →
                </a>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{t("dashboard.less")}</span>
                <div className="flex gap-1">
                  <div className="w-6 h-6 rounded-sm bg-muted border border-border/40" />
                  <div className="w-6 h-6 rounded-sm bg-success/30 border border-success/30" />
                  <div className="w-6 h-6 rounded-sm bg-success/50 border border-success/30" />
                  <div className="w-6 h-6 rounded-sm bg-success/70 border border-success/30" />
                  <div className="w-6 h-6 rounded-sm bg-success border border-success/30" />
                </div>
              <span>{t("dashboard.more")}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-3 overflow-x-auto pb-2 justify-center">
            {/* Weekday labels - all 7 days */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground justify-start pt-1">
              <span className="h-6 flex items-center">{t("weekdays.mon")}</span>
              <span className="h-6 flex items-center">{t("weekdays.tue")}</span>
              <span className="h-6 flex items-center">{t("weekdays.wed")}</span>
              <span className="h-6 flex items-center">{t("weekdays.thu")}</span>
              <span className="h-6 flex items-center">{t("weekdays.fri")}</span>
              <span className="h-6 flex items-center">{t("weekdays.sat")}</span>
              <span className="h-6 flex items-center">{t("weekdays.sun")}</span>
            </div>
            
            {/* Heatmap grid - rows = weekdays, columns = weeks */}
            <div className="flex flex-col gap-2">
              {/* Month labels at top */}
              <div className="flex gap-1 text-xs text-muted-foreground h-4">
                {weeks.map((week, weekIdx) => {
                  const firstDayOfWeek = week[0];
                  const lastDayOfPrevWeek = weekIdx > 0 ? weeks[weekIdx - 1][0] : null;
                  
                  // Show month label if it's the first week or if month changed
                  const showMonth = weekIdx === 0 || 
                    (lastDayOfPrevWeek && firstDayOfWeek.getMonth() !== lastDayOfPrevWeek.getMonth());
                  
                  return (
                    <div key={weekIdx} className="w-6 text-center">
                      {showMonth && firstDayOfWeek.toLocaleDateString(undefined, { month: 'short' })}
                    </div>
                  );
                })}
              </div>
              
              {/* Grid: 7 rows (weekdays) x 26 columns (weeks) */}
              <div className="flex flex-col gap-1">
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <div key={dayIndex} className="flex gap-1">
                    {weeks.map((week, weekIdx) => {
                      const date = week[dayIndex];
                      const dateKey = date.toISOString().split('T')[0];
                      const data = tradeDataMap[dateKey] || { count: 0, pnl: 0 };
                      
                      return (
                        <Tooltip key={`${weekIdx}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => handleDateClick(date)}
                              className={`w-6 h-6 rounded-sm transition-all hover:ring-2 hover:ring-primary cursor-pointer ${getIntensityColor(data.count, data.pnl)}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold">{date.toLocaleDateString()}</div>
                              <div>{data.count} {t("dashboard.trades")}</div>
                              <div className={data.pnl >= 0 ? "text-success" : "text-destructive"}>
                                {formatCurrency(data.pnl)}
                              </div>
                              {data.count > 0 && (
                                <div className="text-muted-foreground mt-1 italic">
                                  {t("dashboard.clickToView")}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Panel */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 border border-border/40">
              <div className="text-xs text-muted-foreground mb-1">{t("dashboard.longestWinStreak")}</div>
              <div className="text-2xl font-bold text-success">{stats.longestWinStreak}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("dashboard.days")}</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 border border-border/40">
              <div className="text-xs text-muted-foreground mb-1">{t("dashboard.longestLossStreak")}</div>
              <div className="text-2xl font-bold text-destructive">{stats.longestLossStreak}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("dashboard.days")}</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 border border-border/40">
              <div className="text-xs text-muted-foreground mb-1">{t("dashboard.mostActiveDay")}</div>
              <div className="text-2xl font-bold text-primary">{stats.mostActiveDay}</div>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4 border border-border/40">
              <div className="text-xs text-muted-foreground mb-1">{t("dashboard.avgDailyTrades")}</div>
              <div className="text-2xl font-bold text-foreground">{stats.avgDailyTrades}</div>
              <div className="text-xs text-muted-foreground mt-1">{t("dashboard.tradesPerDay")}</div>
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
