-- =====================================================
-- PHASE 1: QUICK WINS - DATABASE MIGRATION
-- =====================================================

-- 1. USER ACHIEVEMENTS TABLE
-- =====================================================
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  notified BOOLEAN DEFAULT false,
  UNIQUE(user_id, achievement_type)
);

-- Enable RLS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- 2. MFE/MAE COLUMNS FOR TRADES TABLE
-- =====================================================
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS mfe_price NUMERIC,
ADD COLUMN IF NOT EXISTS mae_price NUMERIC;

-- 3. ACCOUNT SIZE AT TRADE (for position sizing analysis)
-- =====================================================
ALTER TABLE public.trades
ADD COLUMN IF NOT EXISTS account_size_at_trade NUMERIC;