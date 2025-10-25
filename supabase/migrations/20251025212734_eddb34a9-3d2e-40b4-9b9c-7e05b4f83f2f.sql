-- Create storage bucket for trade screenshots (skip if exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', false)
ON CONFLICT (id) DO NOTHING;

-- Add rating column to trades table
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

COMMENT ON COLUMN public.trades.rating IS 'Trade quality rating from 1 (poor) to 5 (excellent)';