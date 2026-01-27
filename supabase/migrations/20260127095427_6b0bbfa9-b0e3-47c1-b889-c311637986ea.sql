-- Add notification settings to user_settings for Goal Alerts feature
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS notification_sound boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS drawdown_warning_threshold integer DEFAULT 50;

-- Add daily_summaries table for AI Daily Summary feature
CREATE TABLE IF NOT EXISTS public.daily_summaries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  summary_text text NOT NULL,
  highlights jsonb DEFAULT '{}'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  trades_count integer NOT NULL DEFAULT 0,
  net_pnl numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT daily_summaries_user_date_unique UNIQUE (user_id, date)
);

-- Enable RLS on daily_summaries
ALTER TABLE public.daily_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for daily_summaries
CREATE POLICY "Users can view their own daily summaries"
ON public.daily_summaries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily summaries"
ON public.daily_summaries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily summaries"
ON public.daily_summaries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily summaries"
ON public.daily_summaries
FOR DELETE
USING (auth.uid() = user_id);