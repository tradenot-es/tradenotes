-- Create news_translations table for caching translated articles
CREATE TABLE IF NOT EXISTS public.news_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_uuid TEXT NOT NULL,
  language TEXT NOT NULL,
  translated_title TEXT NOT NULL,
  translated_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  UNIQUE(article_uuid, language)
);

-- Index for fast lookups by article UUID and language
CREATE INDEX IF NOT EXISTS idx_news_translations_lookup 
ON public.news_translations(article_uuid, language);

-- Index for cleanup of expired translations
CREATE INDEX IF NOT EXISTS idx_news_translations_expires 
ON public.news_translations(expires_at);

-- Enable RLS
ALTER TABLE public.news_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached translations
CREATE POLICY "Anyone can read cached translations"
ON public.news_translations
FOR SELECT
USING (true);

-- Comment
COMMENT ON TABLE public.news_translations IS 'Stores translated news articles to avoid re-translating on every page load. Cache expires after 7 days.';