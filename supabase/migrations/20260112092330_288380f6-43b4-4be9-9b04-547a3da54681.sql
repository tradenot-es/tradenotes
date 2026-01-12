-- Fix overly permissive RLS policies on news_translations table
-- Service role bypasses RLS anyway, so these policies are unnecessary and create security warnings

-- Drop the overly permissive policies that use USING (true) or WITH CHECK (true)
DROP POLICY IF EXISTS "Service role can delete translations" ON public.news_translations;
DROP POLICY IF EXISTS "Service role can insert translations" ON public.news_translations;
DROP POLICY IF EXISTS "Service role can update translations" ON public.news_translations;

-- Note: The SELECT policy "Anyone can read cached translations" with USING (true) 
-- is intentionally kept as public read access is the intended behavior for cached translations