import { LucideIcon, TrendingUp, Calendar, Target, BarChart3, Calculator } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface FeaturedKPI {
  label: string;
  value: string | number;
  subValue?: { wins: string; losses: string };
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

interface FeaturedKPIBarProps {
  netProfit: number;
  totalWins: number;
  totalLosses: number;
  totalTrades: number;
  tradingDays: number;
  winRate: number;
  expectancy: number;
}

export function FeaturedKPIBar({ 
  netProfit,
  totalWins,
  totalLosses,
  totalTrades,
  tradingDays, 
  winRate,
  expectancy,
}: FeaturedKPIBarProps) {
  const { t } = useTranslation();
  const { formatCurrencyCompact, formatCurrency } = useCurrency();

  const kpis: FeaturedKPI[] = [
    {
      label: t("dashboard.featured.netProfit"),
      value: formatCurrencyCompact(netProfit),
      subValue: { wins: formatCurrencyCompact(totalWins), losses: formatCurrencyCompact(totalLosses) },
      icon: TrendingUp,
      colorClass: netProfit >= 0 ? "text-success" : "text-destructive",
      bgClass: netProfit >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
    {
      label: t("dashboard.featured.totalTrades"),
      value: totalTrades,
      icon: BarChart3,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: t("dashboard.featured.tradingDays"),
      value: tradingDays,
      icon: Calendar,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: t("dashboard.featured.winRate"),
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
      colorClass: winRate >= 50 ? "text-success" : winRate >= 40 ? "text-warning" : "text-destructive",
      bgClass: winRate >= 50 ? "bg-success/10" : winRate >= 40 ? "bg-warning/10" : "bg-destructive/10",
    },
    {
      label: t("dashboard.featured.expectancy"),
      value: formatCurrency(expectancy),
      icon: Calculator,
      colorClass: expectancy >= 0 ? "text-success" : "text-destructive",
      bgClass: expectancy >= 0 ? "bg-success/10" : "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`
            relative overflow-hidden rounded-xl p-4
            ${kpi.bgClass}
            border border-border/30
            backdrop-blur-sm
            transition-all duration-300
            hover:scale-[1.02] hover:shadow-lg
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${kpi.bgClass}`}>
              <kpi.icon className={`h-5 w-5 ${kpi.colorClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.colorClass} truncate`}>
                {kpi.value}
              </p>
              {kpi.subValue && (
                <p className="text-xs truncate">
                  <span className="text-success">{kpi.subValue.wins}</span>
                  <span className="text-muted-foreground"> / </span>
                  <span className="text-destructive">{kpi.subValue.losses}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
