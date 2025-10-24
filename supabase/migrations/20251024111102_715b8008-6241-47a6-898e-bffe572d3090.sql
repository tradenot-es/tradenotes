-- Add market column to trades table
ALTER TABLE public.trades 
ADD COLUMN market TEXT DEFAULT 'Stock' CHECK (market IN ('Stock', 'Futures', 'Crypto', 'Option', 'Forex', 'Index'));