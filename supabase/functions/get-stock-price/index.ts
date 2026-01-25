import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://tradenot.es",
  "https://www.tradenot.es",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) || 
                   origin.includes(".lovableproject.com") || 
                   origin.includes(".lovable.app");
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

const StockPriceRequestSchema = z.object({
  symbol: z.string()
    .min(1, 'Symbol cannot be empty')
    .max(20, 'Symbol too long')
    .regex(/^[A-Z0-9.^-]+$/i, 'Invalid symbol format'),
  market: z.enum(['Stock', 'Futures', 'Crypto', 'Forex', 'Option']).optional().default('Stock')
});

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await req.json();
    
    const validation = StockPriceRequestSchema.safeParse(payload);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request format',
          details: validation.error.errors.map(e => e.message)
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { symbol, market } = validation.data;

    // Format symbol based on market
    let formattedSymbol = symbol;
    if (market === "Futures") {
      // Futures symbols for Yahoo Finance (e.g., ES=F, NQ=F, GC=F)
      formattedSymbol = `${symbol}=F`;
    } else if (market === "Crypto") {
      // Crypto symbols for Yahoo Finance (e.g., BTC-USD, ETH-USD)
      if (!symbol.includes("-")) {
        formattedSymbol = `${symbol}-USD`;
      }
    }
    // For Forex, symbols like EURUSD=X
    else if (market === "Forex") {
      formattedSymbol = `${symbol}=X`;
    }

    // Yahoo Finance API (unofficial but works)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}`;
    
    const response = await fetch(yahooUrl);
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch price", price: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    // Extract current price from Yahoo Finance response
    const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;

    if (!price) {
      return new Response(
        JSON.stringify({ error: "Price not available", price: null }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        price: parseFloat(price.toFixed(2)),
        symbol: formattedSymbol,
        originalSymbol: symbol
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error fetching stock price:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", price: null }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
