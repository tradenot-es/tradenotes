import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const ALLOWED_ORIGINS = [
  "https://tradenot.es",
  "https://www.tradenot.es",
  "http://localhost:5173",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const isAllowed =
    ALLOWED_ORIGINS.some((allowed) => origin.startsWith(allowed)) ||
    origin.includes(".lovableproject.com") ||
    origin.includes(".lovable.app");

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { date } = await req.json();
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    console.log(`Generating daily summary for user ${user.id} on ${date}`);

    // Fetch trades for the given day
    const { data: trades, error: tradesError } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", user.id)
      .gte("exit_time", `${date}T00:00:00`)
      .lt("exit_time", `${date}T23:59:59`)
      .order("exit_time", { ascending: true });

    if (tradesError) {
      console.error("Error fetching trades:", tradesError);
      throw tradesError;
    }

    if (!trades || trades.length === 0) {
      return new Response(
        JSON.stringify({ message: "Keine Trades an diesem Tag gefunden." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate KPIs
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl_net || 0), 0);
    const winningTrades = trades.filter((t) => t.pnl_net > 0);
    const losingTrades = trades.filter((t) => t.pnl_net < 0);
    const winRate = ((winningTrades.length / trades.length) * 100).toFixed(1);
    const avgWin = winningTrades.length > 0
      ? (winningTrades.reduce((s, t) => s + t.pnl_net, 0) / winningTrades.length).toFixed(2)
      : "0";
    const avgLoss = losingTrades.length > 0
      ? (losingTrades.reduce((s, t) => s + t.pnl_net, 0) / losingTrades.length).toFixed(2)
      : "0";

    // Find best/worst trades
    const sortedByPnL = [...trades].sort((a, b) => b.pnl_net - a.pnl_net);
    const bestTrade = sortedByPnL[0];
    const worstTrade = sortedByPnL[sortedByPnL.length - 1];

    // Analyze by hour
    const hourlyStats: Record<string, { pnl: number; count: number }> = {};
    trades.forEach((t) => {
      const hour = new Date(t.entry_time).getHours().toString().padStart(2, "0") + ":00";
      if (!hourlyStats[hour]) hourlyStats[hour] = { pnl: 0, count: 0 };
      hourlyStats[hour].pnl += t.pnl_net;
      hourlyStats[hour].count++;
    });

    const hourlyArray = Object.entries(hourlyStats).map(([hour, stats]) => ({
      hour,
      ...stats,
    }));
    const bestHour = hourlyArray.reduce((best, curr) => (curr.pnl > best.pnl ? curr : best), hourlyArray[0]);
    const worstHour = hourlyArray.reduce((worst, curr) => (curr.pnl < worst.pnl ? curr : worst), hourlyArray[0]);

    // Find most traded symbol
    const symbolCounts: Record<string, number> = {};
    trades.forEach((t) => {
      symbolCounts[t.symbol] = (symbolCounts[t.symbol] || 0) + 1;
    });
    const mostTradedSymbol = Object.entries(symbolCounts).reduce(
      (max, [sym, count]) => (count > max.count ? { symbol: sym, count } : max),
      { symbol: "", count: 0 }
    ).symbol;

    // Build highlights
    const highlights = {
      bestTrade: bestTrade ? { symbol: bestTrade.symbol, pnl: bestTrade.pnl_net } : undefined,
      worstTrade: worstTrade && worstTrade.pnl_net < 0 ? { symbol: worstTrade.symbol, pnl: worstTrade.pnl_net } : undefined,
      mostTradedSymbol: mostTradedSymbol || undefined,
      bestHour: bestHour?.pnl > 0 ? bestHour.hour : undefined,
      worstHour: worstHour?.pnl < 0 ? worstHour.hour : undefined,
    };

    // Build AI prompt
    const systemPrompt = `Du bist ein Trading-Coach, der Tages-Zusammenfassungen für Trader erstellt. 
Analysiere die folgenden Trading-Daten und erstelle eine kurze, motivierende aber ehrliche Zusammenfassung.

Fokussiere auf:
1. Gesamtperformance des Tages
2. Erkannte Muster (beste/schlechteste Zeiten, Symbole)
3. Emotionale Trigger oder mögliche Fehler
4. 3 konkrete, actionable Verbesserungsvorschläge

Halte die Zusammenfassung kurz (max 150 Wörter) und freundlich.
Antworte im JSON-Format:
{
  "summary": "Deine Zusammenfassung hier...",
  "suggestions": ["Vorschlag 1", "Vorschlag 2", "Vorschlag 3"]
}`;

    const tradeContext = `Datum: ${date}
Gesamt Trades: ${trades.length}
Net P&L: $${totalPnL.toFixed(2)}
Win Rate: ${winRate}%
Gewinner: ${winningTrades.length} (Ø $${avgWin})
Verlierer: ${losingTrades.length} (Ø $${avgLoss})
Bester Trade: ${bestTrade.symbol} +$${bestTrade.pnl_net.toFixed(2)}
Schlechtester Trade: ${worstTrade.symbol} $${worstTrade.pnl_net.toFixed(2)}
Meistgehandeltes Symbol: ${mostTradedSymbol}
Beste Stunde: ${bestHour?.hour || "N/A"} ($${bestHour?.pnl.toFixed(2) || "0"})
Schlechteste Stunde: ${worstHour?.hour || "N/A"} ($${worstHour?.pnl.toFixed(2) || "0"})

Trade-Details:
${trades.map((t) => `- ${t.symbol} (${t.side}): Entry ${new Date(t.entry_time).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}, P&L: $${t.pnl_net.toFixed(2)}, Setup: ${t.setup || "N/A"}`).join("\n")}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Calling Lovable AI for summary...");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: tradeContext },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;

    // Parse AI response
    let summary = "";
    let suggestions: string[] = [];

    try {
      // Try to extract JSON from the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = parsed.summary || aiContent;
        suggestions = parsed.suggestions || [];
      } else {
        summary = aiContent;
      }
    } catch {
      summary = aiContent;
    }

    // Upsert summary to database
    const { data: savedSummary, error: saveError } = await supabase
      .from("daily_summaries")
      .upsert(
        {
          user_id: user.id,
          date,
          summary_text: summary,
          highlights,
          suggestions,
          trades_count: trades.length,
          net_pnl: totalPnL,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (saveError) {
      console.error("Error saving summary:", saveError);
      throw saveError;
    }

    console.log("Daily summary generated and saved successfully");

    return new Response(
      JSON.stringify({ summary: savedSummary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily-summary function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
