import { useTranslation } from "react-i18next";
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

  // Get last 26 weeks (182 days)
  const getWeeksData = () => {
    const weeks: { [key: string]: { count: number; pnl: number } } = {};
    const today = new Date();
    
    // Initialize last 26 weeks
    for (let i = 0; i < 182; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      weeks[key] = { count: 0, pnl: 0 };
    }

    // Fill with trade data
    trades.forEach(trade => {
      const date = new Date(trade.exit_time).toISOString().split('T')[0];
      if (weeks[date]) {
        weeks[date].count++;
        weeks[date].pnl += trade.pnl_net;
      }
    });

    return weeks;
  };

  const weeksData = getWeeksData();
  const dates = Object.keys(weeksData).sort();
  const maxTrades = Math.max(...Object.values(weeksData).map(d => d.count), 1);

  // Calculate statistics
  const calculateStats = () => {
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    
    const dayOfWeekCounts: { [key: number]: number } = {};
    let totalTrades = 0;
    let daysWithTrades = 0;

    dates.forEach(date => {
      const data = weeksData[date];
      
      // Count trades by day of week
      if (data.count > 0) {
        const dayOfWeek = new Date(date).getDay();
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

  // Group by weeks (7 days)
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

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
          <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
            {/* Weekday labels */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground pr-1 justify-around py-0.5">
              <span className="h-6 flex items-center">Mo</span>
              <span className="h-6"></span>
              <span className="h-6 flex items-center">Mi</span>
              <span className="h-6"></span>
              <span className="h-6 flex items-center">Fr</span>
              <span className="h-6"></span>
              <span className="h-6"></span>
            </div>
            
            {/* Heatmap grid */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-1">
                {weeks.reverse().map((week, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {week.map((date) => {
                      const data = weeksData[date];
                      return (
                        <Tooltip key={date}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-6 h-6 rounded-sm transition-all hover:ring-2 hover:ring-primary cursor-pointer ${getIntensityColor(data.count, data.pnl)}`}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-semibold">{new Date(date).toLocaleDateString()}</div>
                              <div>{data.count} {t("dashboard.trades")}</div>
                              <div className={data.pnl >= 0 ? "text-success" : "text-destructive"}>
                                {formatCurrency(data.pnl)}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {/* Month labels */}
              <div className="flex gap-1 text-xs text-muted-foreground">
                {weeks.map((week, weekIdx) => {
                  const firstDate = new Date(week[0]);
                  const showMonth = weekIdx === 0 || firstDate.getDate() <= 7;
                  return (
                    <div key={weekIdx} className="w-6 text-center">
                      {showMonth && firstDate.toLocaleDateString('de-DE', { month: 'short' })}
                    </div>
                  );
                })}
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
