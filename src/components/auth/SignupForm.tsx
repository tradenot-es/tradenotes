import { useState } from "react";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/auth";
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
  const [nickname, setNickname] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [altchaPayload, setAltchaPayload] = useState<string | null>(null);
  // bumped to remount the captcha after a failed attempt (each solution is single-use)
  const [captchaRound, setCaptchaRound] = useState(0);

  const signupSchema = z.object({
    email: z.string()
      .email({ message: t("validation.emailInvalid") })
      .max(255, { message: t("validation.emailTooLong") }),
    password: z.string()
      .min(8, { message: t("validation.passwordMin") })
      .regex(/[A-Z]/, { message: t("validation.passwordUppercase") })
      .regex(/[0-9]/, { message: t("validation.passwordNumber") }),
    nickname: z.string().trim().max(40, { message: t("validation.nicknameTooLong") }),
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
      toast.error(t("auth.captchaRequired"));
      return;
    }

    // Validate input
    const validation = signupSchema.safeParse({ email, password, nickname });
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
      // Creates the account; the server checks the captcha and sends the confirmation email
      const { error } = await auth.signUp({
        email,
        password,
        nickname: nickname.trim(),
        altcha: altchaPayload,
      });

      if (error) {
        setAltchaPayload(null);
        setCaptchaRound((r) => r + 1);
        throw error;
      }

      toast.success(t("auth.signupSuccess"));
      toast.info(t("auth.checkEmail"));

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
      <div className="space-y-2">
        <Label htmlFor="nickname">
          {t("auth.nickname")} <span className="text-muted-foreground text-xs">({t("trades.optional")})</span>
        </Label>
        <Input
          id="nickname"
          type="text"
          placeholder={t("auth.nicknamePlaceholder")}
          value={nickname}
          maxLength={40}
          autoComplete="nickname"
          onChange={(e) => {
            setNickname(e.target.value);
            setErrors({ ...errors, nickname: "" });
          }}
        />
        <p className="text-xs text-muted-foreground">{t("auth.nicknameHint")}</p>
        {errors.nickname && <p className="text-sm text-destructive">{errors.nickname}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("contact.emailPlaceholder")}
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
        key={captchaRound}
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
