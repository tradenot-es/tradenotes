import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LabelList } from "recharts";
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, Info, TrendingDown } from "lucide-react";
import { KPICardWithTooltip } from "@/components/KPICardWithTooltip";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { StreakAnalysis } from "@/components/reports/StreakAnalysis";
import { HoldingPeriodAnalysis } from "@/components/reports/HoldingPeriodAnalysis";
import { SymbolPerformance } from "@/components/reports/SymbolPerformance";
import { HourOfDayAnalysis } from "@/components/reports/HourOfDayAnalysis";
import { ConsistencyTracker } from "@/components/ConsistencyTracker";
import { DailyGoalProgress } from "@/components/DailyGoalProgress";
import { RadialProgress } from "@/components/RadialProgress";
import { TopSymbols } from "@/components/TopSymbols";
import { MarketBreakdown } from "@/components/MarketBreakdown";
import { PerformanceStats } from "@/components/PerformanceStats";
import { startOfDay, endOfDay } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { AccountTypeAnalysis } from "@/components/reports/AccountTypeAnalysis";
import { PnLChart } from "@/components/PnLChart";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  market: string;
  pnl_net: number;
  entry_time: string;
  exit_time: string;
  setup?: string;
  r?: number;
  rating?: number;
  qty: number;
  entry_price: number;
  exit_price: number;
  account_type?: string | null;
}

