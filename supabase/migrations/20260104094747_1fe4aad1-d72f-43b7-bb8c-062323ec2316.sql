-- Fix 1: Restrict news_cache to authenticated users only
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can read cached news" ON public.news_cache;

-- Create new policy that restricts to authenticated users
CREATE POLICY "Authenticated users can read news cache" 
ON public.news_cache 
FOR SELECT 
TO authenticated
USING (true);

-- Fix 2: Add explicit denial policy for rate_limits table
-- This documents intent and provides defense in depth
CREATE POLICY "No direct client access to rate limits" 
ON public.rate_limits 
FOR SELECT 
USING (false);

CREATE POLICY "No direct client insert to rate limits" 
ON public.rate_limits 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "No direct client update to rate limits" 
ON public.rate_limits 
FOR UPDATE 
USING (false);

CREATE POLICY "No direct client delete to rate limits" 
ON public.rate_limits 
FOR DELETE 
USING (false);