-- Add trading_goals JSONB column to user_settings
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS 
  trading_goals JSONB DEFAULT '{
    "daily_pnl": {"enabled": true, "target": 500, "operator": ">="},
    "max_trades": {"enabled": true, "target": 10, "operator": "<="},
    "min_win_rate": {"enabled": false, "target": 50, "operator": ">="},
    "max_drawdown": {"enabled": false, "target": 200, "operator": "<="},
    "max_commissions": {"enabled": false, "target": 50, "operator": "<="},
    "min_avg_r": {"enabled": false, "target": 1.0, "operator": ">="},
    "max_losing_streak": {"enabled": false, "target": 3, "operator": "<="},
    "min_profit_factor": {"enabled": false, "target": 1.5, "operator": ">="}
  }'::jsonb;