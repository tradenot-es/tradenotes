import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
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
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl_net, 0);
    const totalWins = trades.filter((t) => t.pnl_net > 0).reduce((sum, t) => sum + t.pnl_net, 0);
    const totalLosses = Math.abs(trades.filter((t) => t.pnl_net < 0).reduce((sum, t) => sum + t.pnl_net, 0));
    
    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0;
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;
    
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : "∞";
    
    // R-Multiple calculation
    const tradesWithR = trades.filter(t => t.r != null && t.initial_risk != null && t.initial_risk > 0);
    const avgRMultiple = tradesWithR.length > 0 
      ? (tradesWithR.reduce((sum, t) => sum + (t.r || 0), 0) / tradesWithR.length).toFixed(2)
      : "N/A";
    
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
      netPnL: totalPnL.toFixed(2),
      profitFactor,
      maxDrawdown: maxDrawdown.toFixed(2),
      avgRMultiple,
      expectancy: expectancy.toFixed(2),
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
            />
            <KPICard
              title={t("dashboard.netPnL")}
              value={`$${kpis.netPnL}`}
              icon={DollarSign}
            />
            <KPICardWithTooltip
              title={t("dashboard.avgRMultiple")}
              value={kpis.avgRMultiple}
              icon={TrendingUp}
              tooltip={t("dashboard.avgRMultipleTooltip")}
              glossaryLink="/glossary#r-multiple"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICardWithTooltip
              title={t("dashboard.expectancy")}
              value={`$${kpis.expectancy}`}
              icon={DollarSign}
              tooltip={t("dashboard.expectancyTooltip")}
              glossaryLink="/glossary#expectancy"
            />
            <KPICardWithTooltip
              title={t("dashboard.profitFactor")}
              value={kpis.profitFactor}
              icon={TrendingUp}
              tooltip={t("dashboard.profitFactorTooltip")}
              glossaryLink="/glossary#profit-factor"
            />
            <KPICardWithTooltip
              title={t("dashboard.avgWinLoss")}
              value={`$${kpis.avgWin} / $${kpis.avgLoss}`}
              icon={Activity}
              tooltip={t("dashboard.avgWinLossTooltip")}
              glossaryLink="/glossary#avg-win-loss"
            />
            <KPICardWithTooltip
              title={t("dashboard.maxDrawdown")}
              value={`$${kpis.maxDrawdown}`}
              icon={TrendingUp}
              tooltip={t("dashboard.maxDrawdownTooltip")}
              glossaryLink="/glossary#max-drawdown"
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
