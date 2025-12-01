import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_DURATION_HOURS = 6;
const CACHE_DURATION_HOURS_FAILED = 24;

interface MarketauxArticle {
  uuid: string;
  title: string;
  snippet: string;
  url: string;
  image_url?: string;
  published_at: string;
  source: string;
  entities: Array<{
    symbol: string;
    name: string;
    type: string;
    industry: string;
    match_score: number;
    sentiment_score: number;
    highlights: Array<{
      highlight: string;
      sentiment: number;
      highlighted_in: string;
    }>;
  }>;
}

interface NewsResponse {
  success: boolean;
  articles?: MarketauxArticle[];
  meta?: {
    cached: boolean;
    error?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const marketauxApiKey = Deno.env.get("MARKETAUX_API_KEY");
    
    // === RATE LIMITING ===
    // Get client IP address from request headers
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check rate limit (10 requests per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    
    // Clean up old entries first
    await supabase
      .from("rate_limits")
      .delete()
      .lt("window_start", oneMinuteAgo);
    
    // Check current rate limit for this IP
    const { data: rateLimitData } = await supabase
      .from("rate_limits")
      .select("*")
      .eq("ip_address", clientIp)
      .gte("window_start", oneMinuteAgo)
      .maybeSingle();
    
    if (rateLimitData && rateLimitData.request_count >= 10) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Rate limit exceeded. Maximum 10 requests per minute.",
          retryAfter: 60 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60"
          } 
        }
      );
    }
    
    // Update or insert rate limit entry
    if (rateLimitData) {
      await supabase
        .from("rate_limits")
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq("id", rateLimitData.id);
    } else {
      await supabase
        .from("rate_limits")
        .insert({ 
          ip_address: clientIp, 
          request_count: 1,
          window_start: new Date().toISOString()
        });
    }
    
    console.log(`Request from IP ${clientIp} - count: ${(rateLimitData?.request_count || 0) + 1}/10`);
    // === END RATE LIMITING ===

    if (!marketauxApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "MARKETAUX_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { action, date, symbols, market, timeWindow, limit = 10, keywords = "Trump,Fed,Powell" } = body;

    // GET SENTIMENT for a symbol in a timeframe (for Trade Validation)
    if (action === "get-sentiment") {
      const symbol = symbols?.[0];
      if (!symbol || !timeWindow) {
        return new Response(
          JSON.stringify({ success: false, error: "Symbol and timeWindow required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cacheKey = `sentiment-${symbol}-${timeWindow.start}-${timeWindow.end}`;
      
      // Check cache
      const { data: cachedData } = await supabase
        .from("news_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cachedData?.sentiment_data) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            sentiment: cachedData.sentiment_data,
            meta: { cached: true }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch from API
      const url = new URL("https://api.marketaux.com/v1/news/all");
      url.searchParams.append("api_token", marketauxApiKey);
      url.searchParams.append("symbols", symbol);
      url.searchParams.append("published_after", timeWindow.start);
      url.searchParams.append("published_before", timeWindow.end);
      url.searchParams.append("filter_entities", "true");
      url.searchParams.append("limit", "50");

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok || !data.data) {
        console.error("Marketaux API error:", data);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to fetch sentiment data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calculate average sentiment
      let totalSentiment = 0;
      let articleCount = 0;

      data.data.forEach((article: any) => {
        article.entities?.forEach((entity: any) => {
          if (entity.symbol === symbol && entity.sentiment_score != null) {
            totalSentiment += entity.sentiment_score;
            articleCount++;
          }
        });
      });

      const avgSentiment = articleCount > 0 ? totalSentiment / articleCount : 0;
      const sentimentData = {
        symbol,
        avg_sentiment: avgSentiment,
        article_count: articleCount,
        timeWindow
      };

      // Cache the result
      await supabase.from("news_cache").insert({
        cache_key: cacheKey,
        symbols: [symbol],
        articles: [],
        sentiment_data: sentimentData,
        expires_at: new Date(Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString()
      });

      return new Response(
        JSON.stringify({ success: true, sentiment: sentimentData, meta: { cached: false } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET NEWS VOLUME (Hype-Level: articles per hour)
    if (action === "get-news-volume") {
      const symbol = symbols?.[0];
      if (!symbol || !timeWindow) {
        return new Response(
          JSON.stringify({ success: false, error: "Symbol and timeWindow required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cacheKey = `volume-${symbol}-${timeWindow.start}`;
      
      const { data: cachedData } = await supabase
        .from("news_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cachedData?.articles) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            hourlyVolume: cachedData.articles,
            meta: { cached: true }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch from API (last 12 hours)
      const url = new URL("https://api.marketaux.com/v1/news/all");
      url.searchParams.append("api_token", marketauxApiKey);
      url.searchParams.append("symbols", symbol);
      url.searchParams.append("published_after", timeWindow.start);
      url.searchParams.append("limit", "100");

      const response = await fetch(url.toString());
      const data = await response.json();

      if (!response.ok || !data.data) {
        return new Response(
          JSON.stringify({ success: false, error: "Failed to fetch volume data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Count articles per hour
      const hourlyCount: Record<string, number> = {};
      data.data.forEach((article: any) => {
        const hour = new Date(article.published_at).toISOString().substring(0, 13);
        hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
      });

      const hourlyVolume = Object.entries(hourlyCount).map(([hour, count]) => ({
        hour,
        count
      }));

      await supabase.from("news_cache").insert({
        cache_key: cacheKey,
        symbols: [symbol],
        articles: hourlyVolume,
        expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString() // 1h cache
      });

      return new Response(
        JSON.stringify({ success: true, hourlyVolume, meta: { cached: false } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET SECTOR OVERVIEW (Dashboard Widget)
    if (action === "get-sector-overview") {
      const today = new Date().toISOString().split("T")[0];
      
      console.log("Fetching sector overview for", today);
      
      // Check DB cache first
      const { data: cachedSectors } = await supabase
        .from("sector_sentiments")
        .select("*")
        .eq("date", today)
        .gt("expires_at", new Date().toISOString())
        .gt("article_count", 0); // Only get sectors with actual articles

      if (cachedSectors && cachedSectors.length > 0) {
        console.log("Returning cached sector data:", cachedSectors.length, "sectors");
        return new Response(
          JSON.stringify({ 
            success: true, 
            sectors: cachedSectors,
            meta: { cached: true }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Fetching fresh sector data from Marketaux API");

      // Fetch fresh data for main sectors
      const sectors = [
        "Technology",
        "Energy", 
        "Healthcare",
        "Financials",
        "Consumer Cyclical",
        "Consumer Defensive",
        "Industrials",
        "Basic Materials",
        "Real Estate",
        "Utilities",
        "Communication Services"
      ];
      const sectorData = [];

      for (const sector of sectors) {
        const url = new URL("https://api.marketaux.com/v1/news/all");
        url.searchParams.append("api_token", marketauxApiKey);
        url.searchParams.append("industries", sector);
        url.searchParams.append("published_on", today); // Changed from published_after to published_on
        url.searchParams.append("filter_entities", "true");
        url.searchParams.append("limit", "50");

        console.log(`Fetching ${sector} sector:`, url.toString());

        const response = await fetch(url.toString());
        const data = await response.json();

        if (response.ok && data.data && data.data.length > 0) {
          let totalSentiment = 0;
          let sentimentCount = 0;
          const articleCount = data.data.length;

          data.data.forEach((article: any) => {
            article.entities?.forEach((entity: any) => {
              if (entity.sentiment_score != null) {
                totalSentiment += entity.sentiment_score;
                sentimentCount++;
              }
            });
          });

          const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;
          
          console.log(`${sector}: ${articleCount} articles, ${sentimentCount} sentiments, avg: ${avgSentiment}`);
          
          // Extract top 5 articles with highest sentiment scores (both positive and negative extremes)
          const articlesWithSentiment = data.data
            .map((article: any) => {
              const entitySentiments = article.entities
                ?.map((e: any) => e.sentiment_score)
                .filter((s: number) => s != null) || [];
              const avgArticleSentiment = entitySentiments.length > 0
                ? entitySentiments.reduce((a: number, b: number) => a + b, 0) / entitySentiments.length
                : 0;
              
              return {
                title: article.title,
                url: article.url,
                sentiment_score: avgArticleSentiment,
                published_at: article.published_at
              };
            })
            .sort((a: any, b: any) => Math.abs(b.sentiment_score) - Math.abs(a.sentiment_score))
            .slice(0, 5);
          
          console.log(`${sector} extracted articles:`, JSON.stringify(articlesWithSentiment, null, 2));
          
          const sectorInfo = {
            date: today,
            sector,
            avg_sentiment: avgSentiment,
            article_count: articleCount,
            articles: articlesWithSentiment,
            expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4h
          };

          sectorData.push(sectorInfo);

          // Store in DB
          await supabase.from("sector_sentiments").insert(sectorInfo);
        } else {
          console.error(`No data for ${sector}:`, response.status, data);
        }
      }

      console.log(`Returning ${sectorData.length} sectors with data`);

      return new Response(
        JSON.stringify({ success: true, sectors: sectorData, meta: { cached: false } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET POLITICAL EVENTS (for calendar) - FUTURE & PAST AWARE
    if (action === "get-political-events") {
      const { startDate, endDate, date } = body;
      const eventLimit = body.limit || 50;
      
      // Use date as fallback for single-day requests
      const effectiveStartDate = startDate || date;
      const effectiveEndDate = endDate || date;
      
      const today = new Date().toISOString().split('T')[0];
      const isFutureRequest = effectiveStartDate > today;
      
      const cacheKey = `political-${effectiveStartDate}-${effectiveEndDate || 'single'}-${keywords}`;
      
      // Check cache
      const { data: cachedData } = await supabase
        .from("news_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cachedData?.articles) {
        console.log(`✓ Political events cache hit: ${cachedData.articles.length} articles`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            articles: cachedData.articles,
            eventType: isFutureRequest ? 'announced' : 'past',
            meta: { cached: true }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const url = new URL("https://api.marketaux.com/v1/news/all");
      url.searchParams.append("api_token", marketauxApiKey);
      url.searchParams.append("search", keywords);
      url.searchParams.append("filter_entities", "true");
      url.searchParams.append("limit", eventLimit.toString());
      
      // CRITICAL: Different date logic for future vs past
      if (isFutureRequest) {
        // For future dates: fetch recent announcements (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        url.searchParams.append("published_after", sevenDaysAgo);
        url.searchParams.append("published_before", today);
        console.log(`Fetching ANNOUNCED events (future request): ${sevenDaysAgo} to ${today}`);
      } else {
        // For past dates: fetch from the specific timeframe
        if (effectiveStartDate && effectiveEndDate && effectiveStartDate !== effectiveEndDate) {
          url.searchParams.append("published_after", effectiveStartDate);
          url.searchParams.append("published_before", effectiveEndDate);
        } else if (effectiveStartDate) {
          url.searchParams.append("published_on", effectiveStartDate);
        }
        console.log(`Fetching PAST events: ${effectiveStartDate} to ${effectiveEndDate || effectiveStartDate}`);
      }

      console.log("Political events URL:", url.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        console.error("Political events API error - Status:", response.status);
        const errorData = await response.json().catch(() => ({}));
        console.error("Political events API error - Data:", errorData);
        return new Response(
          JSON.stringify({ success: false, error: `API request failed with status ${response.status}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();

      if (!data.data || !Array.isArray(data.data)) {
        console.error("Political events API error: No data array", data);
        return new Response(
          JSON.stringify({ success: false, error: "No articles found" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Political events: Received ${data.data.length} articles (${isFutureRequest ? 'announced' : 'past'})`);

      const articles = data.data.map((article: any) => ({
        uuid: article.uuid,
        title: article.title,
        snippet: article.snippet || article.description?.substring(0, 200) || "",
        url: article.url,
        published_at: article.published_at,
        source: article.source,
        date: article.published_at ? article.published_at.split('T')[0] : new Date().toISOString().split('T')[0]
      }));

      // CACHE LOGIC: Only cache if we have articles
      if (articles.length > 0) {
        const cacheDurationMs = isFutureRequest 
          ? 24 * 60 * 60 * 1000   // 24h for announced events (check daily)
          : 168 * 60 * 60 * 1000; // 7 days for past events (stable data)
        
        await supabase.from("news_cache").insert({
          cache_key: cacheKey,
          symbols: [],
          articles: articles,
          expires_at: new Date(Date.now() + cacheDurationMs).toISOString()
        });
        
        console.log(`✓ Cached ${articles.length} political events for ${isFutureRequest ? '24h' : '7 days'}`);
      } else {
        console.log('⚠ No articles to cache (empty result, won\'t cache)');
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          articles, 
          eventType: isFutureRequest ? 'announced' : 'past',
          meta: { cached: false }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET ARTICLES (Standard + Auto-Tagging) - PER-SYMBOL FETCHING
    if (!symbols || symbols.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Symbols required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine date range for cache key
    let dateRange = "latest";
    let publishedAfter = "";
    if (date) {
      dateRange = date;
    } else {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      dateRange = `range-${threeDaysAgo.toISOString().split('T')[0]}`;
      publishedAfter = threeDaysAgo.toISOString().split('T')[0];
    }

    console.log(`Fetching articles for ${symbols.length} symbols with date range: ${dateRange}`);

    // STEP 1: Check cache for each symbol
    const allArticles: MarketauxArticle[] = [];
    const symbolsToFetch: string[] = [];
    let anyCached = false;

    for (const symbol of symbols) {
      const symbolCacheKey = `articles-single-${symbol}-${dateRange}`;
      
      const { data: cachedData } = await supabase
        .from("news_cache")
        .select("*")
        .eq("cache_key", symbolCacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cachedData?.articles && Array.isArray(cachedData.articles)) {
        console.log(`✓ Cache hit for ${symbol}: ${cachedData.articles.length} articles`);
        allArticles.push(...cachedData.articles);
        anyCached = true;
      } else {
        console.log(`✗ Cache miss for ${symbol}, will fetch`);
        symbolsToFetch.push(symbol);
      }
    }

    // STEP 2: Fetch uncached symbols in parallel
    if (symbolsToFetch.length > 0) {
      console.log(`Fetching ${symbolsToFetch.length} symbols from API in parallel...`);

      const fetchSymbol = async (symbol: string) => {
        const url = new URL("https://api.marketaux.com/v1/news/all");
        url.searchParams.append("api_token", marketauxApiKey);
        url.searchParams.append("symbols", symbol);
        url.searchParams.append("filter_entities", "true");
        url.searchParams.append("limit", "5"); // 5 articles per symbol
        
        if (date) {
          url.searchParams.append("published_on", date);
        } else if (publishedAfter) {
          url.searchParams.append("published_after", publishedAfter);
        }

        console.log(`Fetching ${symbol}:`, url.toString());

        try {
          const response = await fetch(url.toString());
          const data = await response.json();

          if (!response.ok) {
            console.error(`API error for ${symbol}:`, data);
            return { symbol, articles: [] };
          }

          if (!data.data || data.data.length === 0) {
            console.log(`No articles found for ${symbol}`);
            return { symbol, articles: [] };
          }

          // Transform articles
          const articles: MarketauxArticle[] = data.data.map((article: any) => ({
            uuid: article.uuid,
            title: article.title,
            snippet: article.snippet || article.description?.substring(0, 200) || "",
            url: article.url,
            image_url: article.image_url,
            published_at: article.published_at,
            source: article.source,
            entities: article.entities?.map((entity: any) => ({
              symbol: entity.symbol,
              name: entity.name,
              type: entity.type,
              industry: entity.industry || "",
              match_score: entity.match_score || 0,
              sentiment_score: entity.sentiment_score || 0,
              highlights: entity.highlights?.map((h: any) => ({
                highlight: h.highlight || "",
                sentiment: h.sentiment || 0,
                highlighted_in: h.highlighted_in || "main_text"
              })) || []
            })) || []
          }));

          console.log(`✓ Fetched ${articles.length} articles for ${symbol}`);
          return { symbol, articles };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return { symbol, articles: [] };
        }
      };

      // Fetch all symbols in parallel
      const results = await Promise.all(symbolsToFetch.map(fetchSymbol));

      // STEP 3: Cache each symbol's results and add to allArticles
      for (const result of results) {
        const symbolCacheKey = `articles-single-${result.symbol}-${dateRange}`;
        
        // Cache for 6 hours
        try {
          await supabase.from("news_cache").insert({
            cache_key: symbolCacheKey,
            symbols: [result.symbol],
            articles: result.articles,
            sentiment_data: {},
            expires_at: new Date(Date.now() + CACHE_DURATION_HOURS * 60 * 60 * 1000).toISOString()
          });
        } catch (err) {
          // Ignore duplicate key errors (race condition from parallel requests)
          console.error(`Error caching ${result.symbol}:`, err);
        }

        allArticles.push(...result.articles);
      }
    }

    // STEP 4: Remove duplicates (by uuid) and return
    const uniqueArticles = Array.from(
      new Map(allArticles.map(article => [article.uuid, article])).values()
    );

    console.log(`Total articles: ${uniqueArticles.length} (from ${symbols.length} symbols, ${symbolsToFetch.length} fetched, ${symbols.length - symbolsToFetch.length} cached)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        articles: uniqueArticles,
        meta: { 
          cached: symbolsToFetch.length === 0, // All from cache
          partial_cache: anyCached && symbolsToFetch.length > 0 // Some from cache
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in marketaux-news function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
