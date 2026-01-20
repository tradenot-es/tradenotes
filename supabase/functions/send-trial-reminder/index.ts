import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRIAL-REMINDER] ${step}${detailsStr}`);
};

interface TrialReminderRequest {
  email: string;
  firstName?: string;
  daysRemaining: number;
  language?: string;
}

const getEmailContent = (firstName: string, daysRemaining: number, language: string = 'de') => {
  const name = firstName || 'Trader';
  
  const translations: Record<string, { subject: string; body: string }> = {
    de: {
      subject: `⏰ Nur noch ${daysRemaining} Tage in deiner TradeNot.es Testphase`,
      body: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">TradeNot.es</h1>
            <p style="color: #6b7280; font-size: 14px;">Dein professionelles Trading Journal</p>
          </div>
          
          <h2 style="color: #ffffff; margin-bottom: 20px;">Hallo ${name},</h2>
          
          <p style="color: #d1d5db; line-height: 1.6;">
            Deine <strong>14-tägige Testphase</strong> endet in <strong style="color: #f59e0b;">${daysRemaining} Tagen</strong>.
          </p>
          
          <p style="color: #d1d5db; line-height: 1.6;">
            Wir hoffen, dass dir TradeNot.es dabei hilft, dein Trading auf das nächste Level zu bringen. 
            Upgrade jetzt, um weiterhin alle Features zu nutzen:
          </p>
          
          <ul style="color: #d1d5db; line-height: 1.8;">
            <li>✓ Unbegrenzte Trade-Erfassung</li>
            <li>✓ KI-gestützter Trading-Assistent</li>
            <li>✓ Erweiterte Reports & Analysen</li>
            <li>✓ Performance-Tracking über alle Accounts</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://tradenot.es/dashboard/account" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Jetzt upgraden
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #374151; padding-top: 20px;">
            Du erhältst diese E-Mail, weil du dich bei TradeNot.es registriert hast.<br>
            <a href="https://tradenot.es" style="color: #10b981;">tradenot.es</a>
          </p>
        </div>
      `
    },
    en: {
      subject: `⏰ Only ${daysRemaining} days left in your TradeNot.es trial`,
      body: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0a0a; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">TradeNot.es</h1>
            <p style="color: #6b7280; font-size: 14px;">Your professional Trading Journal</p>
          </div>
          
          <h2 style="color: #ffffff; margin-bottom: 20px;">Hello ${name},</h2>
          
          <p style="color: #d1d5db; line-height: 1.6;">
            Your <strong>14-day trial</strong> ends in <strong style="color: #f59e0b;">${daysRemaining} days</strong>.
          </p>
          
          <p style="color: #d1d5db; line-height: 1.6;">
            We hope TradeNot.es is helping you take your trading to the next level. 
            Upgrade now to continue using all features:
          </p>
          
          <ul style="color: #d1d5db; line-height: 1.8;">
            <li>✓ Unlimited trade tracking</li>
            <li>✓ AI-powered Trading Assistant</li>
            <li>✓ Advanced Reports & Analytics</li>
            <li>✓ Performance tracking across all accounts</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://tradenot.es/dashboard/account" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Upgrade now
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 40px; border-top: 1px solid #374151; padding-top: 20px;">
            You received this email because you signed up for TradeNot.es.<br>
            <a href="https://tradenot.es" style="color: #10b981;">tradenot.es</a>
          </p>
        </div>
      `
    }
  };
  
  return translations[language] || translations['de'];
};

serve(async (req) => {
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

    const { email, firstName, daysRemaining, language }: TrialReminderRequest = await req.json();
    
    if (!email || daysRemaining === undefined) {
      throw new Error("Missing required fields: email and daysRemaining");
    }
    logStep("Request parsed", { email, daysRemaining, language });

    const emailContent = getEmailContent(firstName || '', daysRemaining, language || 'de');
    
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
        html: emailContent.body,
        tag: "trial-reminder",
        metadata: {
          days_remaining: daysRemaining.toString(),
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
    logStep("Email sent successfully", { messageId: result.message_id, status: result.status });

    return new Response(JSON.stringify({ 
      success: true, 
      message_id: result.message_id,
      status: result.status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-trial-reminder", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
