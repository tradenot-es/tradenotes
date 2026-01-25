import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

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

// Generate a cryptographically secure random hex string
function generateSecureApiKey(byteLength: number = 24): string {
  const randomBytes = new Uint8Array(byteLength);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST for key regeneration
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Validate JWT authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify the user via getClaims
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Claims verification failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = claimsData.claims.sub;
    
    // Generate new API key server-side (48 hex characters = 24 random bytes)
    const newApiKey = generateSecureApiKey(24);
    
    // Use service role to update the API key (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    const { error: updateError } = await supabaseAdmin
      .from('user_settings')
      .update({ webhook_api_key: newApiKey })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error('Error updating webhook key:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to regenerate API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Webhook API key regenerated for user: ${userId.substring(0, 8)}...`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        webhook_api_key: newApiKey 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
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
