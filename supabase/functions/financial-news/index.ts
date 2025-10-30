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