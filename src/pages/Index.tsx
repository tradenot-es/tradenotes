import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnLChart } from "@/components/PnLChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Trade {
  id: string;
  pnl_net: number;
  exit_time: string;
}

const Index = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    const { data, error } = await supabase
      .from("trades")
      .select("id, pnl_net, exit_time")
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
    return <div className="flex items-center justify-center min-h-screen">Lädt...</div>;
  }

  const kpis = calculateKPIs();
  const equityData = generateEquityCurve();
  const pnlData = generatePnLByMonth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht deiner Trading-Performance</p>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Noch keine Trades vorhanden. Füge deinen ersten Trade hinzu!</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <KPICard
              title="Total Trades"
              value={kpis.totalTrades}
              icon={Activity}
            />
            <KPICard
              title="Win Rate"
              value={kpis.winRate}
              icon={Target}
            />
            <KPICard
              title="Net P&L"
              value={`$${kpis.netPnL}`}
              icon={DollarSign}
            />
            <KPICard
              title="Profit Factor"
              value={kpis.profitFactor}
              icon={TrendingUp}
            />
            <KPICard
              title="Max Drawdown"
              value={`$${kpis.maxDrawdown}`}
              icon={TrendingUp}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <EquityCurveChart data={equityData} />
            <PnLChart data={pnlData} title="P&L nach Monat" />
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
