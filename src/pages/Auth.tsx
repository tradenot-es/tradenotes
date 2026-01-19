import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/tradenotes-logo-auth.png";

const Auth = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const isPasswordReset = searchParams.get("reset") === "true";
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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

    // Check terms acceptance for registration
    if (!isLogin && !acceptedTerms) {
      toast.error(t("auth.termsRequired"));
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(t("auth.loginSuccess"));
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast.success(t("auth.accountCreated"));
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message || t("auth.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: t("validation.emailInvalid") });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      toast.success(t("auth.resetEmailSent"));
      setShowForgotPassword(false);
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
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("auth.passwordUpdated"));
      navigate("/dashboard");
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
            <img src={logo} alt="TradeNotes" className="h-24 w-auto mb-4 drop-shadow-lg" />
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
            <img src={logo} alt="TradeNotes" className="h-24 w-auto mb-4 drop-shadow-lg" />
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
                <Button type="submit" className="w-full" disabled={loading}>
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
          <img src={logo} alt="TradeNotes" className="h-24 w-auto mb-4 drop-shadow-lg" />
          <p className="text-muted-foreground text-sm">{t("auth.slogan")}</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? t("auth.login") : t("auth.register")}</CardTitle>
            <CardDescription>
              {isLogin ? t("auth.loginDesc") : t("auth.registerDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
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
              
              {/* Forgot Password Link - only in login mode */}
              {isLogin && (
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setShowForgotPassword(true)}
                >
                  {t("auth.forgotPassword")}
                </button>
              )}
              
              {/* Terms Checkbox - only in register mode */}
              {!isLogin && (
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                    {t("auth.acceptTerms")}{" "}
                    <Link to="/agb" className="text-primary hover:underline">{t("auth.terms")}</Link>
                    {" "}{t("auth.and")}{" "}
                    <Link to="/datenschutz" className="text-primary hover:underline">{t("auth.privacy")}</Link>
                  </label>
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.loading") : isLogin ? t("auth.login") : t("auth.register")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
