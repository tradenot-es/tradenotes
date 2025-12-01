import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface TradingViewAlert {
  symbol: string;
  side: 'long' | 'short';
  qty: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  fees?: number;
  tags?: string[];
  setup?: string;
  note?: string;
}

interface NinjaTraderExecution {
  instrument: string;
  action: 'BUY' | 'SELL';
  quantity: number;
  avgFillPrice: number;
  time: string;
}

interface NinjaTraderSingleExecution {
  source: 'ninjatrader';
  account: string;
  instrument: string;
  action: string;
  quantity: number;
  price: number;
  timestamp: string;
  executionId: string;
  orderId?: string;
  marketPosition: string;
}

// Futures point values (value of 1 point movement)
const FUTURES_POINT_VALUES: Record<string, number> = {
  ES: 50, MES: 5, NQ: 20, MNQ: 2, YM: 5, MYM: 0.5,
  RTY: 50, M2K: 5,
  GC: 100, MGC: 10, SI: 5000, SIL: 1000, HG: 25000, QC: 12500,
  CL: 1000, MCL: 100, NG: 10000, QG: 2500, RB: 42000, HO: 42000,
  ZB: 1000, ZN: 1000, ZF: 1000, ZT: 2000, UB: 1000,
  ZC: 50, ZS: 50, ZW: 50, ZL: 600, ZM: 100,
  "6E": 125000, "6B": 62500, "6J": 12500000, "6A": 100000, "6C": 100000, "6S": 125000,
};

const OPTIONS_MULTIPLIER = 100;

// Parse NinjaTrader instrument format to extract symbol and market
function parseNinjaTraderInstrument(instrument: string): { symbol: string; market: string } {
  let normalized = instrument
    .replace(/\s+\d{2}-\d{2}$/, '')  // "NQ 03-25" → "NQ"
    .replace(/\s+/g, '')              // Remove spaces
    .replace(/\//g, '')               // "EUR/USD" → "EURUSD"
    .toUpperCase();
  
  // Check for futures contract format (e.g., "ESH25" → "ES")
  const futuresMatch = normalized.match(/^([A-Z]{1,3})[FGHJKMNQUVXZ]\d{2}$/);
  if (futuresMatch) {
    return { symbol: futuresMatch[1], market: 'Futures' };
  }
  
  // Check if it's a known futures symbol
  if (FUTURES_POINT_VALUES[normalized]) {
    return { symbol: normalized, market: 'Futures' };
  }
  
  // Check for forex format
  if (normalized.length === 6 && (normalized.includes('USD') || normalized.includes('EUR') || normalized.includes('GBP'))) {
    return { symbol: normalized, market: 'Forex' };
  }
  
  // Check for crypto
  if (normalized.includes('BTC') || normalized.includes('ETH') || normalized.endsWith('USD') && normalized.length <= 7) {
    return { symbol: normalized, market: 'Crypto' };
  }
  
  // Default to Stock
  return { symbol: normalized, market: 'Stock' };
}

// Calculate PnL with correct multipliers
function calculatePnL(
  symbol: string,
  market: string,
  side: 'long' | 'short',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fees: number
): number {
  let multiplier = 1;
  
  if (market === 'Futures') {
    multiplier = FUTURES_POINT_VALUES[symbol] || 1;
  } else if (market === 'Option') {
    multiplier = OPTIONS_MULTIPLIER;
  }
  
  const direction = side === 'long' ? 1 : -1;
  const priceDiff = exitPrice - entryPrice;
  
  return (priceDiff * quantity * multiplier * direction) - fees;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Check for API key authentication (for external webhooks like NinjaTrader)
    const apiKey = req.headers.get('X-API-Key');
    let userId: string;
    
    if (apiKey) {
      // External webhook authentication via API key
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const { data: settings, error: settingsError } = await supabaseAdmin
        .from('user_settings')
        .select('user_id')
        .eq('webhook_api_key', apiKey)
        .single();
      
      if (settingsError || !settings) {
        console.error('Invalid API key:', apiKey);
        return new Response(
          JSON.stringify({ error: 'Invalid API key' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      userId = settings.user_id;
    } else {
      // Standard JWT authentication
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        throw new Error('No authorization provided');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Unauthorized');
      }
      userId = user.id;
    }
    
    // Create admin client for database operations
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const payload = await req.json();
    console.log('Received payload:', payload);

    let tradesToInsert: any[] = [];

    // TradingView Alert Format
    if (payload.symbol && payload.entryPrice && payload.exitPrice) {
      const trade = payload as TradingViewAlert;
      tradesToInsert.push({
        user_id: userId,
        symbol: trade.symbol,
        side: trade.side,
        qty: trade.qty,
        entry_price: trade.entryPrice,
        exit_price: trade.exitPrice,
        entry_time: trade.entryTime,
        exit_time: trade.exitTime,
        fees: trade.fees || 0,
        pnl_net: (trade.exitPrice - trade.entryPrice) * trade.qty * (trade.side === 'long' ? 1 : -1) - (trade.fees || 0),
        tags: trade.tags || [],
        setup: trade.setup,
        note: trade.note,
      });
    }
    // NinjaTrader Format (pair of executions)
    else if (Array.isArray(payload) && payload.length === 2) {
      const [entry, exit] = payload as NinjaTraderExecution[];
      
      tradesToInsert.push({
        user_id: userId,
        symbol: entry.instrument,
        side: entry.action === 'BUY' ? 'long' : 'short',
        qty: entry.quantity,
        entry_price: entry.avgFillPrice,
        exit_price: exit.avgFillPrice,
        entry_time: entry.time,
        exit_time: exit.time,
        fees: 0,
        pnl_net: (exit.avgFillPrice - entry.avgFillPrice) * entry.quantity * (entry.action === 'BUY' ? 1 : -1),
        tags: [],
      });
    }
    // Batch import (array of trades)
    else if (Array.isArray(payload)) {
      tradesToInsert = payload.map((trade: any) => ({
        user_id: userId,
        symbol: trade.symbol,
        side: trade.side,
        market: trade.market,
        qty: trade.qty,
        entry_price: trade.entryPrice || trade.entry_price,
        exit_price: trade.exitPrice || trade.exit_price,
        entry_time: trade.entryTime || trade.entry_time,
        exit_time: trade.exitTime || trade.exit_time,
        fees: trade.fees || 0,
        pnl_net: trade.pnlNet || trade.pnl_net,
        r: trade.r,
        tags: trade.tags || [],
        setup: trade.setup,
        note: trade.note,
      }));
    }
    else {
      throw new Error('Unsupported payload format');
    }

    const { data, error } = await supabase
      .from('trades')
      .insert(tradesToInsert)
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully imported ${data.length} trades`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: data.length,
        trades: data 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
