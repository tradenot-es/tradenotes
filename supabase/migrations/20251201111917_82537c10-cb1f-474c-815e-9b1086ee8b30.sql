-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies needed - this table is only accessed by edge functions using service role key
-- Regular users should not have direct access to rate limiting data