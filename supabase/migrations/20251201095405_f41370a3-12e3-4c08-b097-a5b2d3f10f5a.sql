-- Add webhook_api_key to user_settings for NinjaTrader authentication
ALTER TABLE user_settings 
ADD COLUMN webhook_api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex');

-- Index for fast API key lookup
CREATE UNIQUE INDEX idx_webhook_api_key ON user_settings(webhook_api_key);

-- Table for pending NinjaTrader executions (before pairing into trades)
CREATE TABLE public.ninjatrader_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account TEXT NOT NULL,
  instrument TEXT NOT NULL,
  symbol TEXT NOT NULL,
  market TEXT NOT NULL,
  action TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  execution_id TEXT NOT NULL UNIQUE,
  order_id TEXT,
  market_position TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast pairing
CREATE INDEX idx_nt_executions_user_symbol ON ninjatrader_executions(user_id, symbol, created_at);

-- Enable RLS
ALTER TABLE ninjatrader_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own executions" 
ON ninjatrader_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own executions" 
ON ninjatrader_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own executions" 
ON ninjatrader_executions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to clean up old pending executions (older than 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_ninjatrader_executions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  DELETE FROM public.ninjatrader_executions
  WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;