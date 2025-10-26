import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  sentiment?: string;
  entities?: Array<{ symbol: string; name: string }>;
}

// Market-specific search keywords
const MARKET_KEYWORDS: Record<string, string[]> = {
  Futures: ['futures', 'commodities', 'E-mini', 'CME', 'NYMEX', 'CBOT'],
  Stock: ['stock', 'equity', 'shares', 'NYSE', 'NASDAQ', 'S&P 500'],
  Crypto: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'digital currency'],
  Forex: ['forex', 'currency', 'FX', 'exchange rate', 'dollar', 'euro'],
  Option: ['options', 'calls', 'puts', 'derivatives', 'volatility'],
  Index: ['index', 'indices', 'market index', 'benchmark']
};

// Political/Economic events keywords
const POLITICAL_KEYWORDS = [
  'Trump', 'Biden', 'Fed', 'Powell', 'Federal Reserve', 'interest rate',
  'FOMC', 'inflation', 'CPI', 'GDP', 'unemployment', 'jobs report',
  'earnings', 'ECB', 'central bank', 'Treasury', 'Yellen'
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, symbols, market, action } = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Handle "get-sources" action
    if (action === 'get-sources') {
      return new Response(
        JSON.stringify({
          success: true,
          sources: [
            { id: 'general', name: 'General News', domain: 'all' },
            { id: 'political', name: 'Political & Economic Events', domain: 'all' }
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle "get-articles" action
    if (!date) {
      throw new Error('Date parameter is required');
    }

    console.log('Fetching news for date:', date, 'symbols:', symbols, 'market:', market);

    // Build intelligent search query
    let searchQuery = `financial news ${date}`;
    
    // Add symbol-specific keywords
    if (symbols && symbols.length > 0) {
      searchQuery += ` ${symbols.join(' OR ')}`;
    }
    
    // Add market-specific keywords
    if (market && MARKET_KEYWORDS[market]) {
      searchQuery += ` ${MARKET_KEYWORDS[market].slice(0, 2).join(' OR ')}`;
    }
    
    // Always include political/economic events
    searchQuery += ` ${POLITICAL_KEYWORDS.slice(0, 3).join(' OR ')}`;

    console.log('Search query:', searchQuery);

    // Use Lovable AI to fetch and summarize relevant news
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a financial news aggregator. Find the most relevant financial news for the given date and criteria. 
            Return news in JSON format with the following structure:
            {
              "articles": [
                {
                  "uuid": "unique-id",
                  "title": "Article title",
                  "description": "Brief description",
                  "url": "https://example.com",
                  "published_at": "2025-10-07T10:00:00Z",
                  "source": "Source name",
                  "sentiment": "positive/negative/neutral",
                  "entities": [{"symbol": "NQ", "name": "NASDAQ 100"}]
                }
              ]
            }
            
            Focus on:
            - Market-specific news (${market || 'general'})
            - Symbol-related news (${symbols?.join(', ') || 'general market'})
            - Political/economic events (Trump speeches, Fed announcements, Powell statements)
            - Major economic indicators
            
            Include at least 5-10 relevant articles. Use real financial news sources.`
          },
          {
            role: 'user',
            content: `Find financial news for date: ${date}. Query: ${searchQuery}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`Failed to fetch news: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Parse AI response
    let articles: NewsArticle[] = [];
    
    try {
      const content = aiData.choices[0].message.content;
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*"articles"[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        articles = parsedData.articles || [];
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback: create placeholder articles
      articles = [{
        uuid: 'ai-summary-1',
        title: 'Market Summary',
        description: aiData.choices[0].message.content.substring(0, 200),
        url: '#',
        published_at: new Date().toISOString(),
        source: 'AI Summary',
        sentiment: 'neutral',
        entities: symbols?.map((s: string) => ({ symbol: s, name: s })) || []
      }];
    }

    console.log('News fetched successfully, count:', articles.length);

    return new Response(
      JSON.stringify({
        success: true,
        articles: articles,
        meta: {
          count: articles.length,
          date: date,
          market: market,
          symbols: symbols
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in financial-news function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});