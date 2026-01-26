-- Create table to track email changes and password resets
CREATE TABLE public.email_change_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('email_change', 'password_reset')),
  old_email TEXT,
  new_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_change_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tracking records
CREATE POLICY "Users can view their own email change tracking"
ON public.email_change_tracking
FOR SELECT
USING (auth.uid() = user_id);

-- No direct client insert/update/delete - only via edge function with service role
CREATE POLICY "No direct client insert"
ON public.email_change_tracking
FOR INSERT
WITH CHECK (false);

CREATE POLICY "No direct client update"
ON public.email_change_tracking
FOR UPDATE
USING (false);

CREATE POLICY "No direct client delete"
ON public.email_change_tracking
FOR DELETE
USING (false);

-- Index for faster lookups
CREATE INDEX idx_email_change_tracking_user_id ON public.email_change_tracking(user_id);
CREATE INDEX idx_email_change_tracking_created_at ON public.email_change_tracking(created_at DESC);