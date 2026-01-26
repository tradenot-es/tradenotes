import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";
import { AltchaWidget } from "@/components/AltchaWidget";
import { Link } from "react-router-dom";

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export const SignupForm = ({ onSuccess, onSwitchToLogin }: SignupFormProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);

  const signupSchema = z.object({
    email: z.string()
      .email({ message: t("validation.emailInvalid") })
      .max(255, { message: t("validation.emailTooLong") }),
    password: z.string()
      .min(8, { message: t("validation.passwordMin") })
      .regex(/[A-Z]/, { message: t("validation.passwordUppercase") })
      .regex(/[0-9]/, { message: t("validation.passwordNumber") }),
    firstName: z.string().min(1, { message: t("validation.required") }),
    lastName: z.string().min(1, { message: t("validation.required") }),
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: t("validation.passwordMismatch") });
      return;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      setErrors({ terms: t("validation.termsRequired") });
      return;
    }

    // Validate ALTCHA
    if (!altchaPayload) {
      toast.error(t("auth.captchaRequired") || "Bitte bestätigen Sie, dass Sie kein Roboter sind.");
      return;
    }

    // Validate input
    const validation = signupSchema.safeParse({ email, password, firstName, lastName });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create user with Supabase Auth (email confirmation disabled - we handle it manually)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          // Don't use Supabase's default email confirmation
          emailRedirectTo: undefined,
        },
      });

      if (authError) throw authError;

      // Step 2: Send confirmation email via Lettermint
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email,
          type: 'signup',
          firstName,
          language: navigator.language.startsWith('de') ? 'de' : 'en',
          altcha_payload: altchaPayload,
        },
      });

      if (error) {
        console.error('Failed to send confirmation email:', error);
        // User was created but email failed - still show success but with note
        toast.success(t("auth.signupSuccess"));
        toast.info(t("auth.emailMayBeDelayed") || "Die Bestätigungs-E-Mail kann etwas verzögert ankommen.");
      } else if (data?.error) {
        console.error('Email service error:', data.error);
        toast.success(t("auth.signupSuccess"));
      } else {
        toast.success(t("auth.signupSuccess"));
        toast.info(t("auth.checkEmail") || "Bitte überprüfe deine E-Mails zur Bestätigung.");
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("auth.firstName")}</Label>
          <Input
            id="firstName"
            type="text"
            placeholder="Max"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setErrors({ ...errors, firstName: "" });
            }}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">{errors.firstName}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t("auth.lastName")}</Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Mustermann"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setErrors({ ...errors, lastName: "" });
            }}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors({ ...errors, email: "" });
          }}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: "" });
          }}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setErrors({ ...errors, confirmPassword: "" });
          }}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => {
            setAcceptTerms(checked === true);
            setErrors({ ...errors, terms: "" });
          }}
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground leading-tight cursor-pointer"
        >
          {t("auth.acceptTerms")}{" "}
          <Link to="/agb" className="text-primary hover:underline">
            {t("auth.termsLink")}
          </Link>{" "}
          {t("auth.and")}{" "}
          <Link to="/datenschutz" className="text-primary hover:underline">
            {t("auth.privacyLink")}
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-destructive">{errors.terms}</p>
      )}

      <AltchaWidget 
        onVerified={setAltchaPayload}
        onError={() => setAltchaPayload(null)}
      />

      <Button type="submit" className="w-full" disabled={loading || !altchaPayload}>
        {loading ? t("auth.loading") : t("auth.signup")}
      </Button>

      {onSwitchToLogin && (
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={onSwitchToLogin}
          >
            {t("auth.alreadyHaveAccount")}
          </button>
        </div>
      )}
    </form>
  );
};
