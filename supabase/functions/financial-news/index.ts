import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache duration: 6 hours
const CACHE_DURATION_HOURS = 6;

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

interface AlphaVantageArticle {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image?: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  topics: Array<{
    topic: string;
    relevance_score: string;
  }>;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: Array<{
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    const { date, symbols, market, action, sources } = await req.json();
    
    const alphaVantageApiKey = Deno.env.get('ALPHAVANTAGE_API_KEY');
    if (!alphaVantageApiKey) {
      throw new Error('ALPHAVANTAGE_API_KEY not configured');
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

    // Initialize Supabase client with service role for cache access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create cache key based on date, symbols, and sources
    const sortedSymbols = symbols ? [...symbols].sort() : [];
    const sourcesKey = sources ? sources.sort().join(',') : 'general';
    const cacheKey = `${date}-${sortedSymbols.join(',')}-${sourcesKey}`;

    // Check cache first
    const { data: cachedData, error: cacheError } = await supabase
      .from('news_cache')
      .select('articles, expires_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cachedData && !cacheError) {
      console.log('Cache hit! Returning cached news for key:', cacheKey);
      return new Response(
        JSON.stringify({
          success: true,
          articles: cachedData.articles,
          meta: {
            count: cachedData.articles.length,
            date: date,
            market: market,
            symbols: symbols,
            cached: true
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    console.log('Cache miss. Fetching from AlphaVantage API...');

    // Build parameters for AlphaVantage
    let topics = '';
    let tickers = '';
    
    if (sources && sources.includes('political')) {
      // Political & economic events
      topics = 'economy_fiscal,economy_monetary,financial_markets';
      console.log('Political news topics:', topics);
    } else if (symbols && symbols.length > 0) {
      // ONLY symbol-specific financial news
      tickers = symbols.join(',');
      console.log('Symbol-specific query for:', symbols);
    } else {
      // Only if explicitly no symbols provided
      console.log('No symbols provided, skipping news fetch');
      return new Response(
        JSON.stringify({
          success: true,
          articles: [],
          meta: {
            count: 0,
            date: date,
            market: market,
            symbols: symbols,
            cached: false,
            message: 'No symbols to fetch news for'
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Convert date to AlphaVantage format (YYYYMMDDTHHMM)
    const timeFrom = `${date.replace(/-/g, '')}T0000`;
    const timeTo = `${date.replace(/-/g, '')}T2359`;

    // Build URL with query parameters
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.append('function', 'NEWS_SENTIMENT');
    url.searchParams.append('apikey', alphaVantageApiKey);
    url.searchParams.append('time_from', timeFrom);
    url.searchParams.append('time_to', timeTo);
    url.searchParams.append('limit', '50');
    url.searchParams.append('sort', 'RELEVANCE');
    
    if (tickers) {
      url.searchParams.append('tickers', tickers);
    }
    if (topics) {
      url.searchParams.append('topics', topics);
    }

    console.log('Calling AlphaVantage API with URL:', url.toString());
    let alphaVantageResponse = await fetch(url.toString());
    
    let alphaVantageData = await alphaVantageResponse.json();

    if (!alphaVantageResponse.ok) {
      console.error('AlphaVantage API error:', alphaVantageResponse.status);
      
      if (alphaVantageResponse.status === 429) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'API rate limit exceeded. Please try again in a few minutes.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 429,
          }
        );
      }
      
      throw new Error(`Failed to fetch news: ${alphaVantageResponse.status}`);
    }

    console.log('AlphaVantage response received');
    console.log('AlphaVantage response meta:', JSON.stringify({
      itemsCount: alphaVantageData.items || 0,
      feedLength: alphaVantageData.feed?.length || 0,
      requestDate: date,
      tickers: tickers,
      topics: topics
    }));

    // Check for API error messages
    if (alphaVantageData.Note) {
      console.warn('AlphaVantage API Note:', alphaVantageData.Note);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'API rate limit reached. Free tier allows 25 requests per day.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    if (alphaVantageData.Information) {
      console.warn('AlphaVantage API Information:', alphaVantageData.Information);
    }

    // Transform AlphaVantage articles to our format
    const articles: NewsArticle[] = (alphaVantageData.feed || []).map((article: any) => ({
      uuid: `alphavantage-${article.url}`,
      title: article.title,
      description: article.summary || '',
      url: article.url,
      published_at: article.time_published,
      source: article.source,
      sentiment: article.overall_sentiment_label,
      entities: (article.ticker_sentiment || [])
        .filter((ts: any) => parseFloat(ts.relevance_score) > 0.3) // Only include relevant tickers
        .map((ts: any) => ({
          symbol: ts.ticker,
          name: ts.ticker
        }))
    }));

    console.log('News fetched successfully, count:', articles.length);

    // If no articles found, provide more context
    if (articles.length === 0) {
      console.warn('No articles found for date:', date, 'tickers:', tickers, 'topics:', topics);
      console.warn('This could mean: 1) No news published for this date, 2) Symbols not recognized, 3) Rate limit reached');
    }

    // Store in cache
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    const { error: insertError } = await supabase
      .from('news_cache')
      .upsert({
        cache_key: cacheKey,
        articles: articles,
        symbols: sortedSymbols,
        expires_at: expiresAt.toISOString()
      }, {
        onConflict: 'cache_key'
      });

    if (insertError) {
      console.error('Failed to cache news:', insertError);
      // Continue anyway - caching failure shouldn't break the response
    } else {
      console.log('News cached successfully until:', expiresAt.toISOString());
    }

    return new Response(
      JSON.stringify({
        success: true,
        articles: articles,
        meta: {
          count: articles.length,
          date: date,
          market: market,
          symbols: symbols,
          cached: false
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