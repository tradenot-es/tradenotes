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

interface NewsSource {
  id: string;
  name: string;
  domain: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, symbols, sources, action } = await req.json();
    
    const apiKey = Deno.env.get('FINLIGHT_API_KEY');
    if (!apiKey) {
      throw new Error('FINLIGHT_API_KEY not configured');
    }

    // Handle "get-sources" action
    if (action === 'get-sources') {
      console.log('Fetching available news sources');
      
      const response = await fetch('https://api.finlight.me/v2/sources', {
        method: 'GET',
        headers: {
          'X-API-KEY': apiKey,
          'accept': '*/*',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Finlight API error:', response.status, errorText);
        throw new Error(`Failed to fetch sources: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sources fetched successfully, count:', data.sources?.length || 0);

      return new Response(
        JSON.stringify({
          success: true,
          sources: data.sources || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Handle "get-articles" action (default)
    if (!date) {
      throw new Error('Date parameter is required');
    }

    console.log('Fetching news for date:', date, 'symbols:', symbols, 'sources:', sources);

    // Build query for Finlight API
    let query = '';
    if (symbols && symbols.length > 0) {
      query = symbols.map((s: string) => `ticker:${s}`).join(' OR ');
    }

    const requestBody: any = {
      from: date,
      to: date,
      pageSize: 20,
      includeContent: true,
      includeEntities: true,
      ...(query && { query }),
      ...(sources && sources.length > 0 && { sources })
    };

    console.log('Finlight API request:', JSON.stringify(requestBody));

    const response = await fetch('https://api.finlight.me/v2/articles', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Finlight API error:', response.status, errorText);
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const data = await response.json();
    console.log('News fetched successfully, count:', data.articles?.length || 0);

    // Transform Finlight articles to match expected format
    const transformedArticles = (data.articles || []).map((article: any) => ({
      uuid: article.id || article.uuid,
      title: article.title,
      description: article.snippet || article.description,
      url: article.url,
      published_at: article.publishedAt || article.published_at,
      source: article.source?.name || article.source || 'Unknown',
      sentiment: article.sentiment,
      entities: article.companies?.map((company: any) => ({
        symbol: company.ticker,
        name: company.name
      })) || []
    }));

    return new Response(
      JSON.stringify({
        success: true,
        articles: transformedArticles,
        meta: data.meta || {}
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
