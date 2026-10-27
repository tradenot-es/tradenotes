import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Mail, ShieldCheck, QrCode, HelpCircle, CreditCard, CheckCircle, XCircle, AlertTriangle, Trophy, Trash2 } from "lucide-react";
import { AchievementsOverview } from "@/components/AchievementsOverview";
import { toast } from "sonner";
import { apiFetch, db } from "@/lib/api";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { PageHeader } from "@/components/PageHeader";
import { z } from "zod";

const Account = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Account states
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
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
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  // enabling and disabling 2FA both ask for the password first
  const [mfaPasswordAction, setMfaPasswordAction] = useState<"enable" | "disable" | null>(null);
  const [mfaPassword, setMfaPassword] = useState("");
  
  // Reset states
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmed, setResetConfirmed] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Delete account states
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [deleteAccountConfirmed, setDeleteAccountConfirmed] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteAccountSuccess, setDeleteAccountSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      loadProfile();
      setMfaEnabled(!!user.twoFactorEnabled);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await db
        .from('profiles')
        .select('first_name, last_name')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      }
    } catch (error) {
      console.error('Error loading profile:', error);
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
    // Validate first name is required
    const profileSchema = z.object({
      firstName: z.string()
        .trim()
        .min(1, { message: t("validation.firstNameRequired") })
        .max(50, { message: t("validation.firstNameTooLong") }),
      lastName: z.string()
        .trim()
        .max(50, { message: t("validation.lastNameTooLong") })
        .optional(),
    });

    const validation = profileSchema.safeParse({ 
      firstName: firstName.trim(), 
      lastName: lastName.trim() || undefined 
    });
    
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    try {
      const { error } = await db
        .from('profiles')
        .upsert({
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
        });
      
      if (error) throw error;
      toast.success(t("settings.profileUpdated"));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateEmail = async () => {
    if (!user?.email || email === user.email) {
      toast.error("Bitte gib eine neue E-Mail-Adresse ein");
      return;
    }
    
    // Better Auth mails a confirmation link to the current address first,
    // then a verification link to the new one
    const { error } = await auth.changeEmail(email.trim());
    if (error) {
      toast.error(error.message || t("settings.emailUpdateError"));
      return;
    }
    toast.success(t("settings.emailChangeSent"));
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
    if (!currentPassword) {
      toast.error(t("account.passwordRequired"));
      return;
    }
    try {
      const { error } = await auth.changePassword(currentPassword, newPassword);
      if (error) throw new Error(error.code === "INVALID_PASSWORD" ? t("account.incorrectPassword") : error.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStrength(null);
      toast.success(t("settings.passwordUpdateSuccess"));
    } catch (error: any) {
      toast.error(error.message || t("settings.passwordUpdateError"));
    }
  };

  const handleEnableMFA = () => {
    setMfaPassword("");
    setMfaPasswordAction("enable");
  };

  const handleDisableMFA = () => {
    setMfaPassword("");
    setMfaPasswordAction("disable");
  };

  const handleMfaPasswordConfirm = async () => {
    const action = mfaPasswordAction;
    setEnrolling(true);
    try {
      if (action === "enable") {
        const { data, error } = await auth.twoFactor.enable(mfaPassword);
        if (error || !data) throw new Error(error?.code === "INVALID_PASSWORD" ? t("account.incorrectPassword") : t("settings.mfaEnableError"));
        setTotpSecret(new URL(data.totpURI).searchParams.get("secret") ?? "");
        setQrCode(await QRCode.toDataURL(data.totpURI, { width: 256, margin: 1 }));
        setBackupCodes(data.backupCodes);
        setMfaPasswordAction(null);
        setShowQRDialog(true);
      } else if (action === "disable") {
        const { error } = await auth.twoFactor.disable(mfaPassword);
        if (error) throw new Error(error.code === "INVALID_PASSWORD" ? t("account.incorrectPassword") : t("settings.mfaDisableError"));
        setMfaEnabled(false);
        setMfaPasswordAction(null);
        toast.success(t("settings.mfaDisabled"));
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEnrolling(false);
      setMfaPassword("");
    }
  };

  const handleVerifyMFA = async () => {
    // 2FA only becomes active once the first code from the app is verified
    const { error } = await auth.twoFactor.verify(verifyCode.trim());
    if (error) {
      toast.error(t("settings.mfaVerifyError"));
      return;
    }
    setMfaEnabled(true);
    setShowQRDialog(false);
    setVerifyCode("");
    setBackupCodes([]);
    toast.success(t("settings.mfaEnabled"));
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
      const { error } = await apiFetch('/api/account/reset', { method: 'POST', json: { password: resetPassword } });

      if (error) {
        if (error.status === 401) {
          toast.error(t("account.incorrectPassword"));
          return;
        }
        throw error;
      }

      // Show success screen
      setResetSuccess(true);
      setShowResetDialog(false);
      setResetPassword("");
      setResetConfirmed(false);
      
      // Reload page after showing success animation
      setTimeout(() => window.location.reload(), 2500);
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error(t("account.resetError"));
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccountConfirmed) {
      toast.error(t("account.mustConfirmReset"));
      return;
    }
    if (!deleteAccountPassword) {
      toast.error(t("account.passwordRequired"));
      return;
    }

    setDeletingAccount(true);
    try {
      // deletes the user; all journal data goes with it (foreign keys) and the session ends
      const { error } = await auth.deleteUser(deleteAccountPassword);

      if (error) {
        if (error.code === "INVALID_PASSWORD") {
          toast.error(t("account.incorrectPassword"));
          return;
        }
        throw error;
      }

      // Show success screen
      setDeleteAccountSuccess(true);
      setShowDeleteAccountDialog(false);
      setDeleteAccountPassword("");
      setDeleteAccountConfirmed(false);
      
      // Sign out and redirect to home after showing success animation
      setTimeout(() => {
        window.location.href = "/";
      }, 2500);
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(t("account.deleteAccountError"));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-6">
        <PageHeader
          title={t("account.title")}
          subtitle={t("account.subtitle")}
        />

        <div className="grid gap-6">
          {/* Achievements Section */}
          <AchievementsOverview />

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
                  <Label htmlFor="firstName">
                    {t("settings.firstName")} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t("settings.firstNamePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t("settings.lastName")} <span className="text-muted-foreground text-xs">({t("trades.optional")})</span>
                  </Label>
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
                <Label htmlFor="currentPassword">{t("settings.currentPassword")}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
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
            <CardContent className="space-y-6">
              {/* Reset All Data */}
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

              {/* Delete Account */}
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-destructive">{t("account.deleteAccount")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("account.deleteAccountDesc")}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteAccountDialog(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("account.deleteAccount")}
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
              {backupCodes.length > 0 && (
                <div className="space-y-2">
                  <Label>{t("settings.backupCodes")}</Label>
                  <p className="text-xs text-muted-foreground">{t("settings.backupCodesDesc")}</p>
                  <code className="grid grid-cols-2 gap-1 p-3 bg-muted rounded text-sm">
                    {backupCodes.map((code) => (
                      <span key={code}>{code}</span>
                    ))}
                  </code>
                </div>
              )}
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

        {/* Password prompt before enabling or disabling 2FA */}
        <Dialog open={mfaPasswordAction !== null} onOpenChange={(open) => !open && setMfaPasswordAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{mfaPasswordAction === "disable" ? t("settings.disable2FA") : t("settings.enable2FA")}</DialogTitle>
              <DialogDescription>{t("account.enterPasswordToConfirm")}</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleMfaPasswordConfirm();
              }}
            >
              <Input
                type="password"
                autoComplete="current-password"
                autoFocus
                value={mfaPassword}
                onChange={(e) => setMfaPassword(e.target.value)}
              />
              <Button type="submit" className="w-full" disabled={enrolling || !mfaPassword}>
                {mfaPasswordAction === "disable" ? t("settings.disable2FA") : t("settings.enable2FA")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Success Screen Dialog */}
        <Dialog open={resetSuccess} onOpenChange={setResetSuccess}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-green-500/10 border-2 border-green-500 rounded-full p-6 animate-scale-in">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>
              
              <div className="text-center space-y-2 animate-fade-in">
                <DialogTitle className="text-2xl font-bold text-green-600">
                  {t("account.resetSuccess")}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {t("account.resetSuccessMessage")}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span>{t("account.reloadingPage")}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                {t("account.deleteAccountConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-4 pt-2">
                <p className="text-destructive font-medium">
                  {t("account.deleteAccountConfirmDesc")}
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>{t("account.deleteAccountItemAll")}</li>
                  <li>{t("account.deleteAccountItemProfile")}</li>
                  <li>{t("account.deleteAccountItemAuth")}</li>
                  <li>{t("account.deleteAccountItemStorage")}</li>
                </ul>
                <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
                  <Checkbox 
                    id="confirm-delete-account" 
                    checked={deleteAccountConfirmed}
                    onCheckedChange={(checked) => setDeleteAccountConfirmed(checked === true)}
                  />
                  <label htmlFor="confirm-delete-account" className="text-sm cursor-pointer">
                    {t("account.deleteAccountConfirmCheckbox")}
                  </label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delete-account-password">{t("account.enterPasswordToConfirm")}</Label>
                  <Input
                    id="delete-account-password"
                    type="password"
                    value={deleteAccountPassword}
                    onChange={(e) => setDeleteAccountPassword(e.target.value)}
                    placeholder={t("auth.password")}
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setDeleteAccountPassword("");
                setDeleteAccountConfirmed(false);
              }}>
                {t("trades.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={!deleteAccountConfirmed || !deleteAccountPassword || deletingAccount}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deletingAccount ? t("account.deletingAccount") : t("account.deleteAccount")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Account Success Screen Dialog */}
        <Dialog open={deleteAccountSuccess} onOpenChange={setDeleteAccountSuccess}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-green-500/10 border-2 border-green-500 rounded-full p-6 animate-scale-in">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>
              
              <div className="text-center space-y-2 animate-fade-in">
                <DialogTitle className="text-2xl font-bold text-green-600">
                  {t("account.deleteAccountSuccess")}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {t("account.deleteAccountSuccessMessage")}
                </DialogDescription>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                <span>{t("account.reloadingPage")}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Account;
