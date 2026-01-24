-- Create waitlist table for pre-launch email collection
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'prelaunch'
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- No direct client access - only Edge Function with Service Role can access
CREATE POLICY "No direct client access to waitlist" 
ON public.waitlist 
FOR ALL 
USING (false);

-- Create index for faster email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);

-- Create index for analytics queries by date
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at);