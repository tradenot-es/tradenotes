import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useCurrency } from "@/hooks/useCurrency";

interface Trade {
  entry_time: string;
  exit_time: string;
  pnl_net: number;
}

interface HourOfDayAnalysisProps {
  trades: Trade[];
}

export function HourOfDayAnalysis({ trades }: HourOfDayAnalysisProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const hourData = useMemo(() => {
    const hourStats = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      trades: 0,
      pnl: 0,
      wins: 0,
      losses: 0
    }));

    trades.forEach(trade => {
      // Use entry time for hour analysis
      const hour = new Date(trade.entry_time).getHours();
      hourStats[hour].trades++;
      hourStats[hour].pnl += trade.pnl_net;
      if (trade.pnl_net > 0) hourStats[hour].wins++;
      else if (trade.pnl_net < 0) hourStats[hour].losses++;
    });

    const filteredHours = hourStats
      .filter(h => h.trades > 0)
      .map(stat => ({
        ...stat,
        hourLabel: `${stat.hour.toString().padStart(2, '0')}:00`,
        winRate: ((stat.wins / stat.trades) * 100).toFixed(1),
        avgPnl: (stat.pnl / stat.trades).toFixed(2)
      }));

    // Find best and worst hours
    const sortedByPnl = [...filteredHours].sort((a, b) => b.pnl - a.pnl);
    const bestHours = sortedByPnl.filter(h => h.pnl > 0).slice(0, 3);
    const worstHours = sortedByPnl.filter(h => h.pnl < 0).slice(-3).reverse();

    return {
      hourlyData: filteredHours,
      bestHours,
      worstHours
    };
  }, [trades]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("reports.hourOfDayPerformance")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourData.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="hourLabel" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.hourLabel}</p>
                        <p className="text-sm">
                          {t("reports.trades")}: {data.trades}
                        </p>
                        <p className="text-sm">
                          {t("reports.winRate")}: {data.winRate}%
                        </p>
                        <p className={`text-sm font-semibold ${data.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                          P&L: {formatCurrency(data.pnl)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="pnl">
                {hourData.hourlyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Trading Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-success">
              {t("reports.bestTradingHours")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hourData.bestHours.length > 0 ? (
                hourData.bestHours.map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/20">
                    <div>
                      <div className="font-semibold">{hour.hourLabel}</div>
                      <div className="text-sm text-muted-foreground">
                        {hour.trades} {t("reports.trades")} • {hour.winRate}% {t("reports.winRate")}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-success">
                      {formatCurrency(hour.pnl)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {t("reports.noData")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Worst Trading Hours */}
        {hourData.worstHours.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-destructive">
                {t("reports.worstTradingHours")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hourData.worstHours.map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <div>
                      <div className="font-semibold">{hour.hourLabel}</div>
                      <div className="text-sm text-muted-foreground">
                        {hour.trades} {t("reports.trades")} • {hour.winRate}% {t("reports.winRate")}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-destructive">
                      {formatCurrency(hour.pnl)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">
          {t("reports.hourOfDayInsight")}
        </p>
      </div>
    </div>
  );
}
