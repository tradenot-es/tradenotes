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

    // Input validation
    if (!question || typeof question !== 'string') {
      throw new Error('Invalid question format');
    }

    // Length validation (prevent token abuse)
    if (question.length > 500) {
      throw new Error('Question too long (max 500 characters)');
    }

    // Sanitization
    const sanitizedQuestion = question
      .trim()
      .replace(/[\r\n\t]+/g, ' ')
      .substring(0, 500);

    // Enhanced content filtering for prompt injection
    const suspiciousPatterns = [
      // Direct injection attempts
      /ignore.{0,50}(previous|above|instruction|system)/i,
      /system.{0,30}prompt/i,
      /admin.{0,30}mode/i,
      /reveal.{0,30}(instructions|prompt|system|context)/i,
      /pretend.{0,30}you.{0,30}are/i,
      /disregard.{0,30}(above|previous|instruction)/i,
      // Role manipulation
      /you.{0,20}(are|will be).{0,20}(now|from now)/i,
      /act.{0,20}as.{0,20}(if|though)/i,
      /new.{0,20}(persona|identity|role)/i,
      // Context escape attempts
      /forget.{0,30}(everything|all|above)/i,
      /override.{0,20}(instruction|rule|setting)/i,
      /bypass.{0,20}(filter|security|restriction)/i,
      // Data extraction attempts
      /what.{0,30}(are|is).{0,30}(your|system).{0,20}(instruction|prompt|rule)/i,
      /tell.{0,20}me.{0,20}(your|the).{0,20}(instruction|prompt|rule)/i,
      /repeat.{0,30}(instruction|prompt|system)/i,
      /output.{0,20}(everything|all|instruction)/i,
      // Delimiter injection
      /\[\[.{0,50}\]\]/i,
      /\{\{.{0,50}\}\}/i,
      /<<<.{0,50}>>>/i,
      // Unicode normalization bypass attempts (common tricks)
      /[\u200B-\u200D\uFEFF]/,
      // Multi-language injection keywords
      /(vergiss|oublie|olvida|dimentica).{0,30}(alles|tout|todo|tutto)/i,
    ];

    // Check for suspicious patterns
    if (suspiciousPatterns.some(p => p.test(sanitizedQuestion))) {
      console.log('Prompt injection attempt detected from user:', user.id);
      throw new Error('Question contains prohibited content');
    }

    // Additional semantic checks for suspicious question structures
    const suspiciousKeywords = [
      'jailbreak', 'dan mode', 'developer mode', 'sudo', 'root access',
      'base64', 'hex encode', 'rot13', 'encoded instruction'
    ];
    const lowerQuestion = sanitizedQuestion.toLowerCase();
    if (suspiciousKeywords.some(kw => lowerQuestion.includes(kw))) {
      console.log('Suspicious keyword detected from user:', user.id);
      throw new Error('Question contains prohibited content');
    }

    console.log('Processing question:', question, 'for user:', user.id);

    // Check daily usage and rate limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count: questionsToday, error: countError } = await supabase
      .from('assistant_conversations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (countError) {
      console.error('Error counting questions:', countError);
      throw new Error('Could not verify usage limit');
    }

    const questionCount = questionsToday || 0;
    console.log('Questions asked today:', questionCount);

    // Get subscription tier from user_settings
    const { data: settings } = await supabase
      .from('user_settings')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    // Define rate limits per tier
    const rateLimits = {
      free: 5,
      basic: 20,
      premium: 50,
      enterprise: 200
    };

    const userTier = settings?.subscription_tier || 'free';
    const dailyLimit = rateLimits[userTier as keyof typeof rateLimits] || rateLimits.free;

    if (questionCount >= dailyLimit) {
      return new Response(
        JSON.stringify({ 
          error: 'Daily limit reached',
          limit: dailyLimit,
          tier: userTier,
          questionsToday: questionCount 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

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
          { role: 'user', content: sanitizedQuestion }
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
    let answer = aiData.choices[0].message.content;

    // Output validation: Check if AI response leaked system prompt or instructions
    const leakedPatterns = [
      /verfügbare performance-daten/i,
      /du bist ein professioneller trading-analyst/i,
      /anweisungen:/i,
      /system.?prompt/i,
      /hier (sind|ist) (meine|die) (anweisung|instruktion)/i,
      /als ki.{0,20}(assistent|modell)/i,
      /meine (programmierung|konfiguration)/i,
    ];
    
    if (leakedPatterns.some(p => p.test(answer))) {
      console.log('Potential system prompt leak detected, sanitizing response');
      answer = 'Ich kann diese Frage leider nicht beantworten. Bitte stelle eine Frage zu deiner Trading-Performance. 📊';
    }

    console.log('AI response received, saving to database...');

    // Save conversation to database
    const { error: saveError } = await supabase
      .from('assistant_conversations')
      .insert({
        user_id: user.id,
        question: sanitizedQuestion,
        answer,
        context_trades_count: totalTrades,
      });

    if (saveError) {
      console.error('Error saving conversation:', saveError);
      // Don't throw, just log - we still want to return the answer
    }

    return new Response(
      JSON.stringify({ 
        answer, 
        tradesAnalyzed: totalTrades,
        questionsRemaining: dailyLimit - (questionCount + 1),
        dailyLimit,
        tier: userTier
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in trading-assistant function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
