-- Add DELETE policy for profiles table to allow users to delete their own profile
-- This is needed for GDPR compliance and full account deletion

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);