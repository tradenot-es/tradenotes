import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

const logStep = (step: string, details?: Record<string, unknown>) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AUTH-EMAIL] ${step}${detailsStr}`);
};

interface AuthEmailRequest {
  email: string;
  type: 'signup' | 'recovery' | 'email_change' | 'magic_link';
  token?: string;
  token_hash?: string;
  redirect_to?: string;
  firstName?: string;
  language?: string;
  altcha_payload?: string;
  new_email?: string; // For email_change type
}

const getBaseUrl = () => {
  return "https://tradenot.es";
};

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

const getEmailContent = (
  type: string, 
  email: string, 
  confirmUrl: string, 
  firstName?: string, 
  language: string = 'de'
) => {
  const name = firstName || 'Trader';
  const baseUrl = getBaseUrl();
  
  const templates: Record<string, Record<string, { subject: string; heading: string; body: string; buttonText: string; footer: string }>> = {
    signup: {
      de: {
        subject: "🎉 Willkommen bei TradeNot.es – Bestätige deine E-Mail",
        heading: "Willkommen bei TradeNot.es!",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hallo ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Vielen Dank für deine Registrierung! Bitte bestätige deine E-Mail-Adresse, um dein Konto zu aktivieren und alle Features nutzen zu können.
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            <strong style="color: #10b981;">Was dich erwartet:</strong>
          </p>
          <ul style="color: #d1d5db; line-height: 1.8; margin: 0 0 16px 0; padding-left: 20px;">
            <li>14 Tage kostenlose Testphase mit vollen Features</li>
            <li>Professionelles Trading-Journal</li>
            <li>KI-gestützter Trading-Assistent</li>
            <li>Detaillierte Performance-Analysen</li>
          </ul>
        `,
        buttonText: "E-Mail bestätigen",
        footer: "Dieser Link ist 24 Stunden gültig."
      },
      en: {
        subject: "🎉 Welcome to TradeNot.es – Confirm your email",
        heading: "Welcome to TradeNot.es!",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hello ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Thank you for signing up! Please confirm your email address to activate your account and access all features.
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            <strong style="color: #10b981;">What awaits you:</strong>
          </p>
          <ul style="color: #d1d5db; line-height: 1.8; margin: 0 0 16px 0; padding-left: 20px;">
            <li>14-day free trial with full features</li>
            <li>Professional trading journal</li>
            <li>AI-powered trading assistant</li>
            <li>Detailed performance analytics</li>
          </ul>
        `,
        buttonText: "Confirm Email",
        footer: "This link is valid for 24 hours."
      }
    },
    recovery: {
      de: {
        subject: "🔐 Passwort zurücksetzen – TradeNot.es",
        heading: "Passwort zurücksetzen",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hallo ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button unten, um ein neues Passwort festzulegen.
          </p>
          <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 16px 0; font-size: 14px;">
            Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
          </p>
        `,
        buttonText: "Neues Passwort festlegen",
        footer: "Dieser Link ist 1 Stunde gültig."
      },
      en: {
        subject: "🔐 Reset your password – TradeNot.es",
        heading: "Reset your password",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hello ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            You requested to reset your password. Click the button below to set a new password.
          </p>
          <p style="color: #9ca3af; line-height: 1.6; margin: 0 0 16px 0; font-size: 14px;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
        `,
        buttonText: "Set new password",
        footer: "This link is valid for 1 hour."
      }
    },
    email_change: {
      de: {
        subject: "📧 E-Mail-Adresse bestätigen – TradeNot.es",
        heading: "Neue E-Mail-Adresse bestätigen",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hallo ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Du hast angefordert, deine E-Mail-Adresse zu ändern. Bitte bestätige diese neue E-Mail-Adresse, indem du auf den Button unten klickst.
          </p>
        `,
        buttonText: "E-Mail-Adresse bestätigen",
        footer: "Dieser Link ist 24 Stunden gültig."
      },
      en: {
        subject: "📧 Confirm email address – TradeNot.es",
        heading: "Confirm your new email address",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hello ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            You requested to change your email address. Please confirm this new email address by clicking the button below.
          </p>
        `,
        buttonText: "Confirm email address",
        footer: "This link is valid for 24 hours."
      }
    },
    magic_link: {
      de: {
        subject: "🔑 Dein Login-Link – TradeNot.es",
        heading: "Magic Link Login",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hallo ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Klicke auf den Button unten, um dich bei TradeNot.es anzumelden. Kein Passwort erforderlich!
          </p>
        `,
        buttonText: "Jetzt einloggen",
        footer: "Dieser Link ist 10 Minuten gültig."
      },
      en: {
        subject: "🔑 Your login link – TradeNot.es",
        heading: "Magic Link Login",
        body: `
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Hello ${name},
          </p>
          <p style="color: #d1d5db; line-height: 1.6; margin: 0 0 16px 0;">
            Click the button below to log in to TradeNot.es. No password required!
          </p>
        `,
        buttonText: "Log in now",
        footer: "This link is valid for 10 minutes."
      }
    }
  };

  const template = templates[type]?.[language] || templates[type]?.['de'] || templates['recovery']['de'];
  
  const htmlContent = getEmailTemplate(`
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <!-- Header with Logo -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #10b981; font-size: 28px; font-weight: 700; margin: 0 0 8px 0;">TradeNot.es</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 0;">Dein professionelles Trading Journal</p>
      </div>
      
      <!-- Main Card -->
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); border: 1px solid #262626; border-radius: 16px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.3);">
        <h2 style="color: #ffffff; font-size: 22px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">
          ${template.heading}
        </h2>
        
        ${template.body}
        
        <!-- CTA Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${confirmUrl}" 
             style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
            ${template.buttonText}
          </a>
        </div>
        
        <!-- Footer Note -->
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 24px 0 0 0;">
          ${template.footer}
        </p>
      </div>
      
      <!-- Email Footer -->
      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #262626;">
        <p style="color: #4b5563; font-size: 12px; margin: 0 0 8px 0;">
          Du erhältst diese E-Mail, weil du bei TradeNot.es registriert bist.
        </p>
        <a href="${baseUrl}" style="color: #10b981; font-size: 12px; text-decoration: none;">tradenot.es</a>
      </div>
    </div>
  `);

  return {
    subject: template.subject,
    html: htmlContent
  };
};

