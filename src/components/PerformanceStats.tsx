import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { RadialProgress } from "@/components/RadialProgress";
import { useTranslation } from "react-i18next";
import { BarChart3, Info } from "lucide-react";

interface PerformanceStatsProps {
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  totalTrades: number;
}

export function PerformanceStats({
  winningTrades,
  losingTrades,
  avgWin,
  avgLoss,
  bestTrade,
  worstTrade,
  totalTrades,
}: PerformanceStatsProps) {
  const { t } = useTranslation();
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            {t("dashboard.performanceBreakdown")}
          </CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("dashboard.performanceBreakdownTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center">
          <RadialProgress
            value={winRate}
            size={140}
            strokeWidth={10}
            color={winRate >= 50 ? "success" : winRate >= 40 ? "warning" : "destructive"}
            label={t("dashboard.winLossRatio")}
          />
          <div className="mt-3 text-center">
            <span className="font-medium">
              <span className="text-success">{winningTrades}</span>
              {" / "}
              <span className="text-destructive">{losingTrades}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("dashboard.avgWin")}</p>
            <p className="text-xl font-bold text-success">${avgWin.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("dashboard.avgLoss")}</p>
            <p className="text-xl font-bold text-destructive">${avgLoss.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("dashboard.bestTrade")}</p>
            <p className="text-xl font-bold text-success">${bestTrade.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("dashboard.worstTrade")}</p>
            <p className="text-xl font-bold text-destructive">${worstTrade.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
