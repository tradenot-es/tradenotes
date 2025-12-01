-- Add account type tracking to trades table
ALTER TABLE trades ADD COLUMN account_type TEXT DEFAULT 'live';
ALTER TABLE trades ADD COLUMN account_name TEXT;

-- Add constraint for valid account types
ALTER TABLE trades ADD CONSTRAINT valid_account_type 
  CHECK (account_type IN ('sim', 'evaluation', 'performance', 'live'));

-- Add account type to ninjatrader executions
ALTER TABLE ninjatrader_executions ADD COLUMN account_type TEXT DEFAULT 'live';