// Verify ALTCHA payload
async function verifyAltcha(payload: string): Promise<boolean> {
  try {
    const decoded = JSON.parse(atob(payload));
    const { challenge, salt, number, algorithm } = decoded;
    
    if (!challenge || !salt || number === undefined || !algorithm) {
      return false;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(`${salt}${number}`);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const calculatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return calculatedHash === challenge;
  } catch {
    return false;
  }
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const lettermintKey = Deno.env.get("LETTERMINT_API_KEY");
    if (!lettermintKey) {
      throw new Error("LETTERMINT_API_KEY is not set");
    }
    logStep("Lettermint key verified");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase credentials not configured");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const body: AuthEmailRequest = await req.json();
    const { email, type, token, token_hash, redirect_to, firstName, language, altcha_payload, new_email } = body;
    
    if (!email || !type) {
      throw new Error("Missing required fields: email and type");
    }
    logStep("Request parsed", { email: email.substring(0, 3) + "***", type, language });

    // Verify ALTCHA for signup, recovery, and email_change requests (spam protection)
    if ((type === 'signup' || type === 'recovery' || type === 'email_change') && altcha_payload) {
      const isValidAltcha = await verifyAltcha(altcha_payload);
      if (!isValidAltcha) {
        logStep("ALTCHA verification failed");
        return new Response(JSON.stringify({ error: "Captcha verification failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      logStep("ALTCHA verified successfully");
    }

    const baseUrl = getBaseUrl();
    let confirmUrl = redirect_to || baseUrl;
    
    // Generate secure links using Supabase Admin API
    if (type === 'signup') {
      // For signup, the user was already created with supabase.auth.signUp()
      // We generate a magiclink to verify the email
      logStep("Generating email verification link via Supabase Admin API");
      
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${baseUrl}/dashboard`,
        },
      });
      
      if (linkError) {
        logStep("Error generating verification link", { error: linkError.message });
        throw new Error(`Failed to generate verification link: ${linkError.message}`);
      }
      
      if (linkData?.properties?.action_link) {
        confirmUrl = linkData.properties.action_link;
        logStep("Email verification link generated successfully");
      } else {
        throw new Error("No action link returned from generateLink");
      }
    } else if (type === 'recovery') {
      logStep("Generating recovery link via Supabase Admin API");
      
      // Find user to track password reset
      const { data: userData } = await supabaseAdmin.auth.admin.listUsers();
      const targetUser = userData?.users.find(u => u.email === email);
      
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${baseUrl}/auth?reset=true`,
        },
      });
      
      if (linkError) {
        logStep("Error generating recovery link", { error: linkError.message });
        throw new Error(`Failed to generate recovery link: ${linkError.message}`);
      }
      
      if (linkData?.properties?.action_link) {
        confirmUrl = linkData.properties.action_link;
        logStep("Recovery link generated successfully");
        
        // Track password reset for cooldown
        if (targetUser) {
          await supabaseAdmin.from('email_change_tracking').insert({
            user_id: targetUser.id,
            change_type: 'password_reset',
            old_email: email,
          });
          logStep("Password reset tracked for cooldown");
        }
      } else {
        throw new Error("No action link returned from generateLink");
      }
    } else if (type === 'email_change' && new_email) {
      logStep("Processing email change request - single confirmation flow");
      
      // Find the user by their current email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (userError) {
        logStep("Error listing users", { error: userError.message });
        throw new Error(`Failed to find user: ${userError.message}`);
      }
      
      const targetUser = userData.users.find(u => u.email === email);
      if (!targetUser) {
        logStep("User not found with email", { email: email.substring(0, 3) + "***" });
        throw new Error("User not found");
      }
      
      logStep("User found", { userId: targetUser.id });
      
      // Check for 30-day email change limit
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentEmailChanges } = await supabaseAdmin
        .from('email_change_tracking')
        .select('created_at')
        .eq('user_id', targetUser.id)
        .eq('change_type', 'email_change')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (recentEmailChanges && recentEmailChanges.length > 0) {
        const lastChange = new Date(recentEmailChanges[0].created_at);
        const nextAllowed = new Date(lastChange);
        nextAllowed.setDate(nextAllowed.getDate() + 30);
        const daysRemaining = Math.ceil((nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        logStep("Email change limit reached", { lastChange: lastChange.toISOString(), daysRemaining });
        
        return new Response(
          JSON.stringify({
            success: false,
            code: "EMAIL_CHANGE_LIMIT",
            error: `Du kannst deine E-Mail nur einmal pro 30 Tage ändern. Nächste Änderung möglich in ${daysRemaining} Tagen.`,
            nextAllowedDate: nextAllowed.toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
      
      // Check for 24-hour password reset cooldown
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data: recentPasswordResets } = await supabaseAdmin
        .from('email_change_tracking')
        .select('created_at')
        .eq('user_id', targetUser.id)
        .eq('change_type', 'password_reset')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (recentPasswordResets && recentPasswordResets.length > 0) {
        const lastReset = new Date(recentPasswordResets[0].created_at);
        const cooldownEnd = new Date(lastReset);
        cooldownEnd.setHours(cooldownEnd.getHours() + 24);
        const hoursRemaining = Math.ceil((cooldownEnd.getTime() - Date.now()) / (1000 * 60 * 60));
        
        logStep("Password reset cooldown active", { lastReset: lastReset.toISOString(), hoursRemaining });
        
        return new Response(
          JSON.stringify({
            success: false,
            code: "PASSWORD_RESET_COOLDOWN",
            error: `Aus Sicherheitsgründen kannst du deine E-Mail 24 Stunden nach einem Passwort-Reset nicht ändern. Noch ${hoursRemaining} Stunden warten.`,
            cooldownEndDate: cooldownEnd.toISOString(),
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
      
      // Check if new email is already in use by another user
      const existingUser = userData.users.find(u => u.email === new_email && u.id !== targetUser.id);
      if (existingUser) {
        logStep("New email already in use by another user");

        return new Response(
          JSON.stringify({
            success: false,
            code: "EMAIL_ALREADY_IN_USE",
            error: "Diese E-Mail-Adresse wird bereits verwendet",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
      
      // Directly update the user's email using Admin API
      // This bypasses the double-confirmation requirement
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email: new_email,
        email_confirm: true, // Mark as confirmed immediately since we're sending our own verification
      });
      
      if (updateError) {
        logStep("Error updating user email - full error", { 
          message: updateError.message, 
          name: updateError.name,
          status: (updateError as any).status,
          code: (updateError as any).code,
          full: JSON.stringify(updateError)
        });
        throw new Error(`E-Mail konnte nicht geändert werden: ${updateError.message}`);
      }
      
      logStep("Email updated successfully via Admin API");
      
      // Generate a magic link for the user to log in with their new email
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: new_email,
        options: {
          redirectTo: `${baseUrl}/dashboard`,
        },
      });
      
      if (linkError) {
        logStep("Error generating login link", { error: linkError.message });
        throw new Error(`Failed to generate login link: ${linkError.message}`);
      }
      
      if (linkData?.properties?.action_link) {
        confirmUrl = linkData.properties.action_link;
        logStep("Email change completed - magic link generated for new email");
        
        // Track successful email change
        await supabaseAdmin.from('email_change_tracking').insert({
          user_id: targetUser.id,
          change_type: 'email_change',
          old_email: email,
          new_email: new_email,
        });
        logStep("Email change tracked for rate limiting");
      } else {
        throw new Error("No action link returned from generateLink");
      }
    } else if (token_hash) {
      // Use token_hash for PKCE flow (magic_link)
      const params = new URLSearchParams({
        token_hash,
        type,
        next: redirect_to || '/dashboard'
      });
      confirmUrl = `${baseUrl}/auth/confirm?${params.toString()}`;
    } else if (token) {
      // Legacy token flow
      confirmUrl = `${baseUrl}/auth/confirm?token=${token}&type=${type}`;
    }
    
    logStep("Confirmation URL ready", { type });

    // Determine which email address to send to
    const recipientEmail = type === 'email_change' && new_email ? new_email : email;

    const emailContent = getEmailContent(type, recipientEmail, confirmUrl, firstName, language || 'de');
    
    const response = await fetch("https://api.lettermint.co/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lettermint-token": lettermintKey,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        from: "TradeNot.es <noreply@tradenot.es>",
        to: [recipientEmail],
        subject: emailContent.subject,
        html: emailContent.html,
        tag: `auth-${type}`,
        metadata: {
          type,
          language: language || 'de',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logStep("Lettermint API error", { status: response.status, error: errorText });
      throw new Error(`Lettermint API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    logStep("Auth email sent successfully", { type, messageId: result.message_id });

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: result.message_id,
      type 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-auth-email", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
