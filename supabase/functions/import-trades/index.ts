import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const payload = await req.json();
    console.log('Received payload:', payload);

    let tradesToInsert: any[] = [];

    // TradingView Alert Format
    if (payload.symbol && payload.entryPrice && payload.exitPrice) {
      const trade = payload as TradingViewAlert;
      tradesToInsert.push({
        user_id: user.id,
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
        user_id: user.id,
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
        user_id: user.id,
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
