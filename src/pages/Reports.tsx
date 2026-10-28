import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LabelList } from "recharts";
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { Calendar, HelpCircle, TrendingDown, Target } from "lucide-react";
import { KPICardWithTooltip } from "@/components/KPICardWithTooltip";
import { TrendingUp, DollarSign, Activity } from "lucide-react";
import { StreakAnalysis } from "@/components/reports/StreakAnalysis";
import { HoldingPeriodAnalysis } from "@/components/reports/HoldingPeriodAnalysis";
import { SymbolPerformance } from "@/components/reports/SymbolPerformance";
import { HourOfDayAnalysis } from "@/components/reports/HourOfDayAnalysis";
import { ConsistencyTracker } from "@/components/ConsistencyTracker";
import { TradingGoalsTracker } from "@/components/TradingGoalsTracker";
import { TopSymbols } from "@/components/TopSymbols";
import { MarketBreakdown } from "@/components/MarketBreakdown";
import { PerformanceStats } from "@/components/PerformanceStats";
import { useCurrency } from "@/hooks/useCurrency";
import { BehaviorAnalysis } from "@/components/reports/BehaviorAnalysis";
import { useTradingGoals } from "@/hooks/useTradingGoals";
import { AccountTypeAnalysis } from "@/components/reports/AccountTypeAnalysis";
import { PnLChart } from "@/components/PnLChart";
import { MFEMAEAnalysis } from "@/components/reports/MFEMAEAnalysis";
import { RiskSimulator } from "@/components/reports/RiskSimulator";
import { PageHeader } from "@/components/PageHeader";
import { RuleAdherence } from "@/components/reports/RuleAdherence";
import { InsightsSummary } from "@/components/reports/InsightsSummary";

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
  mistakes?: string[] | null;
  emotions?: string[] | null;
  setup_checklist_completed?: boolean[] | null;
}

export default function Reports() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency, formatCurrencyCompact } = useCurrency();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Trading Goals Hook - needs trades with fees field
  const tradesWithFees = trades.map(t => ({ ...t, fees: 0 }));
  const { goals, enabledGoals, dailyResults } = useTradingGoals(tradesWithFees);

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    setLoading(true);
    const { data, error } = await db
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
      label: t(`reports.${stat.day.toLowerCase()}`),
      winRate: stat.trades > 0 ? ((stat.wins / stat.trades) * 100).toFixed(1) : "0"
    }));
  }, [filteredTrades, t]);

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
      <PageHeader
        title={t("reports.title")}
        subtitle={t("reports.subtitle")}
        actions={
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
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1">
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
              <TabsTrigger value="goals">{t("reports.dailyGoals")}</TabsTrigger>
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
              <TabsTrigger value="rules">{t("reports.rules")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.rulesTooltip")}</p>
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
          
          <HoverCard>
            <HoverCardTrigger asChild>
              <TabsTrigger value="simulator">{t("reports.simulator")}</TabsTrigger>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("reports.simulatorTooltip")}</p>
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

          <InsightsSummary trades={filteredTrades} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>{t("reports.dayOfWeekDistribution")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                    <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="trades" name={t("reports.trades")} fill="hsl(var(--primary))" />
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
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                    <XAxis dataKey="label" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pnl" name={t("reports.totalPnl")}>
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
          <TradingGoalsTracker
            dailyResults={dailyResults}
            enabledGoals={enabledGoals}
            goals={goals}
          />
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
          <BehaviorAnalysis
            trades={filteredTrades}
            maxTradesPerDay={goals.max_trades.enabled ? goals.max_trades.target : undefined}
          />
          <StreakAnalysis trades={filteredTrades} />
          <HoldingPeriodAnalysis trades={filteredTrades} />
        </TabsContent>

        {/* Symbols Tab */}
        <TabsContent value="rules" className="space-y-6">
          <RuleAdherence trades={filteredTrades} />
        </TabsContent>

        <TabsContent value="symbols" className="space-y-6">
          <SymbolPerformance trades={filteredTrades} />
        </TabsContent>

        {/* Risk Analysis Tab */}
        <TabsContent value="risk" className="space-y-6">
          {/* R-Multiple Section Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t("reports.rMultipleSection", "R-Multiple Analyse")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("reports.rMultipleSectionDesc", "Analysiere dein Risiko-Reward-Verhältnis basierend auf dem initialen Risiko deiner Trades. Erfasse Stop-Loss bei jedem Trade um R-Werte zu berechnen.")}
              </p>
            </CardHeader>
          </Card>

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

          {/* MFE/MAE Analysis integrated into Risk Tab */}
          <MFEMAEAnalysis trades={filteredTrades} />
        </TabsContent>

        {/* Risk Simulator Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <RiskSimulator trades={filteredTrades} />
        </TabsContent>
      </Tabs>
    </div>
  );
}