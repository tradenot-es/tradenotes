import { Trade } from "@/types/trade";

export const mockTrades: Trade[] = [
  {
    id: "1",
    symbol: "AAPL",
    side: "long",
    qty: 100,
    entryPrice: 175.5,
    exitPrice: 178.2,
    entryTime: "2025-01-15T09:30:00",
    exitTime: "2025-01-15T15:30:00",
    fees: 2.5,
    pnlNet: 267.5,
    r: 1.5,
    tags: ["momentum", "tech"],
    setup: "Breakout",
    note: "Clean breakout above resistance",
  },
  {
    id: "2",
    symbol: "TSLA",
    side: "short",
    qty: 50,
    entryPrice: 242.0,
    exitPrice: 238.5,
    entryTime: "2025-01-16T10:00:00",
    exitTime: "2025-01-16T14:00:00",
    fees: 2.0,
    pnlNet: 173.0,
    r: 1.2,
    tags: ["reversal"],
    setup: "Failed Rally",
  },
  {
    id: "3",
    symbol: "MSFT",
    side: "long",
    qty: 75,
    entryPrice: 415.0,
    exitPrice: 412.5,
    entryTime: "2025-01-17T09:45:00",
    exitTime: "2025-01-17T11:30:00",
    fees: 2.0,
    pnlNet: -189.5,
    r: -0.8,
    tags: ["tech"],
    setup: "Gap Fill",
    note: "Stop loss hit",
  },
  {
    id: "4",
    symbol: "NVDA",
    side: "long",
    qty: 40,
    entryPrice: 495.0,
    exitPrice: 502.5,
    entryTime: "2025-01-18T10:30:00",
    exitTime: "2025-01-18T15:00:00",
    fees: 2.0,
    pnlNet: 298.0,
    r: 2.0,
    tags: ["momentum", "tech"],
    setup: "Breakout",
  },
  {
    id: "5",
    symbol: "SPY",
    side: "long",
    qty: 200,
    entryPrice: 478.0,
    exitPrice: 479.5,
    entryTime: "2025-01-19T09:30:00",
    exitTime: "2025-01-19T12:00:00",
    fees: 2.5,
    pnlNet: 297.5,
    r: 1.3,
    tags: ["index"],
    setup: "Trend Follow",
  },
];

export function calculateKPIs(trades: Trade[]) {
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnlNet > 0).length;
  const losingTrades = trades.filter((t) => t.pnlNet < 0).length;
  const winRate = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : "0.0";
  
  const totalPnL = trades.reduce((sum, t) => sum + t.pnlNet, 0);
  const totalWins = trades.filter((t) => t.pnlNet > 0).reduce((sum, t) => sum + t.pnlNet, 0);
  const totalLosses = Math.abs(trades.filter((t) => t.pnlNet < 0).reduce((sum, t) => sum + t.pnlNet, 0));
  
  const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : "∞";
  
  // Calculate Max Drawdown
  const sorted = [...trades].sort((a, b) => 
    new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime()
  );
  
  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  
  sorted.forEach((trade) => {
    cumulative += trade.pnlNet;
    if (cumulative > peak) {
      peak = cumulative;
    }
    const drawdown = peak - cumulative;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  return {
    totalTrades,
    winRate: `${winRate}%`,
    netPnL: totalPnL.toFixed(2),
    profitFactor,
    maxDrawdown: maxDrawdown.toFixed(2),
  };
}

export function generateEquityCurve(trades: Trade[]) {
  const sorted = [...trades].sort((a, b) => 
    new Date(a.exitTime).getTime() - new Date(b.exitTime).getTime()
  );
  
  let cumulative = 0;
  return sorted.map((trade) => {
    cumulative += trade.pnlNet;
    return {
      date: new Date(trade.exitTime).toLocaleDateString(),
      equity: cumulative,
    };
  });
}

export function generatePnLByMonth(trades: Trade[]) {
  const monthlyPnL: { [key: string]: number } = {};
  
  trades.forEach((trade) => {
    const month = new Date(trade.exitTime).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short" 
    });
    monthlyPnL[month] = (monthlyPnL[month] || 0) + trade.pnlNet;
  });
  
  return Object.entries(monthlyPnL).map(([period, pnl]) => ({
    period,
    pnl,
  }));
}
