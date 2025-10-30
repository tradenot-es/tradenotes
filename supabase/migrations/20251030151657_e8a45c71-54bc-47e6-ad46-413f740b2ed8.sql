-- Add subscription_tier column to user_settings table for rate limiting
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'free';

COMMENT ON COLUMN public.user_settings.subscription_tier IS 'Subscription tier for rate limiting: free, basic, premium, enterprise';