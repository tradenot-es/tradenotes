import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  Flame, 
  AlertCircle,
  CheckCircle2,
  Brain
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  pnl_net: number;
  entry_time: string;
  exit_time: string;
}

interface Alert {
  id: string;
  type: "warning" | "danger" | "info";
  icon: React.ElementType;
  title: string;
  description: string;
  priority: number;
}

interface TradingAlertsWidgetProps {
  trades: Trade[];
}

export function TradingAlertsWidget({ trades }: TradingAlertsWidgetProps) {
  const { t } = useTranslation();

  const alerts = useMemo(() => {
    if (trades.length < 5) return []; // Need minimum data

    const alertsList: Alert[] = [];
    
    // Sort trades by exit time (newest first)
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(b.exit_time).getTime() - new Date(a.exit_time).getTime()
    );

    // 1. Current Streak Analysis
    const recentTrades = sortedTrades.slice(0, 10);
    let currentLossStreak = 0;
    for (const trade of recentTrades) {
      if (trade.pnl_net < 0) currentLossStreak++;
      else break;
    }

    if (currentLossStreak >= 3) {
      alertsList.push({
        id: "loss-streak",
        type: "danger",
        icon: TrendingDown,
        title: t("alerts.lossStreakTitle", { count: currentLossStreak }),
        description: t("alerts.lossStreakDescription"),
        priority: 1
      });
    }

    // 2. Revenge Trading Detection (trading too quickly after a loss)
    const last5Trades = sortedTrades.slice(0, 5);
    let revengeTradingScore = 0;
    for (let i = 1; i < last5Trades.length; i++) {
      const prevTrade = last5Trades[i];
      const currTrade = last5Trades[i - 1];
      
      if (prevTrade.pnl_net < 0) {
        const timeDiff = new Date(currTrade.entry_time).getTime() - new Date(prevTrade.exit_time).getTime();
        const minutesDiff = timeDiff / (1000 * 60);
        
        // Trade within 10 minutes of a loss
        if (minutesDiff < 10 && currTrade.pnl_net < 0) {
          revengeTradingScore++;
        }
      }
    }

    if (revengeTradingScore >= 2) {
      alertsList.push({
        id: "revenge-trading",
        type: "warning",
        icon: Flame,
        title: t("alerts.revengeTradingTitle"),
        description: t("alerts.revengeTradingDescription"),
        priority: 2
      });
    }

    // 3. Time-of-Day Performance Analysis
    const hourlyPerformance: { [hour: number]: { wins: number; losses: number; pnl: number } } = {};
    
    trades.forEach(trade => {
      const hour = new Date(trade.entry_time).getHours();
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { wins: 0, losses: 0, pnl: 0 };
      }
      hourlyPerformance[hour].pnl += trade.pnl_net;
      if (trade.pnl_net > 0) hourlyPerformance[hour].wins++;
      else hourlyPerformance[hour].losses++;
    });

    // Find worst performing hour with enough data
    let worstHour = -1;
    let worstWinRate = 1;
    let worstHourTrades = 0;
    
    Object.entries(hourlyPerformance).forEach(([hour, data]) => {
      const totalTrades = data.wins + data.losses;
      if (totalTrades >= 5) { // Need at least 5 trades at that hour
        const winRate = data.wins / totalTrades;
        if (winRate < worstWinRate) {
          worstWinRate = winRate;
          worstHour = parseInt(hour);
          worstHourTrades = totalTrades;
        }
      }
    });

    if (worstHour !== -1 && worstWinRate < 0.35) {
      const currentHour = new Date().getHours();
      const isNow = Math.abs(currentHour - worstHour) <= 1;
      
      alertsList.push({
        id: "weak-hour",
        type: isNow ? "danger" : "info",
        icon: Clock,
        title: isNow 
          ? t("alerts.weakHourNowTitle", { hour: `${worstHour}:00` })
          : t("alerts.weakHourTitle", { hour: `${worstHour}:00` }),
        description: t("alerts.weakHourDescription", { 
          winRate: (worstWinRate * 100).toFixed(0),
          trades: worstHourTrades 
        }),
        priority: isNow ? 1 : 3
      });
    }

    // 4. Day-of-Week Performance
    const dayPerformance: { [day: number]: { wins: number; losses: number; pnl: number } } = {};
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    trades.forEach(trade => {
      const day = new Date(trade.entry_time).getDay();
      if (!dayPerformance[day]) {
        dayPerformance[day] = { wins: 0, losses: 0, pnl: 0 };
      }
      dayPerformance[day].pnl += trade.pnl_net;
      if (trade.pnl_net > 0) dayPerformance[day].wins++;
      else dayPerformance[day].losses++;
    });

    let worstDay = -1;
    let worstDayWinRate = 1;
    let worstDayTrades = 0;
    
    Object.entries(dayPerformance).forEach(([day, data]) => {
      const totalTrades = data.wins + data.losses;
      if (totalTrades >= 5) {
        const winRate = data.wins / totalTrades;
        if (winRate < worstDayWinRate) {
          worstDayWinRate = winRate;
          worstDay = parseInt(day);
          worstDayTrades = totalTrades;
        }
      }
    });

    if (worstDay !== -1 && worstDayWinRate < 0.35) {
      const today = new Date().getDay();
      const isToday = today === worstDay;
      
      alertsList.push({
        id: "weak-day",
        type: isToday ? "warning" : "info",
        icon: AlertCircle,
        title: isToday 
          ? t("alerts.weakDayTodayTitle")
          : t("alerts.weakDayTitle", { day: t(`common.days.${dayNames[worstDay]}`) }),
        description: t("alerts.weakDayDescription", { 
          winRate: (worstDayWinRate * 100).toFixed(0),
          trades: worstDayTrades 
        }),
        priority: isToday ? 2 : 4
      });
    }

    // 5. Overtrading Warning (too many trades today)
    const today = new Date().toDateString();
    const tradesToday = trades.filter(t => 
      new Date(t.exit_time).toDateString() === today
    ).length;

    if (tradesToday >= 8) {
      alertsList.push({
        id: "overtrading",
        type: "warning",
        icon: AlertTriangle,
        title: t("alerts.overtradingTitle", { count: tradesToday }),
        description: t("alerts.overtradingDescription"),
        priority: 2
      });
    }

    // Sort by priority
    return alertsList.sort((a, b) => a.priority - b.priority).slice(0, 4);
  }, [trades, t]);

  if (trades.length < 5) {
    return null; // Don't show widget with insufficient data
  }

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "danger":
        return "bg-destructive/10 border-destructive/30 text-destructive";
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning";
      case "info":
        return "bg-primary/10 border-primary/30 text-primary";
    }
  };

  const getBadgeVariant = (type: Alert["type"]) => {
    switch (type) {
      case "danger":
        return "destructive";
      case "warning":
        return "secondary";
      case "info":
        return "outline";
    }
  };

  return (
    <Card className="elegant-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t("alerts.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <div>
              <p className="font-medium text-success">{t("alerts.allClear")}</p>
              <p className="text-sm text-muted-foreground">{t("alerts.allClearDescription")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${getAlertStyles(alert.type)}`}
              >
                <alert.icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{alert.title}</p>
                    <Badge variant={getBadgeVariant(alert.type)} className="text-xs">
                      {alert.type === "danger" ? t("alerts.urgent") : 
                       alert.type === "warning" ? t("alerts.caution") : 
                       t("alerts.insight")}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-80 mt-1">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
