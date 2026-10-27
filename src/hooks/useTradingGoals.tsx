import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { 
  TradingGoalsConfig, 
  defaultTradingGoals, 
  GoalKey, 
  DayGoalResult 
} from "@/types/tradingGoals";
import { format, parseISO } from "date-fns";
import { CooldownRule, defaultCooldownRule } from "@/lib/behavior";

interface Trade {
  id: string;
  pnl_net: number;
  fees: number;
  r?: number | null;
  exit_time: string;
  initial_risk?: number | null;
}

export function useTradingGoals(trades: Trade[]) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<TradingGoalsConfig>(defaultTradingGoals);
  const [cooldown, setCooldown] = useState<CooldownRule>(defaultCooldownRule);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user]);

  const loadGoals = async () => {
    const { data, error } = await db
      .from("user_settings")
      .select("trading_goals, cooldown_rule")
      .maybeSingle();

    if (!error && data?.trading_goals) {
      const storedGoals = data.trading_goals as unknown as Partial<TradingGoalsConfig>;
      setGoals({ ...defaultTradingGoals, ...storedGoals });
    }
    if (!error && data?.cooldown_rule) {
      setCooldown({ ...defaultCooldownRule, ...(data.cooldown_rule as Partial<CooldownRule>) });
    }
    setLoading(false);
  };

  const saveGoals = async (newGoals: TradingGoalsConfig) => {
    setGoals(newGoals);
    await db
      .from("user_settings")
      .update({ trading_goals: newGoals as any })
      .eq("user_id", user?.id);
  };

  const enabledGoals = useMemo(() => {
    return (Object.entries(goals) as [GoalKey, typeof goals.daily_pnl][])
      .filter(([_, config]) => config.enabled);
  }, [goals]);

  // Calculate goal fulfillment for each day
  const dailyResults = useMemo((): DayGoalResult[] => {
    const dailyMap = new Map<string, Trade[]>();

    trades.forEach((trade) => {
      const date = format(parseISO(trade.exit_time), "yyyy-MM-dd");
      const existing = dailyMap.get(date) || [];
      existing.push(trade);
      dailyMap.set(date, existing);
    });

    return Array.from(dailyMap.entries())
      .map(([date, dayTrades]) => {
        const pnl = dayTrades.reduce((sum, t) => sum + t.pnl_net, 0);
        const tradesCount = dayTrades.length;
        const wins = dayTrades.filter((t) => t.pnl_net > 0);
        const losses = dayTrades.filter((t) => t.pnl_net < 0);
        const winRate = tradesCount > 0 ? (wins.length / tradesCount) * 100 : 0;
        const totalFees = dayTrades.reduce((sum, t) => sum + (t.fees || 0), 0);
        
        // Calculate max drawdown for the day
        let cumulative = 0;
        let peak = 0;
        let maxDrawdown = 0;
        dayTrades.forEach((t) => {
          cumulative += t.pnl_net;
          if (cumulative > peak) peak = cumulative;
          const dd = peak - cumulative;
          if (dd > maxDrawdown) maxDrawdown = dd;
        });

        // Calculate avg R
        const tradesWithR = dayTrades.filter((t) => t.r != null);
        const avgR = tradesWithR.length > 0
          ? tradesWithR.reduce((sum, t) => sum + (t.r || 0), 0) / tradesWithR.length
          : 0;

        // Calculate max losing streak
        let maxLosingStreak = 0;
        let currentStreak = 0;
        dayTrades.forEach((t) => {
          if (t.pnl_net < 0) {
            currentStreak++;
            if (currentStreak > maxLosingStreak) maxLosingStreak = currentStreak;
          } else {
            currentStreak = 0;
          }
        });

        // Calculate profit factor
        const totalWins = wins.reduce((sum, t) => sum + t.pnl_net, 0);
        const totalLosses = Math.abs(losses.reduce((sum, t) => sum + t.pnl_net, 0));
        const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

        // New goal calculations
        const winsCount = wins.length;
        const lossesCount = losses.length;
        const avgWin = winsCount > 0 ? totalWins / winsCount : 0;
        const avgLoss = lossesCount > 0 ? totalLosses / lossesCount : 0;
        const maxRiskPerTrade = Math.max(...dayTrades.map(t => t.initial_risk || 0), 0);
        const bestTrade = dayTrades.length > 0 ? Math.max(...dayTrades.map(t => t.pnl_net)) : 0;
        const worstTrade = dayTrades.length > 0 ? Math.abs(Math.min(...dayTrades.map(t => t.pnl_net))) : 0;

        // Calculate each goal
        const goalResults: Record<GoalKey, { value: number; percentage: number; achieved: boolean }> = {
          daily_pnl: calculateGoalResult(pnl, goals.daily_pnl),
          max_trades: calculateGoalResult(tradesCount, goals.max_trades),
          min_win_rate: calculateGoalResult(winRate, goals.min_win_rate),
          max_drawdown: calculateGoalResult(maxDrawdown, goals.max_drawdown),
          max_commissions: calculateGoalResult(totalFees, goals.max_commissions),
          min_avg_r: calculateGoalResult(avgR, goals.min_avg_r),
          max_losing_streak: calculateGoalResult(maxLosingStreak, goals.max_losing_streak),
          min_profit_factor: calculateGoalResult(profitFactor === Infinity ? 999 : profitFactor, goals.min_profit_factor),
          // New goals
          min_wins: calculateGoalResult(winsCount, goals.min_wins),
          max_losses: calculateGoalResult(lossesCount, goals.max_losses),
          min_avg_win: calculateGoalResult(avgWin, goals.min_avg_win),
          max_avg_loss: calculateGoalResult(avgLoss, goals.max_avg_loss),
          max_risk_per_trade: calculateGoalResult(maxRiskPerTrade, goals.max_risk_per_trade),
          min_best_trade: calculateGoalResult(bestTrade, goals.min_best_trade),
          max_worst_trade: calculateGoalResult(worstTrade, goals.max_worst_trade),
        };

        // Calculate composite score (average of enabled goals)
        const enabledResults = enabledGoals.map(([key]) => goalResults[key]);
        const compositeScore = enabledResults.length > 0
          ? enabledResults.reduce((sum, r) => sum + r.percentage, 0) / enabledResults.length
          : 0;

        return {
          date,
          goals: goalResults,
          compositeScore: Math.min(100, compositeScore),
          tradesCount,
          pnl,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, goals, enabledGoals]);

  return {
    goals,
    cooldown,
    setGoals: saveGoals,
    enabledGoals,
    dailyResults,
    loading,
    refetch: loadGoals,
  };
}

function calculateGoalResult(
  value: number,
  goal: { enabled: boolean; target: number; operator: ">=" | "<=" }
): { value: number; percentage: number; achieved: boolean } {
  if (!goal.enabled) {
    return { value, percentage: 0, achieved: false };
  }

  let percentage: number;
  let achieved: boolean;

  if (goal.operator === ">=") {
    // For "greater than or equal" goals (PnL, Win Rate, R, Profit Factor)
    percentage = goal.target > 0 ? Math.max(0, (value / goal.target) * 100) : value > 0 ? 100 : 0;
    achieved = value >= goal.target;
  } else {
    // For "less than or equal" goals (Max Trades, Drawdown, Commissions, Losing Streak)
    // 100% means using exactly the limit, over 100% means exceeding
    if (value <= 0) {
      percentage = 100; // Perfect - no usage
    } else if (value <= goal.target) {
      // Within limit - show as 100% achieved (green)
      percentage = 100;
    } else {
      // Over limit - show percentage over (red)
      percentage = Math.max(0, 100 - ((value - goal.target) / goal.target) * 100);
    }
    achieved = value <= goal.target;
  }

  return { value, percentage: Math.min(100, Math.max(0, percentage)), achieved };
}
