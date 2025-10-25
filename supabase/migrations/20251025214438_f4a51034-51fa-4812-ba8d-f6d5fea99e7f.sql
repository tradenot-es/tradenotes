-- Create daily_prep table for pre-trading preparation
CREATE TABLE IF NOT EXISTS public.daily_prep (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  market_outlook TEXT,
  key_levels TEXT,
  trading_plan TEXT,
  mindset TEXT,
  checklist JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_prep ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own daily prep"
ON public.daily_prep
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily prep"
ON public.daily_prep
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily prep"
ON public.daily_prep
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily prep"
ON public.daily_prep
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_daily_prep_updated_at
BEFORE UPDATE ON public.daily_prep
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.daily_prep IS 'Daily trading preparation and review entries';
COMMENT ON COLUMN public.daily_prep.market_outlook IS 'Market analysis and outlook for the day';
COMMENT ON COLUMN public.daily_prep.key_levels IS 'Key support/resistance levels to watch';
COMMENT ON COLUMN public.daily_prep.trading_plan IS 'Trading plan and strategy for the day';
COMMENT ON COLUMN public.daily_prep.mindset IS 'Mental state and mindset notes';
COMMENT ON COLUMN public.daily_prep.checklist IS 'Pre-trading checklist completion status';