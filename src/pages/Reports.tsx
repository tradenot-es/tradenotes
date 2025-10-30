import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Calendar } from "lucide-react";
import { KPICardWithTooltip } from "@/components/KPICardWithTooltip";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { StreakAnalysis } from "@/components/reports/StreakAnalysis";
import { HoldingPeriodAnalysis } from "@/components/reports/HoldingPeriodAnalysis";
import { SymbolPerformance } from "@/components/reports/SymbolPerformance";
import { HourOfDayAnalysis } from "@/components/reports/HourOfDayAnalysis";
import { DailyGoalProgress } from "@/components/DailyGoalProgress";
import { RadialProgress } from "@/components/RadialProgress";
import { TopSymbols } from "@/components/TopSymbols";
import { MarketBreakdown } from "@/components/MarketBreakdown";
import { PerformanceStats } from "@/components/PerformanceStats";
import { startOfDay, endOfDay } from "date-fns";

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
}

export default function Reports() {
  const { t } = useTranslation();
  const { user } = useAuth();
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="overview">{t("reports.overview")}</TabsTrigger>
          <TabsTrigger value="goals">Daily Goals</TabsTrigger>
          <TabsTrigger value="setup">{t("reports.bySetup")}</TabsTrigger>
          <TabsTrigger value="time">{t("reports.timeAnalysis")}</TabsTrigger>
          <TabsTrigger value="behavior">{t("reports.behavior")}</TabsTrigger>
          <TabsTrigger value="symbols">{t("reports.symbols")}</TabsTrigger>
          <TabsTrigger value="risk">{t("reports.riskAnalysis")}</TabsTrigger>
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
                <CardTitle>{t("reports.dayOfWeekDistribution")}</CardTitle>
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
                <CardTitle>{t("reports.performanceByDay")}</CardTitle>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          </div>
        </TabsContent>

        {/* Daily Goals Tab */}
        <TabsContent value="goals" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Goal Achievement Rate</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-4">
                <RadialProgress
                  value={parseFloat(dailyGoalTracking.achievementRate)}
                  size={160}
                  strokeWidth={12}
                  subtitle={`${dailyGoalTracking.daysAchieved} von ${dailyGoalTracking.totalDays} Tagen`}
                  color="warning"
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${dailyGoalAmount.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Max {dailyGoalMaxTrades} Trades pro Tag
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Best Day</CardTitle>
              </CardHeader>
              <CardContent>
                {dailyGoalTracking.days.length > 0 ? (
                  <>
                    <div className="text-2xl font-bold text-success">
                      ${Math.max(...dailyGoalTracking.days.map(d => d.pnl)).toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Bester Handelstag
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Keine Daten</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daily Goal History</CardTitle>
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
                    Keine Trades im ausgewählten Zeitraum
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
                        ${setup.pnl.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Avg: ${setup.avgPnl}
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
                          ${day.pnl.toFixed(2)}
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
                  value={`$${winLossStats.avgWin}`}
                  icon={DollarSign}
                  tooltip={t("reports.avgWinTooltip")}
                />
                <KPICardWithTooltip
                  title={t("reports.avgLoss")}
                  value={`$${winLossStats.avgLoss}`}
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

          {/* Performance Breakdown - Moved from Dashboard */}
          <div className="grid gap-6 md:grid-cols-2">
            <TopSymbols trades={filteredTrades} />
            <MarketBreakdown trades={filteredTrades} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}