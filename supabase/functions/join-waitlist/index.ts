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

// Email template styles (consistent with auth emails)
const getEmailStyles = () => `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  </style>
`;

const getEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${getEmailStyles()}
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  ${content}
</body>
</html>
`;

// Waitlist email content based on language
const getWaitlistEmailContent = (language: string = 'de') => {
  const templates: Record<string, { subject: string; heading: string; body: string; footer: string }> = {
    de: {
      subject: "🎉 Willkommen auf der Warteliste – TradeNot.es",
      heading: "Du bist dabei!",
      body: `
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          Hallo,
        </p>
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          Danke für dein Interesse an TradeNot.es – deinem professionellen Trading Journal.
        </p>
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          Du bist jetzt auf unserer Warteliste und gehörst zu den Ersten, die zum Launch Zugang erhalten.
        </p>
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          <strong style="color: #10b981;">Was dich erwartet:</strong>
        </p>
        <ul style="color: #d1d5db; line-height: 1.8; margin: 0 0 16px 0; padding-left: 20px;">
          <li>Professionelles Trading-Journal</li>
          <li>KI-gestützter Trading-Assistent</li>
          <li>Detaillierte Performance-Analysen</li>
        </ul>
      `,
      footer: "Wir melden uns, sobald es losgeht!"
    },
    en: {
      subject: "🎉 Welcome to the Waitlist – TradeNot.es",
      heading: "You're on the list!",
      body: `
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          Hello,
        </p>
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          Thank you for your interest in TradeNot.es – your professional trading journal.
        </p>
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          You're now on our waitlist and will be among the first to get access at launch.
        </p>
        <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
          <strong style="color: #10b981;">What awaits you:</strong>
        </p>
        <ul style="color: #d1d5db; line-height: 1.8; margin: 0 0 16px 0; padding-left: 20px;">
          <li>Professional trading journal</li>
          <li>AI-powered trading assistant</li>
          <li>Detailed performance analytics</li>
        </ul>
      `,
      footer: "We'll notify you as soon as we launch!"
    }
  };

  // Fallback to English for unsupported languages
  const template = templates[language] || templates['en'];

  const htmlContent = `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #1a1a1a; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a;">
            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #2a2a2a;">
                <img src="https://tradenot.es/favicon.png" alt="TradeNot.es" width="48" height="48" style="display: block; margin: 0 auto 16px auto;">
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                  ${template.heading}
                </h1>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="padding: 32px;">
                ${template.body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="padding: 24px 32px; text-align: center; border-top: 1px solid #2a2a2a;">
                <p style="color: #10b981; font-size: 14px; margin: 0 0 16px 0; font-weight: 500;">
                  ${template.footer}
                </p>
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} TradeNot.es – Dein Trading Journal
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: template.subject,
    html: getEmailTemplate(htmlContent)
  };
};

// Send confirmation email via Lettermint
async function sendWaitlistEmail(email: string, language: string): Promise<boolean> {
  const lettermintApiKey = Deno.env.get("LETTERMINT_API_KEY");
  
  if (!lettermintApiKey) {
    console.error("LETTERMINT_API_KEY not configured");
    return false;
  }

  const emailContent = getWaitlistEmailContent(language);

  try {
    const response = await fetch("https://api.lettermint.co/v1/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lettermintApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TradeNot.es <noreply@tradenot.es>",
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lettermint error:", response.status, errorText);
      return false;
    }

    console.log(`Waitlist confirmation email sent to: ${email.substring(0, 3)}***`);
    return true;
  } catch (error) {
    console.error("Failed to send waitlist email:", error);
    return false;
  }
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
    const { email, language = "de" } = await req.json();

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

    // Send confirmation email (silent fail - don't block success if email fails)
    const normalizedLang = language.split('-')[0].toLowerCase();
    await sendWaitlistEmail(trimmedEmail, normalizedLang);

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
