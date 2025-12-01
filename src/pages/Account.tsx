import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Mail, ShieldCheck, QrCode, HelpCircle, CreditCard, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const Account = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Account states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  
  // 2FA states
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [verifyCode, setVerifyCode] = useState("");
  const [showQRDialog, setShowQRDialog] = useState(false);
  
  // Subscription states
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    subscribed: boolean;
    plan_name?: string;
    subscription_end?: string;
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Reset states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      loadProfile();
      checkMFAStatus();
      checkSubscriptionStatus();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    setLoadingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionStatus(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error("Fehler beim Laden des Abonnement-Status");
    } finally {
      setLoadingSubscription(false);
    }
  };

  const checkMFAStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactor = data?.totp?.find(f => f.status === 'verified');
      setMfaEnabled(!!totpFactor);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };

  const calculatePasswordStrength = (password: string): "weak" | "medium" | "strong" | null => {
    if (!password) return null;
    
    let strength = 0;
    
    // Length check
    if (password.length >= 10) strength += 1;
    if (password.length >= 14) strength += 1;
    
    // Character diversity
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    if (strength <= 2) return "weak";
    if (strength <= 4) return "medium";
    return "strong";
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    setPasswordStrength(calculatePasswordStrength(value));
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          first_name: firstName,
          last_name: lastName,
        });
      
      if (error) throw error;
      toast.success(t("settings.profileUpdated"));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success(t("settings.emailUpdateSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("settings.emailUpdateError"));
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.passwordMismatch"));
      return;
    }
    if (newPassword.length < 10) {
      toast.error(t("settings.passwordTooShort"));
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(null);
      toast.success(t("settings.passwordUpdateSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("settings.passwordUpdateError"));
    }
  };

  const handleEnableMFA = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      
      setTotpSecret(data.totp.secret);
      setQrCode(data.totp.qr_code);
      setShowQRDialog(true);
    } catch (error: any) {
      toast.error(error.message || t("settings.mfaEnableError"));
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyMFA = async () => {
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.data?.totp?.[0]) {
        const factorId = factors.data.totp[0].id;
        const { error } = await supabase.auth.mfa.challengeAndVerify({
          factorId,
          code: verifyCode
        });
        
        if (error) throw error;
        
        setMfaEnabled(true);
        setShowQRDialog(false);
        setVerifyCode("");
        toast.success(t("settings.mfaEnabled"));
      }
    } catch (error: any) {
      toast.error(error.message || t("settings.mfaVerifyError"));
    }
  };

  const handleDisableMFA = async () => {
    try {
      const { data } = await supabase.auth.mfa.listFactors();
      const factor = data?.totp?.find(f => f.status === 'verified');
      
      if (factor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (error) throw error;
        
        setMfaEnabled(false);
        toast.success(t("settings.mfaDisabled"));
      }
    } catch (error: any) {
      toast.error(error.message || t("settings.mfaDisableError"));
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Öffnen des Kundenportals");
    }
  };

  const handleResetAllData = async () => {
    if (!resetConfirmed) {
      toast.error(t("account.mustConfirmReset"));
      return;
    }
    if (!resetPassword) {
      toast.error(t("account.passwordRequired"));
      return;
    }

    setResetting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('reset-user-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { password: resetPassword },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error === "Incorrect password") {
          toast.error(t("account.incorrectPassword"));
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast.success(t("account.resetSuccess"));
      setShowResetDialog(false);
      setResetPassword("");
      setResetConfirmed(false);
      
      // Reload page to reflect changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error(t("account.resetError"));
    } finally {
      setResetting(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("account.title")}</h1>
          <p className="text-muted-foreground">{t("account.subtitle")}</p>
        </div>

        <div className="grid gap-6">
          {/* Account Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t("account.accountInfo")}
              </CardTitle>
              <CardDescription>{t("account.accountInfoDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("settings.firstNamePlaceholder")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t("settings.lastNamePlaceholder")}
                  />
                </div>
              </div>
              <Button onClick={handleUpdateProfile} className="w-full">
                <User className="h-4 w-4 mr-2" />
                {t("settings.updateProfile")}
              </Button>

              <div className="border-t pt-6" />

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="email" className="text-base">{t("settings.email")}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.emailHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleUpdateEmail}>
                    <Mail className="h-4 w-4 mr-2" />
                    {t("settings.updateEmail")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("account.subscription")}
              </CardTitle>
              <CardDescription>{t("account.subscriptionDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSubscription ? (
                <div className="text-center py-4 text-muted-foreground">{t("account.loadingSubscription")}</div>
              ) : subscriptionStatus?.subscribed ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{t("account.activeSubscription")}</p>
                      {subscriptionStatus.plan_name && (
                        <p className="text-sm text-muted-foreground">{t("account.plan")}: {subscriptionStatus.plan_name}</p>
                      )}
                      {subscriptionStatus.subscription_end && (
                        <p className="text-sm text-muted-foreground">
                          {t("account.validUntil")}: {format(new Date(subscriptionStatus.subscription_end), "dd. MMMM yyyy", { locale: de })}
                        </p>
                      )}
                      <div className="pt-2 border-t border-green-500/20">
                        <p className="text-sm font-medium text-green-600">{t("account.allFeaturesUnlocked")}</p>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleManageSubscription} className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    {t("account.manageSubscription")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <XCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-medium text-blue-600">{t("account.trialActive")}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t("account.trialDescription")}
                        </p>
                      </div>
                      
                      <div className="pt-2 border-t border-blue-500/20">
                        <p className="text-sm font-medium mb-2">{t("account.availablePlans")}</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• {t("account.monthlyPlan")}</li>
                          <li>• {t("account.yearlyPlan")}</li>
                        </ul>
                      </div>

                      <div className="pt-2 border-t border-blue-500/20">
                        <p className="text-sm font-medium mb-2">{t("account.trialLimitations")}</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span>{t("account.limitationAI")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span>{t("account.limitationMetrics")}</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{t("account.allOtherFeatures")}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("settings.security")}
              </CardTitle>
              <CardDescription>{t("settings.securityDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="newPassword" className="text-base">{t("settings.newPassword")}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.passwordHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder={t("settings.newPasswordPlaceholder")}
                />
                {passwordStrength && (
                  <div className="space-y-1">
                    <div className="flex gap-1 h-1">
                      <div className={`flex-1 rounded ${passwordStrength === "weak" ? "bg-destructive" : passwordStrength === "medium" ? "bg-orange-500" : "bg-green-500"}`} />
                      <div className={`flex-1 rounded ${passwordStrength === "medium" || passwordStrength === "strong" ? passwordStrength === "medium" ? "bg-orange-500" : "bg-green-500" : "bg-muted"}`} />
                      <div className={`flex-1 rounded ${passwordStrength === "strong" ? "bg-green-500" : "bg-muted"}`} />
                    </div>
                    <p className={`text-xs ${passwordStrength === "weak" ? "text-destructive" : passwordStrength === "medium" ? "text-orange-500" : "text-green-500"}`}>
                      {t(`settings.passwordStrength.${passwordStrength}`)}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("settings.confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("settings.confirmPasswordPlaceholder")}
                />
              </div>
              <Button onClick={handleUpdatePassword} className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                {t("settings.updatePassword")}
              </Button>
              
              {/* 2FA */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Label htmlFor="mfa" className="text-base">
                    {t("settings.twoFactor")}
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{t("settings.twoFactorHelp")}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  {mfaEnabled && <ShieldCheck className="h-5 w-5 text-green-500" />}
                  <Button
                    variant={mfaEnabled ? "destructive" : "default"}
                    onClick={mfaEnabled ? handleDisableMFA : handleEnableMFA}
                    disabled={enrolling}
                  >
                    {mfaEnabled ? t("settings.disable2FA") : t("settings.enable2FA")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t("account.dangerZone")}
              </CardTitle>
              <CardDescription>{t("account.dangerZoneDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-destructive">{t("account.resetAll")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("account.resetAllDesc")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowResetDialog(true)}
                  className="w-full"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {t("account.resetAll")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {t("account.resetConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-2">
                <p className="text-destructive font-medium">
                  {t("account.resetConfirmDesc")}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t("account.resetItemTrades")}</li>
                  <li>{t("account.resetItemJournal")}</li>
                  <li>{t("account.resetItemPrep")}</li>
                  <li>{t("account.resetItemStats")}</li>
                  <li>{t("account.resetItemExecutions")}</li>
                </ul>
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <Checkbox 
                    id="confirm-reset" 
                    checked={resetConfirmed}
                    onCheckedChange={(checked) => setResetConfirmed(checked === true)}
                  />
                  <label htmlFor="confirm-reset" className="text-sm cursor-pointer">
                    {t("account.resetConfirmCheckbox")}
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-password">{t("account.enterPasswordToConfirm")}</Label>
                  <Input
                    id="reset-password"
                    type="password"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder={t("auth.password")}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setResetPassword("");
                setResetConfirmed(false);
              }}>
                {t("trades.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetAllData}
                disabled={!resetConfirmed || !resetPassword || resetting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {resetting ? t("account.resetting") : t("account.deleteForever")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 2FA QR Code Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                {t("settings.scanQRCode")}
              </DialogTitle>
              <DialogDescription>{t("settings.scanQRCodeDesc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
              )}
              <div className="space-y-2">
                <Label>{t("settings.manualCode")}</Label>
                <code className="block p-3 bg-muted rounded text-sm break-all">
                  {totpSecret}
                </code>
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-code">{t("settings.enterCode")}</Label>
                <Input
                  id="verify-code"
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerifyMFA} className="w-full">
                {t("settings.verify")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Account;
