import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
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

    const { question, timeframe } = await req.json();

    if (!question) {
      throw new Error('No question provided');
    }

    console.log('Processing question:', question, 'for user:', user.id);

    // Fetch user's trades with optional timeframe filter
    let tradesQuery = supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_time', { ascending: false });

    if (timeframe) {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }
      
      if (timeframe !== 'all') {
        tradesQuery = tradesQuery.gte('entry_time', startDate.toISOString());
      }
    }

    const { data: trades, error: tradesError } = await tradesQuery;

    if (tradesError) {
      console.error('Error fetching trades:', tradesError);
      throw tradesError;
    }

    console.log('Fetched trades count:', trades?.length || 0);

    // Calculate KPIs
    const totalTrades = trades?.length || 0;
    const winningTrades = trades?.filter(t => t.pnl_net > 0) || [];
    const losingTrades = trades?.filter(t => t.pnl_net < 0) || [];
    const winRate = totalTrades > 0 ? ((winningTrades.length / totalTrades) * 100).toFixed(2) : '0';
    const netPnL = trades?.reduce((sum, t) => sum + Number(t.pnl_net), 0).toFixed(2) || '0';
    const avgWin = winningTrades.length > 0 
      ? (winningTrades.reduce((sum, t) => sum + Number(t.pnl_net), 0) / winningTrades.length).toFixed(2) 
      : '0';
    const avgLoss = losingTrades.length > 0 
      ? (losingTrades.reduce((sum, t) => sum + Number(t.pnl_net), 0) / losingTrades.length).toFixed(2) 
      : '0';
    const profitFactor = losingTrades.length > 0 && avgLoss !== '0'
      ? (Math.abs(Number(avgWin) * winningTrades.length) / Math.abs(Number(avgLoss) * losingTrades.length)).toFixed(2)
      : '0';

    // Build context for AI
    const systemPrompt = `Du bist ein professioneller Trading-Analyst-Assistent für TradeNotes.io. Du analysierst Trading-Daten und gibst präzise, datenbasierte Antworten in einer freundlichen aber professionellen Art.

Verfügbare Performance-Daten des Traders:
- Gesamt Trades: ${totalTrades}
- Win-Rate: ${winRate}%
- Net P&L: $${netPnL}
- Profit Factor: ${profitFactor}
- Durchschnittlicher Gewinn: $${avgWin}
- Durchschnittlicher Verlust: $${avgLoss}
- Gewinn-Trades: ${winningTrades.length}
- Verlust-Trades: ${losingTrades.length}

Top 10 neueste Trades:
${trades?.slice(0, 10).map(t => `- ${t.symbol} (${t.side}): Entry $${t.entry_price}, Exit $${t.exit_price}, P&L: $${t.pnl_net}, Setup: ${t.setup || 'N/A'}, Zeit: ${new Date(t.entry_time).toLocaleDateString()}`).join('\n')}

${totalTrades > 10 ? `\nWeitere ${totalTrades - 10} Trades sind in der Historie verfügbar.` : ''}

Anweisungen:
- Antworte präzise und datengetrieben
- Nutze konkrete Zahlen und Beispiele aus den Daten
- Sei konstruktiv und hilfreich
- Wenn du Muster siehst, weise darauf hin
- Halte die Antwort fokussiert und nicht zu lang (max 3-4 Sätze)
- Verwende Emojis sparsam aber passend (📈, 💰, 📊, ⚠️)
- Antworte auf Deutsch`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    console.log('AI response received, saving to database...');

    // Save conversation to database
    const { error: saveError } = await supabase
      .from('assistant_conversations')
      .insert({
        user_id: user.id,
        question,
        answer,
        context_trades_count: totalTrades,
      });

    if (saveError) {
      console.error('Error saving conversation:', saveError);
      // Don't throw, just log - we still want to return the answer
    }

    return new Response(
      JSON.stringify({ answer, tradesAnalyzed: totalTrades }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in trading-assistant function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
