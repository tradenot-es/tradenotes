import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Trade {
  entry_time: string;
  exit_time: string;
  pnl_net: number;
}

interface HoldingPeriodAnalysisProps {
  trades: Trade[];
}

export function HoldingPeriodAnalysis({ trades }: HoldingPeriodAnalysisProps) {
  const { t } = useTranslation();

  const holdingData = useMemo(() => {
    if (trades.length === 0) {
      return {
        avgWinHoldHours: 0,
        avgLossHoldHours: 0,
        avgWinHoldDays: 0,
        avgLossHoldDays: 0,
        holdRatio: 0,
        distribution: []
      };
    }

    const winTrades = trades.filter(t => t.pnl_net > 0);
    const lossTrades = trades.filter(t => t.pnl_net < 0);

    const calculateHours = (entry: string, exit: string) => {
      return (new Date(exit).getTime() - new Date(entry).getTime()) / (1000 * 60 * 60);
    };

    const winHours = winTrades.map(t => calculateHours(t.entry_time, t.exit_time));
    const lossHours = lossTrades.map(t => calculateHours(t.entry_time, t.exit_time));

    const avgWinHoldHours = winHours.length > 0 
      ? winHours.reduce((sum, h) => sum + h, 0) / winHours.length 
      : 0;

    const avgLossHoldHours = lossHours.length > 0 
      ? lossHours.reduce((sum, h) => sum + h, 0) / lossHours.length 
      : 0;

    const avgWinHoldDays = avgWinHoldHours / 24;
    const avgLossHoldDays = avgLossHoldHours / 24;

    const holdRatio = avgLossHoldHours > 0 ? avgWinHoldHours / avgLossHoldHours : 0;

    // Distribution by holding period ranges
    const allHours = trades.map(t => ({
      hours: calculateHours(t.entry_time, t.exit_time),
      pnl: t.pnl_net
    }));

    const ranges = [
      { label: "< 1h", min: 0, max: 1 },
      { label: "1-4h", min: 1, max: 4 },
      { label: "4-8h", min: 4, max: 8 },
      { label: "8-24h", min: 8, max: 24 },
      { label: "1-3d", min: 24, max: 72 },
      { label: "> 3d", min: 72, max: Infinity }
    ];

    const distribution = ranges.map(range => {
      const tradesInRange = allHours.filter(t => t.hours >= range.min && t.hours < range.max);
      const wins = tradesInRange.filter(t => t.pnl > 0).length;
      const losses = tradesInRange.filter(t => t.pnl < 0).length;
      const totalPnl = tradesInRange.reduce((sum, t) => sum + t.pnl, 0);
      
      return {
        range: range.label,
        trades: tradesInRange.length,
        wins,
        losses,
        pnl: totalPnl,
        winRate: tradesInRange.length > 0 ? ((wins / tradesInRange.length) * 100).toFixed(1) : "0"
      };
    }).filter(d => d.trades > 0);

    return {
      avgWinHoldHours,
      avgLossHoldHours,
      avgWinHoldDays,
      avgLossHoldDays,
      holdRatio,
      distribution
    };
  }, [trades]);

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`;
    } else {
      return `${(hours / 24).toFixed(1)}d`;
    }
  };

  const getRatioStatus = () => {
    if (holdingData.holdRatio > 1.5) return { text: t("reports.optimal"), color: "text-success" };
    if (holdingData.holdRatio > 0.8) return { text: t("reports.good"), color: "text-warning" };
    return { text: t("reports.needsImprovement"), color: "text-destructive" };
  };

  const ratioStatus = getRatioStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("reports.holdingPeriodAnalysis")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Average Win Hold */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("reports.avgWinHold")}
                </span>
              </div>
              <div className="text-3xl font-bold text-success">
                {formatDuration(holdingData.avgWinHoldHours)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {holdingData.avgWinHoldDays.toFixed(2)} {t("reports.days")}
              </div>
            </div>

            {/* Average Loss Hold */}
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("reports.avgLossHold")}
                </span>
              </div>
              <div className="text-3xl font-bold text-destructive">
                {formatDuration(holdingData.avgLossHoldHours)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {holdingData.avgLossHoldDays.toFixed(2)} {t("reports.days")}
              </div>
            </div>

            {/* Hold Ratio */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {t("reports.holdRatio")}
                </span>
              </div>
              <div className="text-3xl font-bold">
                {holdingData.holdRatio.toFixed(2)}x
              </div>
              <div className={`text-xs font-medium mt-1 ${ratioStatus.color}`}>
                {ratioStatus.text}
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {t("reports.holdingPeriodInsight")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("reports.holdingPeriodDistribution")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={holdingData.distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="trades" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
