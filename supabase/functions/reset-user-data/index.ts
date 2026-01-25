import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.email) throw new Error("User not found");

    // Get password from request body
    const { password } = await req.json();
    if (!password) throw new Error("Password is required");

    // Verify password by attempting to sign in
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,
      password: password,
    });

    if (signInError) {
      return new Response(
        JSON.stringify({ error: "Incorrect password" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Password is correct, proceed with deletion
    console.log(`Starting data reset for user ${user.id}`);

    // Delete user data from all tables
    const tables = [
      "trades",
      "journal_entries",
      "daily_prep",
      "assistant_conversations",
      "ninjatrader_executions",
      "news_source_preferences",
    ];

    for (const table of tables) {
      const { error } = await supabaseClient
        .from(table)
        .delete()
        .eq("user_id", user.id);
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        throw new Error(`Failed to delete data from ${table}`);
      }
      console.log(`Deleted data from ${table}`);
    }

    // Reset user_settings to defaults
    const { error: settingsError } = await supabaseClient
      .from("user_settings")
      .update({
        default_fees: 2.00,
        default_slippage: 0.5,
        setup_definitions: [],
        daily_goal_amount: 500.00,
        daily_goal_max_trades: 10,
        base_currency: "USD",
        timezone: "America/New_York",
        setups: ["Breakout", "Failed Rally", "Gap Fill", "Trend Follow"],
        tags: ["momentum", "reversal", "tech", "index"],
      })
      .eq("user_id", user.id);

    if (settingsError) {
      console.error("Error resetting user_settings:", settingsError);
      throw new Error("Failed to reset settings");
    }
    console.log("Reset user_settings to defaults");

    return new Response(
      JSON.stringify({ success: true, message: "All data reset successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error in reset-user-data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
