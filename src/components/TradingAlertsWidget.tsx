import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  TrendingDown, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Brain,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

interface RevengeScore {
  score: number;
  postLossTrades: number;
  quickReentries: number;
  postLossWinRate: number;
}

interface TradingAlertsWidgetProps {
  trades: Trade[];
}

export function TradingAlertsWidget({ trades }: TradingAlertsWidgetProps) {
  const { t } = useTranslation();

  // Revenge Trading Score Calculation
  const revengeScore = useMemo((): RevengeScore | null => {
    if (trades.length < 10) return null;

    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
    );

    let postLossTrades = 0;
    let postLossLosses = 0;
    let quickReentries = 0;

    for (let i = 1; i < sortedTrades.length; i++) {
      const prevTrade = sortedTrades[i - 1];
      const currTrade = sortedTrades[i];

      if (prevTrade.pnl_net < 0) {
        postLossTrades++;
        const timeDiff = (new Date(currTrade.entry_time).getTime() - new Date(prevTrade.exit_time).getTime()) / 60000;

        if (timeDiff < 10) quickReentries++;
        if (currTrade.pnl_net < 0) postLossLosses++;
      }
    }

    if (postLossTrades === 0) {
      return { score: 0, postLossTrades: 0, quickReentries: 0, postLossWinRate: 100 };
    }

    // Score calculation (0-100, lower = better)
    const timingScore = (quickReentries / postLossTrades) * 50;
    const performanceScore = (postLossLosses / postLossTrades) * 50;
    const totalScore = Math.min(100, Math.round(timingScore + performanceScore));
    const postLossWinRate = ((postLossTrades - postLossLosses) / postLossTrades) * 100;

    return {
      score: totalScore,
      postLossTrades,
      quickReentries,
      postLossWinRate
    };
  }, [trades]);

  const getScoreColor = (score: number): "success" | "warning" | "destructive" => {
    if (score <= 25) return "success";
    if (score <= 50) return "warning";
    return "destructive";
  };

  const getScoreLabel = (score: number): string => {
    if (score <= 25) return t("alerts.revengeScoreExcellent");
    if (score <= 50) return t("alerts.revengeScoreGood");
    if (score <= 75) return t("alerts.revengeScoreWarning");
    return t("alerts.revengeScoreCritical");
  };

  const alerts = useMemo(() => {
    if (trades.length < 5) return [];

    const alertsList: Alert[] = [];
    
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

    // 2. Time-of-Day Performance Analysis
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

    let worstHour = -1;
    let worstWinRate = 1;
    let worstHourTrades = 0;
    
    Object.entries(hourlyPerformance).forEach(([hour, data]) => {
      const totalTrades = data.wins + data.losses;
      if (totalTrades >= 5) {
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

    // 3. Day-of-Week Performance
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

    // 4. Overtrading Warning
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

    return alertsList.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }, [trades, t]);

  const MIN_TRADES_REQUIRED = 5;
  const MIN_TRADES_FOR_SCORE = 10;
  const needsMoreData = trades.length < MIN_TRADES_REQUIRED;

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

  const scoreColorClass = revengeScore 
    ? getScoreColor(revengeScore.score) === "success" 
      ? "text-success" 
      : getScoreColor(revengeScore.score) === "warning"
        ? "text-warning"
        : "text-destructive"
    : "text-muted-foreground";

  const scoreBgClass = revengeScore 
    ? getScoreColor(revengeScore.score) === "success" 
      ? "bg-success/10 border-success/30" 
      : getScoreColor(revengeScore.score) === "warning"
        ? "bg-warning/10 border-warning/30"
        : "bg-destructive/10 border-destructive/30"
    : "bg-muted/50 border-border";

  return (
    <Card className="elegant-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {t("alerts.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Revenge Trading Score Section */}
        <div className={`p-4 rounded-lg border ${scoreBgClass}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{t("alerts.revengeScore")}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={t("alerts.revengeScoreTooltipAria", { defaultValue: "Info" })}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] z-[1000]">
                    <p>{t("alerts.revengeScoreTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {revengeScore && (
              <Badge variant={getScoreColor(revengeScore.score) === "success" ? "default" : getScoreColor(revengeScore.score) === "warning" ? "secondary" : "destructive"}>
                {getScoreLabel(revengeScore.score)}
              </Badge>
            )}
          </div>

          {revengeScore ? (
            <div className="space-y-3">
              {/* Score Display */}
              <div className="flex items-center gap-4">
                <div className={`text-4xl font-bold tabular-nums ${scoreColorClass}`}>
                  {revengeScore.score}
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ${
                        getScoreColor(revengeScore.score) === "success" 
                          ? "bg-success" 
                          : getScoreColor(revengeScore.score) === "warning"
                            ? "bg-warning"
                            : "bg-destructive"
                      }`}
                      style={{ width: `${revengeScore.score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span className="text-center">{t("alerts.lowerIsBetter")}</span>
                    <span>100</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="text-center p-2 rounded bg-background/50">
                  <div className="text-lg font-semibold text-foreground">{revengeScore.postLossWinRate.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">{t("alerts.postLossWinRate")}</div>
                </div>
                <div className="text-center p-2 rounded bg-background/50">
                  <div className="text-lg font-semibold text-foreground">{revengeScore.quickReentries}</div>
                  <div className="text-xs text-muted-foreground">{t("alerts.quickReentries")}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("alerts.scoreNeedsMoreData", { current: trades.length, required: MIN_TRADES_FOR_SCORE })}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label={t("alerts.scoreNeedsMoreDataTooltipAria", { defaultValue: "Info" })}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] z-[1000]">
                    <p>{t("alerts.scoreNeedsMoreDataTooltip")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        <Separator />

        {/* Alerts Section */}
        {needsMoreData ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">{t("alerts.needsMoreData")}</p>
              <p className="text-sm text-muted-foreground">
                {t("alerts.needsMoreDataDescription", { 
                  current: trades.length, 
                  required: MIN_TRADES_REQUIRED 
                })}
              </p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
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
