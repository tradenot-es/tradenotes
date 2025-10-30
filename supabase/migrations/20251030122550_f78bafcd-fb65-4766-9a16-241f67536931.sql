-- Add Daily Trade Goal columns to user_settings
ALTER TABLE user_settings
ADD COLUMN IF NOT EXISTS daily_goal_amount DECIMAL(15, 2) DEFAULT 500.00,
ADD COLUMN IF NOT EXISTS daily_goal_max_trades INTEGER DEFAULT 10;