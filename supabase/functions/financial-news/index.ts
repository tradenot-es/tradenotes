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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { date, symbols } = await req.json();
    
    if (!date) {
      throw new Error('Date parameter is required');
    }

    const apiKey = Deno.env.get('MARKETAUX_API_KEY');
    if (!apiKey) {
      throw new Error('MARKETAUX_API_KEY not configured');
    }

    console.log('Fetching news for date:', date, 'symbols:', symbols);

    // Build API URL with filters
    let apiUrl = `https://api.marketaux.com/v1/news/all?api_token=${apiKey}&published_on=${date}&language=en&limit=10`;
    
    if (symbols && symbols.length > 0) {
      apiUrl += `&symbols=${symbols.join(',')}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Marketaux API error:', response.status, errorText);
      throw new Error(`Failed to fetch news: ${response.status}`);
    }

    const data = await response.json();
    console.log('News fetched successfully, count:', data.data?.length || 0);

    return new Response(
      JSON.stringify({
        success: true,
        articles: data.data || [],
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
