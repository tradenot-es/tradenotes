import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AttentionCTA } from "@/components/AttentionCTA";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { AltchaWidget } from "@/components/AltchaWidget";
import { Loader2, CheckCircle2, AlertCircle, Wrench, LogIn } from "lucide-react";
import { invoke } from "@/lib/api";
import logo from "@/assets/logo.webp";

interface PreLaunchProps {
  mode: "prelaunch" | "maintenance";
}

const PreLaunch = ({ mode }: PreLaunchProps) => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorKey, setErrorKey] = useState<string>("");
  const [captchaPayload, setCaptchaPayload] = useState<string | null>(null);

  // SEO Meta Tags
  useEffect(() => {
    const title = mode === "maintenance" 
      ? t("prelaunch.maintenance.seoTitle", "TradeNot.es - Maintenance")
      : t("prelaunch.seo.title");
    const description = mode === "maintenance"
      ? t("prelaunch.maintenance.seoDescription", "TradeNot.es is currently undergoing maintenance.")
      : t("prelaunch.seo.description");

    document.title = title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Update OG tags
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", property);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    updateOgTag("og:title", title);
    updateOgTag("og:description", description);
    updateOgTag("og:type", "website");
    updateOgTag("og:url", "https://tradenot.es");
  }, [t, mode, i18n.language]);

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 255;
  };

  const handleCaptchaVerified = (payload: string) => {
    setCaptchaPayload(payload);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!validateEmail(trimmedEmail)) {
      setStatus("error");
      setErrorKey("prelaunch.errorEmail");
      return;
    }

    if (!captchaPayload) {
      setStatus("error");
      setErrorKey("prelaunch.errorCaptcha");
      return;
    }

    setIsLoading(true);
    setStatus("idle");

    try {
      const { data, error } = await invoke("join-waitlist", {
        body: { email: trimmedEmail, captcha: captchaPayload, language: i18n.language }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        setStatus("error");
        switch (data.error) {
          case "email_duplicate":
            setErrorKey("prelaunch.errorDuplicate");
            break;
          case "rate_limit_exceeded":
            setErrorKey("prelaunch.errorRateLimit");
            break;
          case "email_invalid":
            setErrorKey("prelaunch.errorEmail");
            break;
          default:
            setErrorKey("prelaunch.errorGeneric");
        }
        return;
      }

      setStatus("success");
      setEmail("");
      setCaptchaPayload(null);
    } catch (error) {
      console.error("Waitlist error:", error);
      setStatus("error");
      setErrorKey("prelaunch.errorGeneric");
    } finally {
      setIsLoading(false);
    }
  };

  const isMaintenance = mode === "maintenance";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Circuit Grid Background */}
      <div className="circuit-grid-bg absolute inset-0 pointer-events-none" />
      
      {/* Radial glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 30%, hsl(158 100% 45% / 0.08) 0%, transparent 50%)"
        }}
      />

      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        
        {/* Logo with Glow */}
        <div className="mb-8 relative">
          <img 
            src={logo} 
            alt="TradeNot.es" 
            width={112}
            height={112}
            fetchPriority="high"
            className="h-20 md:h-28 w-auto drop-shadow-[0_0_30px_hsl(158,100%,45%,0.4)]"
          />
        </div>

        {/* Badge */}
        <Badge 
          variant="outline" 
          className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/50 text-primary bg-primary/5 backdrop-blur-sm"
        >
          {isMaintenance ? (
            <span className="flex items-center gap-2">
              <Wrench className="h-3.5 w-3.5" />
              {t("prelaunch.maintenance.badge", "MAINTENANCE")}
            </span>
          ) : (
            t("prelaunch.badge")
          )}
        </Badge>

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-4 text-foreground">
          {isMaintenance 
            ? t("prelaunch.maintenance.headline")
            : t("prelaunch.headline")
          }
        </h1>

        {/* Subline */}
        <p className="text-muted-foreground text-center max-w-md mb-10 text-base md:text-lg">
          {isMaintenance 
            ? t("prelaunch.maintenance.subline")
            : t("prelaunch.subline")
          }
        </p>

        {/* Email Form Card - Only show in prelaunch mode */}
        {!isMaintenance && (
          <div className="glossy-card rounded-2xl p-6 md:p-8 w-full max-w-md mb-8">
            {status === "success" ? (
              <div className="flex flex-col items-center text-center py-4">
                <CheckCircle2 className="h-12 w-12 text-primary mb-4" />
                <p className="text-foreground font-medium">
                  {t("prelaunch.successMessage")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder={t("prelaunch.ctaPlaceholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    className="flex-1 h-12 bg-input/50 border-border/50 focus:border-primary"
                    disabled={isLoading}
                    required
                  />
                  <AttentionCTA>
                    <Button 
                      type="submit" 
                      size="lg"
                      className="h-12 px-6 whitespace-nowrap"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        t("prelaunch.ctaButton")
                      )}
                    </Button>
                  </AttentionCTA>
                </div>

                {/* ALTCHA Captcha */}
                <AltchaWidget 
                  onVerified={handleCaptchaVerified}
                  onError={() => setCaptchaPayload(null)}
                />

                {status === "error" && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t(errorKey)}</span>
                  </div>
                )}

                <p className="text-muted-foreground text-xs text-center">
                  {t("prelaunch.trustText")}
                </p>
              </form>
            )}
          </div>
        )}

        {/* Beta Login Link */}
        <Link to="/auth">
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            {t("prelaunch.betaLogin", "Beta Login")}
          </Button>
        </Link>

        {/* HUD Decorative Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-1/4 left-0 w-24 h-px bg-gradient-to-r from-primary/10 to-transparent hidden md:block" />
        <div className="absolute top-1/3 right-0 w-32 h-px bg-gradient-to-l from-primary/10 to-transparent hidden md:block" />
        <div className="absolute bottom-1/4 left-0 w-16 h-px bg-gradient-to-r from-primary/5 to-transparent hidden md:block" />
      </div>
    </div>
  );
};

export default PreLaunch;
