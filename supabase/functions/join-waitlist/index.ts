import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://tradenot.es",
  "https://www.tradenot.es",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Validate and get CORS headers with proper origin
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed)) || 
                   origin.includes(".lovableproject.com") || 
                   origin.includes(".lovable.app");
  
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;

// Rate limiting: max requests per IP per hour
const MAX_REQUESTS_PER_HOUR = 5;

interface RateLimitRecord {
  request_count: number;
  window_start: string;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { email } = await req.json();

    // Validate email
    if (!email || typeof email !== "string") {
      return new Response(
        JSON.stringify({ error: "email_required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
      return new Response(
        JSON.stringify({ error: "email_too_long" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return new Response(
        JSON.stringify({ error: "email_invalid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP for rate limiting
    const clientIP = req.headers.get("cf-connecting-ip") || 
                     req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Get user agent for analytics
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit using rate_limits table
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const rateLimitKey = `waitlist:${clientIP}`;

    const { data: rateLimitData } = await supabase
      .from("rate_limits")
      .select("request_count, window_start")
      .eq("ip_address", rateLimitKey)
      .gte("window_start", oneHourAgo)
      .single() as { data: RateLimitRecord | null };

    if (rateLimitData && rateLimitData.request_count >= MAX_REQUESTS_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: "rate_limit_exceeded" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update or insert rate limit record
    if (rateLimitData) {
      await supabase
        .from("rate_limits")
        .update({ request_count: rateLimitData.request_count + 1 })
        .eq("ip_address", rateLimitKey);
    } else {
      await supabase
        .from("rate_limits")
        .insert({ ip_address: rateLimitKey, request_count: 1, window_start: new Date().toISOString() });
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", trimmedEmail)
      .single();

    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: "email_duplicate" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert into waitlist
    const { error: insertError } = await supabase
      .from("waitlist")
      .insert({
        email: trimmedEmail,
        ip_address: clientIP,
        user_agent: userAgent,
        source: "prelaunch"
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      
      // Handle unique constraint violation (race condition)
      if (insertError.code === "23505") {
        return new Response(
          JSON.stringify({ error: "email_duplicate" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "insert_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Waitlist signup: ${trimmedEmail.substring(0, 3)}***`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Waitlist error:", error);
    return new Response(
      JSON.stringify({ error: "server_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
