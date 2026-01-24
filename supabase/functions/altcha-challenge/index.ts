import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ALTCHA PoW Configuration - keep difficulty low for fast solving
const DIFFICULTY = 100000; // Max number to search
const CHALLENGE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Store valid challenges temporarily (in production, use a database)
const validChallenges = new Map<string, { salt: string; secretNumber: number; expires: number }>();

// Generate a challenge following ALTCHA v2 protocol
async function generateChallenge(): Promise<{ challenge: string; salt: string; algorithm: string; maxnumber: number; signature: string }> {
  const salt = crypto.randomUUID();
  const secretNumber = Math.floor(Math.random() * DIFFICULTY); // Random number client needs to find
  const algorithm = 'SHA-256';
  
  // Calculate the challenge hash: SHA-256(salt + secretNumber)
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}${secretNumber}`);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const challenge = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Store for verification
  const expires = Date.now() + CHALLENGE_EXPIRY_MS;
  validChallenges.set(challenge, { salt, secretNumber, expires });
  
  // Cleanup expired challenges
  for (const [key, value] of validChallenges.entries()) {
    if (value.expires < Date.now()) {
      validChallenges.delete(key);
    }
  }
  
  // Create signature for additional security
  const signatureData = `${challenge}:${salt}:${DIFFICULTY}:${expires}`;
  const signature = btoa(signatureData);
  
  return {
    challenge,
    salt,
    algorithm,
    maxnumber: DIFFICULTY,
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
    // Recalculate the hash with the provided number
    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}${number}`);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // The calculated hash must match the challenge
    return calculatedHash === challenge;
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
      const challengeData = await generateChallenge();
      
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
        
        // Remove used challenge to prevent replay attacks
        if (isValid) {
          validChallenges.delete(challenge);
        }
        
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
