import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnLChart } from "@/components/PnLChart";
import { DashboardCalendar } from "@/components/DashboardCalendar";
import { WeeklyPerformance } from "@/components/WeeklyPerformance";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  pnl_net: number;
  exit_time: string;
}

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("id, symbol, side, pnl_net, exit_time")
      .order("exit_time", { ascending: true });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  const calculateKPIs = () => {
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl_net > 0).length;
    const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0.0";
    
    const totalPnL = trades.reduce((sum, t) => sum + t.pnl_net, 0);
    const totalWins = trades.filter((t) => t.pnl_net > 0).reduce((sum, t) => sum + t.pnl_net, 0);
    const totalLosses = Math.abs(trades.filter((t) => t.pnl_net < 0).reduce((sum, t) => sum + t.pnl_net, 0));
    
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : "∞";
    
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <KPICard
              title={t("dashboard.totalTrades")}
              value={kpis.totalTrades}
              icon={Activity}
            />
            <KPICard
              title={t("dashboard.winRate")}
              value={kpis.winRate}
              icon={Target}
            />
            <KPICard
              title={t("dashboard.netPnL")}
              value={`$${kpis.netPnL}`}
              icon={DollarSign}
            />
            <KPICard
              title={t("dashboard.profitFactor")}
              value={kpis.profitFactor}
              icon={TrendingUp}
            />
            <KPICard
              title={t("dashboard.maxDrawdown")}
              value={`$${kpis.maxDrawdown}`}
              icon={TrendingUp}
            />
          </div>

          <div className="flex gap-6 h-[600px]">
            <div className="flex-1">
              <DashboardCalendar 
                trades={trades}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
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
    </div>
  );
};

export default Index;
