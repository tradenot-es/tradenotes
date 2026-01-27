-- Remove client-side SELECT access to email_change_tracking table
-- This table contains old_email and new_email which are sensitive PII
-- All access should be via server-side edge functions only

-- Drop the existing SELECT policy that allows users to read their own records
DROP POLICY IF EXISTS "Users can view their own email change tracking" ON public.email_change_tracking;

-- Create a new policy that denies all client SELECT access
-- Server-side edge functions using service role will still work (bypass RLS)
CREATE POLICY "No direct client access to email tracking"
ON public.email_change_tracking
FOR SELECT
USING (false);