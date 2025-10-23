import { TrendingUp, DollarSign, Target, Activity } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { EquityCurveChart } from "@/components/EquityCurveChart";
import { PnLChart } from "@/components/PnLChart";
import { mockTrades, calculateKPIs, generateEquityCurve, generatePnLByMonth } from "@/lib/mockData";

const Index = () => {
  const kpis = calculateKPIs(mockTrades);
  const equityData = generateEquityCurve(mockTrades);
  const pnlData = generatePnLByMonth(mockTrades);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your trading performance</p>
      </div>

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
          trend={{
            value: "+12.5% from last month",
            positive: true,
          }}
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
        <PnLChart data={pnlData} title="P&L by Month" />
      </div>
    </div>
  );
};

export default Index;
