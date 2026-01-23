import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ALTCHA PoW Configuration
const DIFFICULTY = 50000; // Number of iterations required (higher = harder)
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const SECRET_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'default-secret';

// Generate a random challenge
function generateChallenge(): { challenge: string; salt: string; algorithm: string; maxnumber: number; signature: string } {
  const salt = crypto.randomUUID();
  const challenge = crypto.randomUUID();
  const maxnumber = DIFFICULTY;
  const algorithm = 'SHA-256';
  
  // Create signature for verification
  const data = `${challenge}:${salt}:${maxnumber}:${Date.now()}`;
  const signature = btoa(data);
  
  return {
    challenge,
    salt,
    algorithm,
    maxnumber,
    signature,
  };
}

// Verify a PoW solution
async function verifySolution(
  challenge: string,
  salt: string,
  number: number,
  algorithm: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}${number}`);
    
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Check if the hash matches the challenge
    return hashHex.startsWith(challenge.substring(0, 8));
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'create';

    if (req.method === 'GET' && action === 'create') {
      // Generate new challenge
      const challengeData = generateChallenge();
      
      return new Response(JSON.stringify(challengeData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'POST' && action === 'verify') {
      const body = await req.json();
      const { payload } = body;
      
      if (!payload) {
        return new Response(JSON.stringify({ valid: false, error: 'Missing payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      try {
        // Decode the base64 payload
        const decoded = JSON.parse(atob(payload));
        const { challenge, salt, number, algorithm } = decoded;
        
        if (!challenge || !salt || number === undefined || !algorithm) {
          return new Response(JSON.stringify({ valid: false, error: 'Invalid payload structure' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const isValid = await verifySolution(challenge, salt, number, algorithm);
        
        return new Response(JSON.stringify({ valid: isValid }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch {
        return new Response(JSON.stringify({ valid: false, error: 'Invalid payload format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('ALTCHA error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
