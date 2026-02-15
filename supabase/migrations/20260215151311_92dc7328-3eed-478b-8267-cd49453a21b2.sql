
-- Fix sector_sentiments: require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can read sector sentiments" ON public.sector_sentiments;
CREATE POLICY "Authenticated users can read sector sentiments"
ON public.sector_sentiments
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix news_translations: require authentication for SELECT
DROP POLICY IF EXISTS "Anyone can read cached translations" ON public.news_translations;
CREATE POLICY "Authenticated users can read cached translations"
ON public.news_translations
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix news_cache: replace overly permissive policy with proper auth check
DROP POLICY IF EXISTS "Authenticated users can read news cache" ON public.news_cache;
CREATE POLICY "Authenticated users can read news cache"
ON public.news_cache
FOR SELECT
USING (auth.role() = 'authenticated');
