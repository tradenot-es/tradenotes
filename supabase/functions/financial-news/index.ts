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

interface FinlightArticle {
  link: string;
  source: string;
  title: string;
  summary?: string;
  publishDate: string;
  language: string;
  sentiment: string;
  confidence: number;
  images?: string[];
  companies?: Array<{
    ticker: string;
    name: string;
    confidence: number;
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
    
    const finlightApiKey = Deno.env.get('FINLIGHT_API_KEY');
    if (!finlightApiKey) {
      throw new Error('FINLIGHT_API_KEY not configured');
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

    console.log('Cache miss. Fetching from Finlight API...');

    // Build search query based on sources
    let searchQuery = '';
    
    if (sources && sources.includes('political')) {
      // Political & economic events
      searchQuery = 'Trump OR Biden OR Fed OR Powell OR "Federal Reserve" OR "interest rate" OR FOMC OR inflation OR CPI OR GDP';
    } else {
      // General financial news
      searchQuery = 'stock market OR economy OR trading';
    }
    
    // Add symbol-specific keywords
    if (symbols && symbols.length > 0) {
      searchQuery += ` OR ${symbols.join(' OR ')}`;
    }

    console.log('Search query:', searchQuery);

    // Call Finlight API
    const finlightResponse = await fetch('https://api.finlight.me/v2/articles', {
      method: 'POST',
      headers: {
        'X-API-KEY': finlightApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: searchQuery,
        tickers: symbols && symbols.length > 0 ? symbols : undefined,
        from: date,
        to: date,
        language: 'en',
        pageSize: 20,
        includeEntities: true,
      }),
    });

    if (!finlightResponse.ok) {
      const errorText = await finlightResponse.text();
      console.error('Finlight API error:', finlightResponse.status, errorText);
      
      if (finlightResponse.status === 429) {
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
      
      if (finlightResponse.status === 402) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Payment required. Please check your Finlight API subscription.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 402,
          }
        );
      }
      
      throw new Error(`Failed to fetch news: ${finlightResponse.status}`);
    }

    const finlightData = await finlightResponse.json();
    console.log('Finlight response received, status:', finlightData.status);

    // Transform Finlight articles to our format
    const articles: NewsArticle[] = (finlightData.articles || []).map((article: FinlightArticle) => ({
      uuid: `finlight-${article.link}`,
      title: article.title,
      description: article.summary || '',
      url: article.link,
      published_at: article.publishDate,
      source: article.source,
      sentiment: article.sentiment,
      entities: (article.companies || []).map(company => ({
        symbol: company.ticker,
        name: company.name
      }))
    }));

    console.log('News fetched successfully, count:', articles.length);

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