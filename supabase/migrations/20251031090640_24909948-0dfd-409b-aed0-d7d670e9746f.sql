-- Create a table to cache financial news articles
CREATE TABLE IF NOT EXISTS public.news_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT NOT NULL UNIQUE,
  articles JSONB NOT NULL,
  symbols TEXT[] NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_news_cache_key ON public.news_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_news_cache_expires ON public.news_cache(expires_at);

-- Enable RLS (everyone can read cached news, only service role can write)
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cached news
CREATE POLICY "Anyone can read cached news"
  ON public.news_cache
  FOR SELECT
  USING (true);

-- Clean up expired cache entries periodically (can be called manually or via cron)
CREATE OR REPLACE FUNCTION public.clean_expired_news_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.news_cache
  WHERE expires_at < NOW();
END;
$$;