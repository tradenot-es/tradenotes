import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccountTypeStats } from "@/hooks/useAccountTypeStats";
import { useCurrency } from "@/hooks/useCurrency";
import { AccountType } from "@/types/trade";
import { Info } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface Trade {
  account_type?: AccountType | string | null;
  pnl_net: number;
}

interface AccountPerformanceWidgetProps {
  trades: Trade[];
}

const getAccountTypeLabel = (type: AccountType, t: any) => {
  const labels = {
    sim: t("accountTypes.sim"),
    evaluation: t("accountTypes.evaluation"),
    performance: t("accountTypes.performance"),
    live: t("accountTypes.live"),
  };
  return labels[type] || type;
};

const getAccountTypeEmoji = (type: AccountType) => {
  const emojis = {
    sim: "🔵",
    evaluation: "🟡",
    performance: "🟢",
    live: "🔴",
  };
  return emojis[type] || "⚪";
};

export function AccountPerformanceWidget({ trades }: AccountPerformanceWidgetProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatCurrencyCompact } = useCurrency();
  const stats = useAccountTypeStats(trades);

  // Only show if there's more than one account type traded
  if (stats.length <= 1) {
    return null;
  }

  return (
    <Card className="elegant-shadow cursor-pointer hover:shadow-glow transition-shadow" onClick={() => navigate('/dashboard/reports?tab=accounts')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{t("dashboard.accountPerformance")}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button 
                  className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{t("dashboard.accountPerformanceTooltip")}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          <span className="text-xs text-muted-foreground">{t("dashboard.clickForDetails")}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {stats.map((stat) => (
            <Badge
              key={stat.accountType}
              variant={stat.totalPnL >= 0 ? "default" : "destructive"}
              className="text-sm px-3 py-1"
            >
              <span className="mr-1">{getAccountTypeEmoji(stat.accountType)}</span>
              <span className="font-semibold">{getAccountTypeLabel(stat.accountType, t)}:</span>
              <span className={stat.totalPnL >= 0 ? "text-success ml-1" : "text-destructive-foreground ml-1"}>
                {formatCurrencyCompact(stat.totalPnL)}
              </span>
              <span className="text-muted-foreground ml-1">({stat.trades})</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
