import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, DollarSign, Target, Activity, Info } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { KPICardWithTooltip } from "@/components/KPICardWithTooltip";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnLChart } from "@/components/PnLChart";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { WeeklyPerformance } from "@/components/WeeklyPerformance";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Link } from "react-router-dom";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  market: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  fees: number;
  pnl_net: number;
  r?: number;
  initial_risk?: number;
  stop_loss_price?: number;
  setup?: string;
  note?: string;
}

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTrade, setEditTrade] = useState<Trade | null>(null);

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("exit_time", { ascending: true });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditTrade(trade);
    setEditDialogOpen(true);
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!confirm(t("trades.confirmDelete"))) return;

    const { error } = await supabase
      .from("trades")
      .delete()
      .eq('id', tradeId);

    if (error) {
      toast.error(t("trades.deleteError"));
    } else {
      toast.success(t("trades.tradeDeleted"));
      loadTrades();
    }
  };

  const calculateKPIs = () => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl_net > 0).length;
    const losingTrades = trades.filter((t) => t.pnl_net < 0).length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0.0";
    const winRateNum = parseFloat(winRate);
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl_net, 0);
    const totalWins = trades.filter((t) => t.pnl_net > 0).reduce((sum, t) => sum + t.pnl_net, 0);
    const totalLosses = Math.abs(trades.filter((t) => t.pnl_net < 0).reduce((sum, t) => sum + t.pnl_net, 0));
    
    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;
    
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : "∞";
    const profitFactorNum = totalLosses > 0 ? totalWins / totalLosses : Infinity;
    
    // R-Multiple calculation
    const tradesWithR = trades.filter(t => t.r != null && t.initial_risk != null && t.initial_risk > 0);
    const avgRMultiple = tradesWithR.length > 0 
      ? (tradesWithR.reduce((sum, t) => sum + (t.r || 0), 0) / tradesWithR.length).toFixed(2)
      : "N/A";
    const avgRMultipleNum = tradesWithR.length > 0 
      ? tradesWithR.reduce((sum, t) => sum + (t.r || 0), 0) / tradesWithR.length
      : 0;
    
    // Expectancy calculation
    const lossRate = totalTrades > 0 ? losingTrades / totalTrades : 0;
    const expectancy = (winningTrades / totalTrades) * avgWin - lossRate * avgLoss;
    
    let cumulative = 0;
    let peak = 0;
    let maxDrawdown = 0;
    
    trades.forEach((trade) => {
      cumulative += trade.pnl_net;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    return {
      totalTrades,
      winRate: `${winRate}%`,
      winRateNum,
      netPnL: totalPnL.toFixed(2),
      netPnLNum: totalPnL,
      profitFactor,
      profitFactorNum,
      maxDrawdown: maxDrawdown.toFixed(2),
      avgRMultiple,
      avgRMultipleNum,
      expectancy: expectancy.toFixed(2),
      expectancyNum: expectancy,
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
    };
  };

  const generateEquityCurve = () => {
    let cumulative = 0;
    return trades.map((trade) => {
      cumulative += trade.pnl_net;
      return {
        date: new Date(trade.exit_time).toLocaleDateString(),
        equity: cumulative,
      };
    });
  };

  const generatePnLByMonth = () => {
    const monthlyPnL: { [key: string]: number } = {};
    
    trades.forEach((trade) => {
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
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  const kpis = calculateKPIs();
  const equityData = generateEquityCurve();
  const pnlData = generatePnLByMonth();

  // Color logic for KPIs
  const getWinRateColor = (winRate: number): "success" | "warning" | "destructive" => {
    if (winRate >= 50) return "success";
    if (winRate >= 40) return "warning";
    return "destructive";
  };

  const getRMultipleColor = (rMultiple: number): "success" | "warning" | "destructive" => {
    if (rMultiple >= 1) return "success";
    if (rMultiple >= 0.5) return "warning";
    return "destructive";
  };

  const getProfitFactorColor = (pf: number): "success" | "warning" | "destructive" => {
    if (pf >= 1.5) return "success";
    if (pf >= 1) return "warning";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">{t("dashboard.subtitle")}</p>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("dashboard.noTrades")}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title={t("dashboard.totalTrades")}
              value={kpis.totalTrades}
              icon={Activity}
            />
            <KPICardWithTooltip
              title={t("dashboard.winRate")}
              value={kpis.winRate}
              icon={Target}
              tooltip={t("dashboard.winRateTooltip")}
              glossaryLink="/glossary#win-rate"
              valueColor={getWinRateColor(kpis.winRateNum)}
            />
            <KPICardWithTooltip
              title={t("dashboard.netPnL")}
              value={`$${kpis.netPnL}`}
              icon={DollarSign}
              tooltip={t("dashboard.netPnLTooltip")}
              valueColor={kpis.netPnLNum >= 0 ? "success" : "destructive"}
            />
            <KPICardWithTooltip
              title={t("dashboard.avgRMultiple")}
              value={kpis.avgRMultiple}
              icon={TrendingUp}
              tooltip={t("dashboard.avgRMultipleTooltip")}
              glossaryLink="/glossary#r-multiple"
              valueColor={kpis.avgRMultiple !== "N/A" ? getRMultipleColor(kpis.avgRMultipleNum) : "default"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICardWithTooltip
              title={t("dashboard.expectancy")}
              value={`$${kpis.expectancy}`}
              icon={DollarSign}
              tooltip={t("dashboard.expectancyTooltip")}
              glossaryLink="/glossary#expectancy"
              valueColor={kpis.expectancyNum >= 0 ? "success" : "destructive"}
            />
            <KPICardWithTooltip
              title={t("dashboard.profitFactor")}
              value={kpis.profitFactor}
              icon={TrendingUp}
              tooltip={t("dashboard.profitFactorTooltip")}
              glossaryLink="/glossary#profit-factor"
              valueColor={kpis.profitFactor !== "∞" ? getProfitFactorColor(kpis.profitFactorNum) : "success"}
            />
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-medium">{t("dashboard.avgWinLoss")}</CardTitle>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <p className="text-sm">{t("dashboard.avgWinLossTooltip")}</p>
                      <Link 
                        to="/glossary#avg-win-loss" 
                        className="text-xs text-primary hover:underline mt-2 block"
                      >
                        Learn more in glossary →
                      </Link>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 text-2xl font-bold">
                  <span className="text-success">${kpis.avgWin}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-destructive">${kpis.avgLoss}</span>
                </div>
              </CardContent>
            </Card>
            <KPICardWithTooltip
              title={t("dashboard.maxDrawdown")}
              value={`$${kpis.maxDrawdown}`}
              icon={TrendingUp}
              tooltip={t("dashboard.maxDrawdownTooltip")}
              glossaryLink="/glossary#max-drawdown"
              valueColor="destructive"
            />
          </div>

          <div className="flex gap-6 h-[600px]">
            <div className="flex-1">
              <DashboardCalendar 
                trades={trades}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onEditTrade={handleEditTrade}
                onDeleteTrade={handleDeleteTrade}
              />
            </div>
            <div className="w-80">
              <WeeklyPerformance 
                trades={trades}
                currentMonth={currentMonth}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <EquityCurveChart data={equityData} />
            <PnLChart data={pnlData} title={t("dashboard.pnlByMonth")} />
          </div>
        </>
      )}

      <AddTradeDialog 
        open={editDialogOpen} 
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditTrade(null);
        }}
        onSuccess={loadTrades}
        editTrade={editTrade}
      />
    </div>
  );
};

export default Index;
