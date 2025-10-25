-- Add slippage column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN default_slippage numeric DEFAULT 0.5 CHECK (default_slippage >= 0 AND default_slippage <= 100);