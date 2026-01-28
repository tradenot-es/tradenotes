export interface TradingGoal {
  enabled: boolean;
  target: number;
  operator: ">=" | "<=";
}

export interface TradingGoalsConfig {
  daily_pnl: TradingGoal;
  max_trades: TradingGoal;
  min_win_rate: TradingGoal;
  max_drawdown: TradingGoal;
  max_commissions: TradingGoal;
  min_avg_r: TradingGoal;
  max_losing_streak: TradingGoal;
  min_profit_factor: TradingGoal;
}

export const defaultTradingGoals: TradingGoalsConfig = {
  daily_pnl: { enabled: true, target: 500, operator: ">=" },
  max_trades: { enabled: true, target: 10, operator: "<=" },
  min_win_rate: { enabled: false, target: 50, operator: ">=" },
  max_drawdown: { enabled: false, target: 200, operator: "<=" },
  max_commissions: { enabled: false, target: 50, operator: "<=" },
  min_avg_r: { enabled: false, target: 1.0, operator: ">=" },
  max_losing_streak: { enabled: false, target: 3, operator: "<=" },
  min_profit_factor: { enabled: false, target: 1.5, operator: ">=" },
};

export type GoalKey = keyof TradingGoalsConfig;

export interface DayGoalResult {
  date: string;
  goals: Record<GoalKey, { value: number; percentage: number; achieved: boolean }>;
  compositeScore: number;
  tradesCount: number;
  pnl: number;
}
