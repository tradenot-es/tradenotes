import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { RadialProgress } from "@/components/RadialProgress";
import { PieChart, Info } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface Trade {
  market: string;
  pnl_net: number;
}

interface MarketBreakdownProps {
  trades: Trade[];
}

export function MarketBreakdown({ trades }: MarketBreakdownProps) {
  const { formatCurrency } = useCurrency();
  
  // Calculate performance per market
  const marketStats = trades.reduce((acc, trade) => {
    const market = trade.market || "Stock";
    if (!acc[market]) {
      acc[market] = {
        market,
        totalPnL: 0,
        trades: 0,
        wins: 0,
      };
    }
    acc[market].totalPnL += trade.pnl_net;
    acc[market].trades += 1;
    if (trade.pnl_net > 0) acc[market].wins += 1;
    return acc;
  }, {} as Record<string, { market: string; totalPnL: number; trades: number; wins: number }>);

  const markets = Object.values(marketStats);
  const totalTrades = trades.length;

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Market Performance
          </CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">
                Performance-Übersicht nach Märkten (Stock, Crypto, Forex, etc.). 
                Zeigt Win Rate, Gesamt-P&L und Marktanteil für jeden gehandelten Markt.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {markets.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4 col-span-full">
              No trades yet
            </p>
          ) : (
            markets.map((stat) => {
              const winRate = (stat.wins / stat.trades) * 100;
              const marketShare = (stat.trades / totalTrades) * 100;
              
              const getColor = (pnl: number): "success" | "destructive" | "warning" => {
                if (pnl > 0) return "success";
                if (pnl < 0) return "destructive";
                return "warning";
              };

              return (
                <div key={stat.market} className="flex flex-col items-center">
                  <RadialProgress
                    value={winRate}
                    size={100}
                    strokeWidth={6}
                    color={getColor(stat.totalPnL)}
                    subtitle={stat.market}
                  />
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-bold ${stat.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(stat.totalPnL)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.trades} trades ({marketShare.toFixed(0)}%)
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
