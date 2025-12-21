import { LucideIcon, DollarSign, TrendingUp, Calendar, Target, BarChart3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface FeaturedKPI {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
}

interface FeaturedKPIBarProps {
  totalBalance: number;
  netProfit: number;
  tradingDays: number;
  winRate: number;
  avgTrade: number;
}

export function FeaturedKPIBar({ 
  totalBalance, 
  netProfit, 
  tradingDays, 
  winRate, 
  avgTrade 
}: FeaturedKPIBarProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatCurrencyCompact } = useCurrency();

  const kpis: FeaturedKPI[] = [
    {
      label: t("dashboard.featured.totalBalance"),
      value: formatCurrencyCompact(totalBalance),
      icon: DollarSign,
      colorClass: "text-primary",
      bgClass: "bg-primary/10",
    },
    {
      label: t("dashboard.featured.netProfit"),
      value: formatCurrencyCompact(netProfit),
      icon: TrendingUp,
      colorClass: netProfit >= 0 ? "text-success" : "text-destructive",
      bgClass: netProfit >= 0 ? "bg-success/10" : "bg-destructive/10",
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
      label: t("dashboard.featured.avgTrade"),
      value: formatCurrency(avgTrade),
      icon: BarChart3,
      colorClass: avgTrade >= 0 ? "text-success" : "text-destructive",
      bgClass: avgTrade >= 0 ? "bg-success/10" : "bg-destructive/10",
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
