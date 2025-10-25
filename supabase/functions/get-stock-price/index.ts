import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, market } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