export default function Reports() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency, formatCurrencyCompact } = useCurrency();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [dailyGoalAmount, setDailyGoalAmount] = useState(500);
  const [dailyGoalMaxTrades, setDailyGoalMaxTrades] = useState(10);

  useEffect(() => {
    if (user) {
      loadTrades();
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("daily_goal_amount, daily_goal_max_trades")
      .maybeSingle();

    if (data) {
      setDailyGoalAmount(data.daily_goal_amount || 500);
      setDailyGoalMaxTrades(data.daily_goal_max_trades || 10);
    }
  };

  const loadTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("exit_time", { ascending: false });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  const filteredTrades = useMemo(() => {
    let filtered = [...trades];
    const now = new Date();

    switch (timeFilter) {
      case "week":
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        filtered = filtered.filter(t => {
          const exitDate = new Date(t.exit_time);
          return exitDate >= weekStart && exitDate <= weekEnd;
        });
        break;
      case "month":
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        filtered = filtered.filter(t => {
          const exitDate = new Date(t.exit_time);
          return exitDate >= monthStart && exitDate <= monthEnd;
        });
        break;
      case "3months":
        const threeMonthsAgo = subMonths(now, 3);
        filtered = filtered.filter(t => new Date(t.exit_time) >= threeMonthsAgo);
        break;
      case "year":
        const oneYearAgo = subMonths(now, 12);
        filtered = filtered.filter(t => new Date(t.exit_time) >= oneYearAgo);
        break;
      default:
        break;
    }

    return filtered;
  }, [trades, timeFilter]);

  // Day of Week Analysis
  const dayOfWeekData = useMemo(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayStats = days.map(day => ({
      day,
      trades: 0,
      pnl: 0,
      wins: 0,
      losses: 0
    }));

    filteredTrades.forEach(trade => {
      const dayIndex = new Date(trade.exit_time).getDay();
      dayStats[dayIndex].trades++;
      dayStats[dayIndex].pnl += trade.pnl_net;
      if (trade.pnl_net > 0) dayStats[dayIndex].wins++;
      else if (trade.pnl_net < 0) dayStats[dayIndex].losses++;
    });

    return dayStats.map(stat => ({
      ...stat,
      winRate: stat.trades > 0 ? ((stat.wins / stat.trades) * 100).toFixed(1) : "0"
    }));
  }, [filteredTrades]);

  // Setup Performance
  const setupPerformance = useMemo(() => {
    const setupMap = new Map<string, { trades: number; pnl: number; wins: number }>();

    filteredTrades.forEach(trade => {
      const setup = trade.setup || "No Setup";
      const current = setupMap.get(setup) || { trades: 0, pnl: 0, wins: 0 };
      current.trades++;
      current.pnl += trade.pnl_net;
      if (trade.pnl_net > 0) current.wins++;
      setupMap.set(setup, current);
    });

    return Array.from(setupMap.entries())
      .map(([setup, stats]) => ({
        setup,
        trades: stats.trades,
        pnl: stats.pnl,
        winRate: ((stats.wins / stats.trades) * 100).toFixed(1),
        avgPnl: (stats.pnl / stats.trades).toFixed(2)
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [filteredTrades]);

  // Risk Metrics
  const riskMetrics = useMemo(() => {
    const tradesWithR = filteredTrades.filter(t => t.r !== null && t.r !== undefined);
    const rValues = tradesWithR.map(t => t.r!);
    
    const avgR = rValues.length > 0 
      ? (rValues.reduce((sum, r) => sum + r, 0) / rValues.length).toFixed(2)
      : "0";

    const rDistribution = [
      { range: "< -2R", count: rValues.filter(r => r < -2).length },
      { range: "-2R to -1R", count: rValues.filter(r => r >= -2 && r < -1).length },
      { range: "-1R to 0R", count: rValues.filter(r => r >= -1 && r < 0).length },
      { range: "0R to 1R", count: rValues.filter(r => r >= 0 && r < 1).length },
      { range: "1R to 2R", count: rValues.filter(r => r >= 1 && r < 2).length },
      { range: "2R to 3R", count: rValues.filter(r => r >= 2 && r < 3).length },
      { range: "> 3R", count: rValues.filter(r => r >= 3).length },
    ].filter(d => d.count > 0);

    return { avgR, rDistribution, totalWithR: tradesWithR.length };
  }, [filteredTrades]);

  // Win/Loss Stats
  const winLossStats = useMemo(() => {
    const wins = filteredTrades.filter(t => t.pnl_net > 0);
    const losses = filteredTrades.filter(t => t.pnl_net < 0);
    
    const totalWins = wins.reduce((sum, t) => sum + t.pnl_net, 0);
    const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl_net, 0));
    
    const avgWin = wins.length > 0 ? totalWins / wins.length : 0;
    const avgLoss = losses.length > 0 ? totalLosses / losses.length : 0;

    return {
      wins: wins.length,
      losses: losses.length,
      totalWins,
      totalLosses,
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      winRate: filteredTrades.length > 0 
        ? ((wins.length / filteredTrades.length) * 100).toFixed(1)
        : "0",
      profitFactor: totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : "0"
    };
  }, [filteredTrades]);

  // Daily Goal Tracking
  const dailyGoalTracking = useMemo(() => {
    const dailyMap = new Map<string, { pnl: number; trades: number }>();
    
    filteredTrades.forEach(trade => {
      const date = format(new Date(trade.exit_time), 'yyyy-MM-dd');
      const current = dailyMap.get(date) || { pnl: 0, trades: 0 };
      current.pnl += trade.pnl_net;
      current.trades++;
      dailyMap.set(date, current);
    });

    const result = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      pnl: stats.pnl,
      trades: stats.trades,
      goalAchieved: stats.pnl >= dailyGoalAmount && stats.trades <= dailyGoalMaxTrades,
      overTraded: stats.trades > dailyGoalMaxTrades
    }));

    const totalDays = result.length;
    const daysAchieved = result.filter(d => d.goalAchieved).length;
    const achievementRate = totalDays > 0 ? ((daysAchieved / totalDays) * 100).toFixed(1) : "0";

    return { days: result, totalDays, daysAchieved, achievementRate };
  }, [filteredTrades, dailyGoalAmount, dailyGoalMaxTrades]);

  // P&L by Month for Chart
  const pnlByMonth = useMemo(() => {
    const monthlyPnL: { [key: string]: number } = {};
    
    // Sort trades by exit_time ascending for chronological order
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
    );
    
    sortedTrades.forEach((trade) => {
      const month = new Date(trade.exit_time).toLocaleDateString("de-DE", { 
        year: "numeric", 
        month: "short" 
      });
      monthlyPnL[month] = (monthlyPnL[month] || 0) + trade.pnl_net;
    });
    
    return Object.entries(monthlyPnL).map(([period, pnl]) => ({
      period,
      pnl,
    }));
  }, [filteredTrades]);

  // Max Drawdown Calculation
  const maxDrawdown = useMemo(() => {
    let cumulative = 0;
    let peak = 0;
    let maxDD = 0;
    
    // Sort trades by exit_time ascending
    const sortedTrades = [...filteredTrades].sort((a, b) => 
      new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
    );
    
    sortedTrades.forEach((trade) => {
      cumulative += trade.pnl_net;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDD) maxDD = drawdown;
    });
    
    return maxDD;
  }, [filteredTrades]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
          <p className="text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("reports.allTime")}</SelectItem>
              <SelectItem value="week">{t("reports.thisWeek")}</SelectItem>
              <SelectItem value="month">{t("reports.thisMonth")}</SelectItem>
              <SelectItem value="3months">{t("reports.last3Months")}</SelectItem>
              <SelectItem value="year">{t("reports.thisYear")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="overview">{t("reports.overview")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.overviewTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="accounts">{t("reports.accountTypes")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.accountTypesTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="goals">Daily Goals</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.dailyGoalsTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="setup">{t("reports.bySetup")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.bySetupTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="time">{t("reports.timeAnalysis")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.timeAnalysisTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="behavior">{t("reports.behavior")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.behaviorTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="symbols">{t("reports.symbols")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.symbolsTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="risk">{t("reports.riskAnalysis")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.riskAnalysisTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Performance Stats Overview */}
          <PerformanceStats
            winningTrades={winLossStats.wins}
            losingTrades={winLossStats.losses}
            avgWin={parseFloat(winLossStats.avgWin)}
            avgLoss={parseFloat(winLossStats.avgLoss)}
            bestTrade={filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl_net)) : 0}
            worstTrade={filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl_net)) : 0}
            totalTrades={filteredTrades.length}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{t("reports.dayOfWeekDistribution")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">{t("reports.dayOfWeekDistributionTooltip")}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="trades" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{t("reports.performanceByDay")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">{t("reports.performanceByDayTooltip")}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pnl">
                      {dayOfWeekData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <KPICardWithTooltip
              title={t("reports.totalTrades")}
              value={filteredTrades.length}
              icon={Activity}
              tooltip={t("reports.totalTradesTooltip")}
            />
            <KPICardWithTooltip
              title={t("reports.winningTrades")}
              value={winLossStats.wins}
              icon={TrendingUp}
              tooltip={t("reports.winningTradesTooltip")}
            />
            <KPICardWithTooltip
              title={t("reports.losingTrades")}
              value={winLossStats.losses}
              icon={TrendingUp}
              tooltip={t("reports.losingTradesTooltip")}
            />
            <KPICardWithTooltip
              title={t("dashboard.winRate")}
              value={`${winLossStats.winRate}%`}
              icon={Target}
              tooltip={t("dashboard.winRateTooltip")}
              glossaryLink="/glossary#win-rate"
            />
            <KPICardWithTooltip
              title={t("dashboard.maxDrawdown")}
              value={formatCurrencyCompact(maxDrawdown)}
              icon={TrendingDown}
              tooltip={t("dashboard.maxDrawdownTooltip")}
              glossaryLink="/glossary#max-drawdown"
              valueColor="destructive"
            />
          </div>

          {/* P&L by Month Chart */}
          <PnLChart data={pnlByMonth} title={t("dashboard.pnlByMonth")} />

          {/* Top Symbols and Market Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            <TopSymbols trades={filteredTrades} />
            <MarketBreakdown trades={filteredTrades} />
          </div>

          {/* Trading Activity Heatmap */}
          <ConsistencyTracker trades={filteredTrades} />
        </TabsContent>

        {/* Account Types Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <AccountTypeAnalysis trades={filteredTrades} />
        </TabsContent>

        {/* Daily Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{t("reports.goalAchievementRate")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">{t("reports.goalAchievementRateTooltip")}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <RadialProgress
                  value={parseFloat(dailyGoalTracking.achievementRate)}
                  size={160}
                  strokeWidth={12}
                  subtitle={t("reports.daysAchieved", { 
                    achieved: dailyGoalTracking.daysAchieved, 
                    total: dailyGoalTracking.totalDays 
                  })}
                  color="warning"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{t("reports.currentGoal")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">{t("reports.currentGoalTooltip")}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(dailyGoalAmount)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("reports.maxTradesPerDay", { trades: dailyGoalMaxTrades })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{t("reports.bestDay")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">{t("reports.bestDayTooltip")}</p>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                {dailyGoalTracking.days.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-success">
                      {formatCurrency(Math.max(...dailyGoalTracking.days.map(d => d.pnl)))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("reports.bestTradingDay")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("reports.noData")}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("reports.dailyGoalHistory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dailyGoalTracking.days
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((day) => (
                    <DailyGoalProgress
                      key={day.date}
                      date={day.date}
                      dailyPnL={day.pnl}
                      dailyTrades={day.trades}
                      goalAmount={dailyGoalAmount}
                      maxTrades={dailyGoalMaxTrades}
                    />
                  ))}
                {dailyGoalTracking.days.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("reports.noTradesInPeriod")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.setupPerformance")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {setupPerformance.map((setup) => (
                  <div key={setup.setup} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold">{setup.setup}</div>
                      <div className="text-sm text-muted-foreground">
                        {setup.trades} {t("reports.trades")} • {setup.winRate}% {t("reports.winRate")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${setup.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(setup.pnl)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg: {formatCurrency(parseFloat(setup.avgPnl))}
                      </div>
                    </div>
                  </div>
                ))}
                {setupPerformance.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {t("reports.noSetupData")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Analysis Tab */}
        <TabsContent value="time" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("reports.dayOfWeekSummary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t("reports.day")}</th>
                      <th className="text-right py-2">{t("reports.trades")}</th>
                      <th className="text-right py-2">{t("reports.wins")}</th>
                      <th className="text-right py-2">{t("reports.losses")}</th>
                      <th className="text-right py-2">{t("reports.winRate")}</th>
                      <th className="text-right py-2">{t("reports.totalPnl")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayOfWeekData.map((day) => (
                      <tr key={day.day} className="border-b">
                        <td className="py-3 font-medium">{t(`reports.${day.day.toLowerCase()}`)}</td>
                        <td className="text-right">{day.trades}</td>
                        <td className="text-right text-success">{day.wins}</td>
                        <td className="text-right text-destructive">{day.losses}</td>
                        <td className="text-right">{day.winRate}%</td>
                        <td className={`text-right font-semibold ${day.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {formatCurrency(day.pnl)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <HourOfDayAnalysis trades={filteredTrades} />
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <StreakAnalysis trades={filteredTrades} />
          <HoldingPeriodAnalysis trades={filteredTrades} />
        </TabsContent>

        {/* Symbols Tab */}
        <TabsContent value="symbols" className="space-y-6">
          <SymbolPerformance trades={filteredTrades} />
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("reports.rMultipleDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                {riskMetrics.totalWithR > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={riskMetrics.rDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    {t("reports.noRiskData")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("reports.riskMetrics")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <KPICardWithTooltip
                  title={t("reports.avgRMultiple")}
                  value={`${riskMetrics.avgR}R`}
                  icon={TrendingUp}
                  tooltip={t("dashboard.avgRMultipleTooltip")}
                  glossaryLink="/glossary#r-multiple"
                />
                <KPICardWithTooltip
                  title={t("reports.tradesWithRisk")}
                  value={riskMetrics.totalWithR}
                  icon={Activity}
                  tooltip={t("reports.tradesWithRiskTooltip")}
                />
                <KPICardWithTooltip
                  title={t("reports.avgWin")}
                  value={formatCurrency(parseFloat(winLossStats.avgWin))}
                  icon={DollarSign}
                  tooltip={t("reports.avgWinTooltip")}
                />
                <KPICardWithTooltip
                  title={t("reports.avgLoss")}
                  value={formatCurrency(parseFloat(winLossStats.avgLoss))}
                  icon={DollarSign}
                  tooltip={t("reports.avgLossTooltip")}
                />
                <KPICardWithTooltip
                  title={t("reports.profitFactor")}
                  value={winLossStats.profitFactor}
                  icon={TrendingUp}
                  tooltip={t("dashboard.profitFactorTooltip")}
                  glossaryLink="/glossary#profit-factor"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}