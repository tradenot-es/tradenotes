-- Erweitere news_cache für Sentiment-Daten
ALTER TABLE news_cache ADD COLUMN IF NOT EXISTS 
  sentiment_data jsonb DEFAULT '{}'::jsonb;

-- Neue Tabelle für Sektor-Sentiments (Dashboard Widget)
CREATE TABLE IF NOT EXISTS sector_sentiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  sector text NOT NULL,
  avg_sentiment numeric,
  article_count integer,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE(date, sector)
);

-- Enable RLS für sector_sentiments
ALTER TABLE sector_sentiments ENABLE ROW LEVEL SECURITY;

-- Alle können Sektor-Sentiments lesen (public data)
CREATE POLICY "Anyone can read sector sentiments"
  ON sector_sentiments FOR SELECT
  USING (true);

-- Erweitere trades für News-Context (Auto-Tagging)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS 
  news_context jsonb DEFAULT '{}'::jsonb;

-- Kommentar für news_context Struktur
COMMENT ON COLUMN trades.news_context IS 'Stores news context: { sentiment_at_entry: number, contra_trade: boolean, top_story: object, auto_tags: string[], hype_level: number }';