-- Create table for user news source preferences
CREATE TABLE IF NOT EXISTS public.news_source_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_id TEXT NOT NULL,
  source_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, source_id)
);

-- Enable RLS
ALTER TABLE public.news_source_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own news source preferences" 
ON public.news_source_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own news source preferences" 
ON public.news_source_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own news source preferences" 
ON public.news_source_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own news source preferences" 
ON public.news_source_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_source_preferences_updated_at
BEFORE UPDATE ON public.news_source_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();