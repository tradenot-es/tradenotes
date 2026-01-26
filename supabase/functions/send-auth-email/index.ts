import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const body: AuthEmailRequest = await req.json();
    const { email, type, token, token_hash, redirect_to, firstName, language } = body;
    
    if (!email || !type) {
      throw new Error("Missing required fields: email and type");
    }
    logStep("Request parsed", { email: email.substring(0, 3) + "***", type, language });

    // Build confirmation URL
    const baseUrl = getBaseUrl();
    let confirmUrl = redirect_to || baseUrl;
    
    if (token_hash) {
      // Use token_hash for PKCE flow
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
    
    logStep("Confirmation URL built", { type });

    const emailContent = getEmailContent(type, email, confirmUrl, firstName, language || 'de');
    
    const response = await fetch("https://api.lettermint.co/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-lettermint-token": lettermintKey,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        from: "TradeNot.es <noreply@tradenot.es>",
        to: [email],
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
