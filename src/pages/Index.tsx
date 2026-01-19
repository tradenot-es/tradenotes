import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Target, Scale, Award, Plus } from "lucide-react";
import { RadialKPICard } from "@/components/RadialKPICard";
import { FeaturedKPIBar } from "@/components/FeaturedKPIBar";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { WeeklyPerformanceEnhanced } from "@/components/WeeklyPerformanceEnhanced";
import { PortfolioNews } from "@/components/PortfolioNews";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { SectorSentimentWidget } from "@/components/SectorSentimentWidget";
import { TradingAlertsWidget } from "@/components/TradingAlertsWidget";
import logo from "@/assets/tradenotes-logo-new-transparent.png";
import { AchievementsWidget } from "@/components/AchievementsWidget";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/useCurrency";
interface Trade {
  id: string;
  symbol: string;
  side: string;
  market: string;
  qty: number;
  entry_price: number;
  account_type?: string | null;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatCurrency, formatCurrencyCompact } = useCurrency();
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
    
    const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl_net)) : 0;
    const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl_net)) : 0;
    
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
    
    // Calculate trading days
    const uniqueTradingDays = new Set(
      trades.map(t => new Date(t.exit_time).toDateString())
    ).size;

    // Calculate average per trade
    const avgTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;
    
    return {
      totalTrades,
      winningTrades,
      losingTrades,
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
      avgWin,
      avgLoss,
      bestTrade,
      worstTrade,
      tradingDays: uniqueTradingDays,
      avgTrade,
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  const kpis = calculateKPIs();
  const equityData = generateEquityCurve();

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
    <div className="space-y-8 p-2">
      <div className="glossy-card p-8 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground mt-2">{t("dashboard.subtitle")}</p>
          </div>
          <div className="flex-1 flex justify-center">
            <img 
              src={logo} 
              alt="TradeNotes" 
              className="h-72 w-auto drop-shadow-[0_0_25px_hsl(158,100%,45%,0.5)]" 
            />
          </div>
          <Button 
            onClick={() => navigate('/dashboard/trades?addTrade=true')}
            className="gap-2"
            size="lg"
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.addTrade")}
          </Button>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="glossy-card p-12 text-center rounded-2xl">
          <p className="text-muted-foreground text-lg">{t("dashboard.noTrades")}</p>
        </div>
      ) : (
        <>
          {/* Featured KPI Bar - Top Overview */}
          <FeaturedKPIBar
            netProfit={kpis.netPnLNum}
            totalWins={trades.filter((t) => t.pnl_net > 0).reduce((sum, t) => sum + t.pnl_net, 0)}
            totalLosses={Math.abs(trades.filter((t) => t.pnl_net < 0).reduce((sum, t) => sum + t.pnl_net, 0))}
            totalTrades={kpis.totalTrades}
            tradingDays={kpis.tradingDays}
            avgTrade={kpis.avgTrade}
            expectancy={kpis.expectancyNum}
          />

          {/* Achievements Widget */}
          <AchievementsWidget />

          {/* Radial Progress KPIs - Featured Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <RadialKPICard
              title={t("dashboard.winRate")}
              value={kpis.winRateNum}
              displayValue={kpis.winRate}
              icon={Target}
              tooltip={t("dashboard.winRateTooltip")}
              glossaryLink="/glossary#win-rate"
              color={getWinRateColor(kpis.winRateNum)}
            />
            {kpis.avgRMultiple !== "N/A" ? (
              <RadialKPICard
                title={t("dashboard.avgRMultiple")}
                value={Math.min(kpis.avgRMultipleNum * 50, 100)}
                displayValue={kpis.avgRMultiple}
                icon={Scale}
                tooltip={t("dashboard.avgRMultipleTooltip")}
                glossaryLink="/glossary#r-multiple"
                color={getRMultipleColor(kpis.avgRMultipleNum)}
              />
            ) : (
              <RadialKPICard
                title={t("dashboard.avgRMultiple")}
                value={0}
                displayValue="N/A"
                icon={Scale}
                tooltip={t("dashboard.avgRMultipleTooltip")}
                glossaryLink="/glossary#r-multiple"
                color="primary"
              />
            )}
            {kpis.profitFactor !== "∞" && kpis.profitFactorNum <= 5 ? (
              <RadialKPICard
                title={t("dashboard.profitFactor")}
                value={Math.min(kpis.profitFactorNum * 20, 100)}
                displayValue={kpis.profitFactor}
                icon={Award}
                tooltip={t("dashboard.profitFactorTooltip")}
                glossaryLink="/glossary#profit-factor"
                color={getProfitFactorColor(kpis.profitFactorNum)}
              />
            ) : (
              <RadialKPICard
                title={t("dashboard.profitFactor")}
                value={100}
                displayValue={kpis.profitFactor}
                icon={Award}
                tooltip={t("dashboard.profitFactorTooltip")}
                glossaryLink="/glossary#profit-factor"
                color="success"
              />
            )}
          </div>

          {/* Equity Curve Chart - Full width */}
          <EquityCurveChart data={equityData} />

          {/* AI Trading Alerts - Proactive Warnings */}
          <TradingAlertsWidget trades={trades} />

          {/* Calendar and Weekly Performance */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <DashboardCalendar 
                trades={trades}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                onEditTrade={handleEditTrade}
                onDeleteTrade={handleDeleteTrade}
              />
            </div>
            <div>
              <WeeklyPerformanceEnhanced trades={trades} />
            </div>
          </div>

          {/* Sector Sentiment - AI powered */}
          <SectorSentimentWidget />

          {/* Portfolio News - Full width */}
          <PortfolioNews />
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
