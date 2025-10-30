import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Trade {
  symbol: string;
  pnl_net: number;
  market: string;
}

interface TopSymbolsProps {
  trades: Trade[];
}

export function TopSymbols({ trades }: TopSymbolsProps) {
  // Calculate performance per symbol
  const symbolStats = trades.reduce((acc, trade) => {
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = {
        symbol: trade.symbol,
        market: trade.market,
        totalPnL: 0,
        trades: 0,
        wins: 0,
      };
    }
    acc[trade.symbol].totalPnL += trade.pnl_net;
    acc[trade.symbol].trades += 1;
    if (trade.pnl_net > 0) acc[trade.symbol].wins += 1;
    return acc;
  }, {} as Record<string, { symbol: string; market: string; totalPnL: number; trades: number; wins: number }>);

  // Sort by total PnL and get top 5
  const topSymbols = Object.values(symbolStats)
    .sort((a, b) => b.totalPnL - a.totalPnL)
    .slice(0, 5);

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Top Performing Symbols
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSymbols.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No trades yet
            </p>
          ) : (
            topSymbols.map((stat, index) => {
              const winRate = (stat.wins / stat.trades) * 100;
              return (
                <div
                  key={stat.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stat.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {stat.market}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stat.trades} trades • {winRate.toFixed(0)}% win rate
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${stat.totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {stat.totalPnL >= 0 ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                    ${Math.abs(stat.totalPnL).toFixed(2)}
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
