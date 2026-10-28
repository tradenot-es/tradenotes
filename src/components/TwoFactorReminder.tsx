import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/api";

type Reminder = "new" | "later" | "dismissed";
const QUERY_KEY = ["user-settings", "two_factor_reminder"];

function useReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data } = await db.from("user_settings").select("two_factor_reminder").maybeSingle();
      return (data?.two_factor_reminder as Reminder | undefined) ?? "dismissed";
    },
    enabled: !!user && !user.twoFactorEnabled,
  });
  const set = async (value: Reminder) => {
    queryClient.setQueryData(QUERY_KEY, value);
    await db.from("user_settings").update({ two_factor_reminder: value }).eq("user_id", user!.id);
  };
  // nothing to remind of once two-factor login is on
  return { state: user?.twoFactorEnabled ? "dismissed" : data, set };
}

const goToSecurity = (navigate: ReturnType<typeof useNavigate>) => navigate("/dashboard/account#security");

/** Shown once after the first login: recommends turning on two-factor login. */
export function TwoFactorDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, set } = useReminder();
  const [open, setOpen] = useState(true);
  if (state !== "new") return null;

  const later = () => {
    setOpen(false);
    set("later");
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && later()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t("twoFactorReminder.title")}
          </DialogTitle>
          <DialogDescription>{t("twoFactorReminder.description")}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={later}>
            {t("twoFactorReminder.later")}
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              set("later");
              goToSecurity(navigate);
            }}
          >
            {t("twoFactorReminder.setUp")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Hint on the dashboard after "later", until two-factor login is on or the hint is dismissed. */
export function TwoFactorBanner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, set } = useReminder();
  if (state !== "later") return null;
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm">{t("twoFactorReminder.banner")}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => goToSecurity(navigate)}>
          {t("twoFactorReminder.setUp")}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => set("dismissed")} aria-label={t("twoFactorReminder.dismiss")}>
          <X className="h-4 w-4 mr-1" />
          {t("twoFactorReminder.dismiss")}
        </Button>
      </div>
    </div>
  );
}
