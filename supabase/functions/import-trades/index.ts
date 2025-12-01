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
  accountType?: 'sim' | 'evaluation' | 'performance' | 'live';
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
        // Mask API key in logs for security (only show first 8 chars)
        const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...` : 'empty';
        console.error('Invalid API key:', maskedKey);
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

    // NinjaTrader Single Execution Format (FIFO matching)
    if (payload.source === 'ninjatrader' && payload.executionId) {
      const execution = payload as NinjaTraderSingleExecution;
      const { symbol, market } = parseNinjaTraderInstrument(execution.instrument);
      
      console.log(`NinjaTrader execution: ${execution.action} ${symbol} (${market}) @ ${execution.price} x ${execution.quantity}`);
      
      // Normalize action: "Buy", "BuyToCover" → "Buy" | "Sell", "SellShort" → "Sell"
      const normalizedAction = execution.action.toUpperCase().startsWith('BUY') ? 'Buy' : 'Sell';
      
      // FIFO Logic: Look for existing open execution with opposite action
      // Buy can close a Short OR open a Long
      // Sell can close a Long OR open a Short
      const oppositeAction = normalizedAction === 'Buy' ? 'Sell' : 'Buy';
      
      const { data: openExecutions, error: queryError } = await supabase
        .from('ninjatrader_executions')
        .select('*')
        .eq('user_id', userId)
        .eq('symbol', symbol)
        .eq('account', execution.account)
        .eq('action', oppositeAction)
        .order('timestamp', { ascending: true }) // FIFO: oldest first
        .limit(1);
      
      if (queryError) {
        console.error('Error querying open executions:', queryError);
        throw queryError;
      }
      
      // If we found an opposite execution, this is an EXIT
      if (openExecutions && openExecutions.length > 0) {
        const entryExecution = openExecutions[0];
        
        // Determine side based on entry action
        const side = entryExecution.action === 'Buy' ? 'long' : 'short';
        
        // Calculate PnL
        const pnl = calculatePnL(
          symbol,
          market,
          side,
          entryExecution.price,
          execution.price,
          Math.min(entryExecution.quantity, execution.quantity), // Handle partial fills
          0 // fees can be configured later
        );
        
        console.log(`EXIT matched: ${side} ${symbol} Entry: ${entryExecution.price} Exit: ${execution.price} PnL: ${pnl}`);
        
        // Create complete trade and insert immediately
        const completedTrade = {
          user_id: userId,
          symbol: symbol,
          market: market,
          side: side,
          qty: Math.min(entryExecution.quantity, execution.quantity),
          entry_price: entryExecution.price,
          exit_price: execution.price,
          entry_time: entryExecution.timestamp,
          exit_time: execution.timestamp,
          fees: 0,
          pnl_net: pnl,
          tags: ['NinjaTrader'],
          account_type: entryExecution.account_type || execution.accountType || 'live',
          account_name: execution.account,
        };
        
        // Insert trade to database immediately
        const { data: insertedTrade, error: insertTradeError } = await supabase
          .from('trades')
          .insert(completedTrade)
          .select()
          .single();
        
        if (insertTradeError) {
          console.error('Error inserting trade:', insertTradeError);
          throw insertTradeError;
        }
        
        console.log('Trade successfully inserted:', insertedTrade.id);
        
        // Delete the paired entry execution ONLY after successful trade insert
        const { error: deleteError } = await supabase
          .from('ninjatrader_executions')
          .delete()
          .eq('id', entryExecution.id);
        
        if (deleteError) {
          console.error('Error deleting entry execution:', deleteError);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Trade completed and stored',
            trade: insertedTrade
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      else {
        // No opposite execution found, this is an ENTRY
        const { error: insertError } = await supabase
          .from('ninjatrader_executions')
          .insert({
            user_id: userId,
            account: execution.account,
            instrument: execution.instrument,
            symbol: symbol,
            market: market,
            action: normalizedAction, // Store normalized action for consistent matching
            quantity: execution.quantity,
            price: execution.price,
            timestamp: execution.timestamp,
            execution_id: execution.executionId,
            order_id: execution.orderId,
            market_position: execution.marketPosition,
            account_type: execution.accountType || 'live',
          });
        
        if (insertError) {
          console.error('Error storing entry execution:', insertError);
          throw insertError;
        }
        
        console.log(`ENTRY stored: ${execution.action} ${symbol} @ ${execution.price} (waiting for exit)`);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Entry execution stored',
            executionId: execution.executionId 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    // TradingView Alert Format
    else if (payload.symbol && payload.entryPrice && payload.exitPrice) {
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
    
    // Only insert trades if we have any
    if (tradesToInsert.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No trades to insert' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
