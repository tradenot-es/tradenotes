-- Add Risk Management fields to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS initial_risk numeric,
ADD COLUMN IF NOT EXISTS stop_loss_price numeric;

-- Add comment for documentation
COMMENT ON COLUMN public.trades.initial_risk IS 'Planned risk in base currency for this trade';
COMMENT ON COLUMN public.trades.stop_loss_price IS 'Stop loss price level for risk calculation';