import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendingUp, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface Trade {
  exit_time: string;
  pnl_net: number;
}

interface ConsistencyTrackerProps {
  trades: Trade[];
}

export function ConsistencyTracker({ trades }: ConsistencyTrackerProps) {
  const { t } = useTranslation();

  // Get last 12 weeks
  const getWeeksData = () => {
    const weeks: { [key: string]: { count: number; pnl: number } } = {};
    const today = new Date();
    
    // Initialize last 12 weeks
    for (let i = 0; i < 84; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const key = date.toISOString().split('T')[0];
      weeks[key] = { count: 0, pnl: 0 };
    }

    // Fill with trade data
    trades.forEach(trade => {
      const date = new Date(trade.exit_time).toISOString().split('T')[0];
      if (weeks[date]) {
        weeks[date].count++;
        weeks[date].pnl += trade.pnl_net;
      }
    });

    return weeks;
  };

  const weeksData = getWeeksData();
  const dates = Object.keys(weeksData).sort();
  const maxTrades = Math.max(...Object.values(weeksData).map(d => d.count), 1);

  const getIntensityColor = (count: number, pnl: number) => {
    if (count === 0) return "bg-muted border border-border/40";
    const intensity = Math.min(count / maxTrades, 1);
    
    if (pnl > 0) {
      if (intensity > 0.75) return "bg-success border border-success/30";
      if (intensity > 0.5) return "bg-success/70 border border-success/30";
      if (intensity > 0.25) return "bg-success/50 border border-success/30";
      return "bg-success/30 border border-success/30";
    } else if (pnl < 0) {
      if (intensity > 0.75) return "bg-destructive border border-destructive/30";
      if (intensity > 0.5) return "bg-destructive/70 border border-destructive/30";
      if (intensity > 0.25) return "bg-destructive/50 border border-destructive/30";
      return "bg-destructive/30 border border-destructive/30";
    }
    return "bg-muted border border-border/40";
  };

  // Group by weeks (7 days)
  const weeks: string[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("dashboard.consistencyTracker")}
            </CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{t("dashboard.consistencyTrackerTooltip")}</p>
                <a 
                  href="/glossary#consistency-tracker" 
                  className="text-xs text-primary hover:underline mt-2 block"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/glossary#consistency-tracker';
                  }}
                >
                  Learn more in glossary →
                </a>
              </HoverCardContent>
            </HoverCard>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>{t("dashboard.less")}</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted border border-border/40" />
                  <div className="w-3 h-3 rounded-sm bg-success/30 border border-success/30" />
                  <div className="w-3 h-3 rounded-sm bg-success/50 border border-success/30" />
                  <div className="w-3 h-3 rounded-sm bg-success/70 border border-success/30" />
                  <div className="w-3 h-3 rounded-sm bg-success border border-success/30" />
                </div>
              <span>{t("dashboard.more")}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {weeks.reverse().map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1">
                {week.map((date) => {
                  const data = weeksData[date];
                  return (
                    <Tooltip key={date}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm transition-all hover:ring-2 hover:ring-primary cursor-pointer ${getIntensityColor(data.count, data.pnl)}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div className="font-semibold">{new Date(date).toLocaleDateString()}</div>
                          <div>{data.count} {t("dashboard.trades")}</div>
                          <div className={data.pnl >= 0 ? "text-success" : "text-destructive"}>
                            ${data.pnl.toFixed(2)}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
