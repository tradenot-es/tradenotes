-- Add missing RLS policies for news_translations table
-- The translate-news edge function (using service role) needs to INSERT/UPDATE translations

-- Service role can insert new translations (executed by edge function)
CREATE POLICY "Service role can insert translations"
ON public.news_translations
FOR INSERT
WITH CHECK (true);

-- Service role can update existing translations (if needed for refresh)
CREATE POLICY "Service role can update translations"
ON public.news_translations
FOR UPDATE
USING (true);

-- Service role can delete expired translations (cleanup)
CREATE POLICY "Service role can delete translations"
ON public.news_translations
FOR DELETE
USING (true);