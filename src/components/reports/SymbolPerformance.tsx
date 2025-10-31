import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface Trade {
  symbol: string;
  pnl_net: number;
}

interface SymbolPerformanceProps {
  trades: Trade[];
}

export function SymbolPerformance({ trades }: SymbolPerformanceProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();

  const symbolData = useMemo(() => {
    const symbolMap = new Map<string, {
      trades: number;
      pnl: number;
      wins: number;
      losses: number;
    }>();

    trades.forEach(trade => {
      const current = symbolMap.get(trade.symbol) || {
        trades: 0,
        pnl: 0,
        wins: 0,
        losses: 0
      };

      current.trades++;
      current.pnl += trade.pnl_net;
      if (trade.pnl_net > 0) current.wins++;
      else if (trade.pnl_net < 0) current.losses++;

      symbolMap.set(trade.symbol, current);
    });

    const symbolArray = Array.from(symbolMap.entries()).map(([symbol, stats]) => ({
      symbol,
      ...stats,
      winRate: ((stats.wins / stats.trades) * 100).toFixed(1),
      avgPnl: (stats.pnl / stats.trades).toFixed(2)
    }));

    // Sort by total P&L
    const sortedByPnl = [...symbolArray].sort((a, b) => b.pnl - a.pnl);
    
    // Top 5 most profitable
    const topProfitable = sortedByPnl.filter(s => s.pnl > 0).slice(0, 5);
    
    // Top 5 least profitable (most losses)
    const topUnprofitable = sortedByPnl.filter(s => s.pnl < 0).slice(-5).reverse();
    
    // Most traded
    const mostTraded = [...symbolArray].sort((a, b) => b.trades - a.trades).slice(0, 5);

    return {
      topProfitable,
      topUnprofitable,
      mostTraded,
      totalSymbols: symbolArray.length
    };
  }, [trades]);

  const SymbolCard = ({ 
    symbol, 
    trades, 
    pnl, 
    winRate, 
    avgPnl 
  }: { 
    symbol: string; 
    trades: number; 
    pnl: number; 
    winRate: string; 
    avgPnl: string;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex-1">
        <div className="font-semibold text-lg">{symbol}</div>
        <div className="text-sm text-muted-foreground">
          {trades} {t("reports.trades")} • {winRate}% {t("reports.winRate")}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-lg font-bold ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
          {formatCurrency(pnl)}
        </div>
        <div className="text-xs text-muted-foreground">
          Avg: {formatCurrency(parseFloat(avgPnl))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Profitable Symbols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            {t("reports.topProfitableSymbols")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {symbolData.topProfitable.length > 0 ? (
              symbolData.topProfitable.map((sym) => (
                <SymbolCard key={sym.symbol} {...sym} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("reports.noData")}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Unprofitable Symbols */}
      {symbolData.topUnprofitable.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              {t("reports.topUnprofitableSymbols")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {symbolData.topUnprofitable.map((sym) => (
                <SymbolCard key={sym.symbol} {...sym} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Most Traded Symbols */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {t("reports.mostTradedSymbols")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {symbolData.mostTraded.length > 0 ? (
              symbolData.mostTraded.map((sym) => (
                <SymbolCard key={sym.symbol} {...sym} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("reports.noData")}
              </div>
            )}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              {t("reports.totalSymbols")}: <span className="font-semibold">{symbolData.totalSymbols}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
