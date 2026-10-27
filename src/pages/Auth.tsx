import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/tradenotes-logo-optimized.webp";
import { AltchaWidget } from "@/components/AltchaWidget";
import { SignupForm } from "@/components/auth/SignupForm";
import { ArrowLeft } from "lucide-react";

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isPasswordReset = searchParams.get("reset") === "true";
  // set by the server's reset link; it redirects with "error=INVALID_TOKEN" instead when the link is expired or used
  const resetToken = searchParams.get("token");
  const [mode, setMode] = useState<"login" | "signup">(searchParams.get("mode") === "signup" ? "signup" : "login");
  const [twoFactorStep, setTwoFactorStep] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  // bumped to remount the captcha after a failed attempt (each solution is single-use)
  const [captchaRound, setCaptchaRound] = useState(0);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotPasswordAltchaPayload, setForgotPasswordAltchaPayload] = useState<string | null>(null);
  const navigate = useNavigate();

  const authSchema = z.object({
    email: z.string()
      .email({ message: t("validation.emailInvalid") })
      .max(255, { message: t("validation.emailTooLong") }),
    password: z.string()
      .min(8, { message: t("validation.passwordMin") })
      .regex(/[A-Z]/, { message: t("validation.passwordUppercase") })
      .regex(/[0-9]/, { message: t("validation.passwordNumber") })
  });

  useEffect(() => {
    auth.getSession().then((session) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setUnverifiedEmail(null);

    // Validate input
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error, twoFactorRequired } = await auth.signIn(email, password);
      if (error) {
        if (error.code === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(email);
          return;
        }
        throw error;
      }
      if (twoFactorRequired) {
        setTwoFactorStep(true);
        return;
      }
      toast.success(t("auth.loginSuccess"));
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await auth.verifyTotp(totpCode.trim());
      if (error) throw new Error(t("settings.mfaVerifyError"));
      toast.success(t("auth.loginSuccess"));
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
      setTotpCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    const { error } = await auth.resendVerification(unverifiedEmail);
    if (error) toast.error(error.message || t("auth.error"));
    else toast.success(t("auth.verificationResent"));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: t("validation.emailInvalid") });
      return;
    }

    // Verify ALTCHA for password reset
    if (!forgotPasswordAltchaPayload) {
      toast.error(t("auth.captchaRequired") || "Bitte bestätigen Sie, dass Sie kein Roboter sind.");
      return;
    }
    
    setLoading(true);

    try {
      // the server checks the captcha and mails a reset link (if the address has an account)
      const { error } = await auth.requestPasswordReset(email, forgotPasswordAltchaPayload);

      if (error) {
        setForgotPasswordAltchaPayload(null);
        setCaptchaRound((r) => r + 1);
        throw new Error(error.message || t("auth.error"));
      }

      toast.success(t("auth.resetEmailSent"));
      setShowForgotPassword(false);
      setForgotPasswordAltchaPayload(null);
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.passwordMismatch"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("validation.passwordMin"));
      return;
    }
    
    setLoading(true);
    try {
      if (!resetToken) throw new Error(t("auth.resetLinkInvalid"));
      const { error } = await auth.resetPassword(resetToken, newPassword);
      if (error) throw new Error(error.code === "INVALID_TOKEN" ? t("auth.resetLinkInvalid") : error.message);
      // all sessions are revoked on reset, so log in again with the new password
      toast.success(t("auth.passwordUpdated"));
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  // Password Reset View
  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center mb-2">
            <Link to="/" aria-label="TradeNotes Home">
              <img 
                src={logo} 
                alt="TradeNotes" 
                width={224}
                height={224}
                className="h-56 w-auto mb-4 drop-shadow-[0_0_25px_hsl(158,100%,45%,0.5)] hover:scale-105 transition-transform cursor-pointer hue-rotate-[30deg] brightness-110" 
              />
            </Link>
            <p className="text-muted-foreground text-sm">{t("auth.slogan")}</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("auth.resetPassword")}</CardTitle>
              <CardDescription>{t("auth.resetPasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("settings.newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("auth.loading") : t("auth.resetPassword")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Forgot Password View
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center mb-2">
            <Link to="/" aria-label="TradeNotes Home">
              <img 
                src={logo} 
                alt="TradeNotes" 
                width={224}
                height={224}
                className="h-56 w-auto mb-4 drop-shadow-[0_0_25px_hsl(158,100%,45%,0.5)] hover:scale-105 transition-transform cursor-pointer hue-rotate-[30deg] brightness-110" 
              />
            </Link>
            <p className="text-muted-foreground text-sm">{t("auth.slogan")}</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>{t("auth.forgotPassword")}</CardTitle>
              <CardDescription>{t("auth.forgotPasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: undefined });
                    }}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <AltchaWidget 
                  key={captchaRound}
                  onVerified={setForgotPasswordAltchaPayload}
                  onError={() => setForgotPasswordAltchaPayload(null)}
                />
                
                <Button type="submit" className="w-full" disabled={loading || !forgotPasswordAltchaPayload}>
                  {loading ? t("auth.loading") : t("auth.sendResetEmail")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowForgotPassword(false)}
                >
                  {t("auth.backToLogin")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Slogan */}
        <div className="flex flex-col items-center mb-2">
          <Link to="/" aria-label="TradeNotes Home">
            <img 
              src={logo} 
              alt="TradeNotes" 
              width={224}
              height={224}
              className="h-56 w-auto mb-4 drop-shadow-[0_0_25px_hsl(158,100%,45%,0.5)] hover:scale-105 transition-transform cursor-pointer hue-rotate-[30deg] brightness-110" 
            />
          </Link>
          <p className="text-muted-foreground text-sm">{t("auth.slogan")}</p>
        </div>
        
        {mode === "signup" ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("auth.register")}</CardTitle>
              <CardDescription>{t("auth.registerDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <SignupForm onSuccess={() => setMode("login")} onSwitchToLogin={() => setMode("login")} />
            </CardContent>
          </Card>
        ) : twoFactorStep ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.twoFactor")}</CardTitle>
              <CardDescription>{t("settings.enterCode")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTotp} className="space-y-4">
                <Input
                  id="totp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  placeholder="123456"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                />
                <Button type="submit" className="w-full" disabled={loading || totpCode.length !== 6}>
                  {loading ? t("auth.loading") : t("auth.login")}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={() => setTwoFactorStep(false)}>
                  {t("auth.backToLogin")}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("auth.login")}</CardTitle>
            <CardDescription>{t("auth.loginDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {searchParams.get("error") === "INVALID_TOKEN" && (
              <p className="mb-4 text-sm text-destructive">{t("auth.resetLinkInvalid")}</p>
            )}
            {unverifiedEmail && (
              <div className="mb-4 rounded-md border border-border p-3 text-sm">
                <p className="text-muted-foreground">{t("auth.emailNotVerified")}</p>
                <button type="button" className="mt-1 text-primary hover:underline" onClick={handleResendVerification}>
                  {t("auth.resendVerification")}
                </button>
              </div>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors({ ...errors, email: undefined });
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
                    setErrors({ ...errors, password: undefined });
                  }}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>
              
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                {t("auth.forgotPassword")}
              </button>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.loading") : t("auth.login")}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-border text-center">
              <button type="button" className="text-sm text-primary hover:underline" onClick={() => setMode("signup")}>
                {t("auth.noAccount")}
              </button>
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  );
};

export default Auth;
