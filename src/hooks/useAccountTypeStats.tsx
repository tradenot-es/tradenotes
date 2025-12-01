import { useMemo } from "react";
import { AccountType } from "@/types/trade";

interface Trade {
  account_type?: AccountType | string | null;
  pnl_net: number;
}

export interface AccountTypeStats {
  accountType: AccountType;
  trades: number;
  wins: number;
  losses: number;
  totalPnL: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

export const useAccountTypeStats = (trades: Trade[]) => {
  return useMemo(() => {
    const statsMap = new Map<AccountType, {
      trades: number;
      wins: number;
      losses: number;
      totalPnL: number;
      totalWins: number;
      totalLosses: number;
    }>();

    // Initialize stats for all account types
    const accountTypes: AccountType[] = ['sim', 'evaluation', 'performance', 'live'];
    accountTypes.forEach(type => {
      statsMap.set(type, {
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnL: 0,
        totalWins: 0,
        totalLosses: 0,
      });
    });

    // Calculate stats
    trades.forEach(trade => {
      const accountType = (trade.account_type || 'live') as AccountType;
      const stats = statsMap.get(accountType);
      if (!stats) return;

      stats.trades++;
      stats.totalPnL += trade.pnl_net;

      if (trade.pnl_net > 0) {
        stats.wins++;
        stats.totalWins += trade.pnl_net;
      } else if (trade.pnl_net < 0) {
        stats.losses++;
        stats.totalLosses += Math.abs(trade.pnl_net);
      }
    });

    // Convert to array and calculate derived metrics
    const results: AccountTypeStats[] = Array.from(statsMap.entries())
      .filter(([_, stats]) => stats.trades > 0) // Only include types with trades
      .map(([accountType, stats]) => ({
        accountType,
        trades: stats.trades,
        wins: stats.wins,
        losses: stats.losses,
        totalPnL: stats.totalPnL,
        winRate: stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0,
        avgWin: stats.wins > 0 ? stats.totalWins / stats.wins : 0,
        avgLoss: stats.losses > 0 ? stats.totalLosses / stats.losses : 0,
        profitFactor: stats.totalLosses > 0 ? stats.totalWins / stats.totalLosses : Infinity,
      }))
      .sort((a, b) => b.totalPnL - a.totalPnL); // Sort by total P&L

    return results;
  }, [trades]);
};
