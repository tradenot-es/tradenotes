-- Add articles column to sector_sentiments table
ALTER TABLE sector_sentiments 
ADD COLUMN IF NOT EXISTS articles JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN sector_sentiments.articles IS 'Top 5 articles for this sector: [{title, url, sentiment_score, published_at}]';