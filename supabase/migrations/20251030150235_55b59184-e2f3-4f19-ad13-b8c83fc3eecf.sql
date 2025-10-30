-- Create table for AI assistant conversations
CREATE TABLE public.assistant_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  context_trades_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assistant_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own conversations"
  ON public.assistant_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.assistant_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.assistant_conversations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_assistant_conversations_user_id ON public.assistant_conversations(user_id);
CREATE INDEX idx_assistant_conversations_created_at ON public.assistant_conversations(created_at DESC);