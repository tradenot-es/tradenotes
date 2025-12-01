-- Add RLS policies for trade-screenshots storage bucket
-- Users can only upload to their own folder
CREATE POLICY "Users can upload own screenshots"
ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only view their own screenshots
CREATE POLICY "Users can view own screenshots"
ON storage.objects FOR SELECT 
TO authenticated
USING (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only update their own screenshots
CREATE POLICY "Users can update own screenshots"
ON storage.objects FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete their own screenshots
CREATE POLICY "Users can delete own screenshots"
ON storage.objects FOR DELETE 
TO authenticated
USING (
  bucket_id = 'trade-screenshots' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);