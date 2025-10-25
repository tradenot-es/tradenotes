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
}

export default function Reports() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("reports.overview")}</TabsTrigger>
          <TabsTrigger value="setup">{t("reports.bySetup")}</TabsTrigger>
          <TabsTrigger value="time">{t("reports.timeAnalysis")}</TabsTrigger>
          <TabsTrigger value="risk">{t("reports.riskAnalysis")}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle>{t("reports.summary")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{filteredTrades.length}</div>
                  <div className="text-sm text-muted-foreground">{t("reports.totalTrades")}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-success">{winLossStats.wins}</div>
                  <div className="text-sm text-muted-foreground">{t("reports.winningTrades")}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{winLossStats.losses}</div>
                  <div className="text-sm text-muted-foreground">{t("reports.losingTrades")}</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{winLossStats.winRate}%</div>
                  <div className="text-sm text-muted-foreground">{t("dashboard.winRate")}</div>
                </div>
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-muted-foreground">{t("reports.avgRMultiple")}</span>
                  <span className="text-2xl font-bold">{riskMetrics.avgR}R</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-muted-foreground">{t("reports.tradesWithRisk")}</span>
                  <span className="text-2xl font-bold">{riskMetrics.totalWithR}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-muted-foreground">{t("reports.avgWin")}</span>
                  <span className="text-2xl font-bold text-success">${winLossStats.avgWin}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-muted-foreground">{t("reports.avgLoss")}</span>
                  <span className="text-2xl font-bold text-destructive">${winLossStats.avgLoss}</span>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <span className="text-muted-foreground">{t("reports.profitFactor")}</span>
                  <span className="text-2xl font-bold">{winLossStats.profitFactor}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}