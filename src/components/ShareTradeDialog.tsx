import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Check, Copy, Link2Off, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api";
import { dateLocale } from "@/lib/dateLocale";

interface Share {
  token: string;
  show_note: boolean;
  view_count: number;
  last_viewed_at: string | null;
}

/** Mentor mode: a read-only link to one trade, e.g. for feedback from a mentor or trading buddy. */
export function ShareTradeDialog({ tradeId, symbol }: { tradeId: string; symbol: string }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [share, setShare] = useState<Share | null>(null);
  const [showNote, setShowNote] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = share ? `${window.location.origin}/share/${share.token}` : "";

  useEffect(() => {
    if (!open) return;
    apiFetch<{ share: Share | null }>(`/api/shares/${tradeId}`).then(({ data }) => {
      setShare(data?.share ?? null);
      if (data?.share) setShowNote(data.share.show_note);
    });
  }, [open, tradeId]);

  const save = async (note = showNote) => {
    setBusy(true);
    const { data, error } = await apiFetch<{ share: Share }>("/api/shares", { method: "POST", json: { tradeId, showNote: note } });
    setBusy(false);
    if (error) {
      toast.error(t("share.error"));
      return;
    }
    setShare(data.share);
  };

  const revoke = async () => {
    setBusy(true);
    await apiFetch(`/api/shares/${tradeId}`, { method: "DELETE" });
    setBusy(false);
    setShare(null);
    toast.success(t("share.revoked"));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} aria-label={t("share.button")}>
          <Share2 className="h-4 w-4" aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t("share.title", { symbol })}</DialogTitle>
          <DialogDescription>{t("share.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <Label htmlFor="share-note" className="text-sm">
              {t("share.showNote")}
            </Label>
            <Switch
              id="share-note"
              checked={showNote}
              disabled={busy}
              onCheckedChange={(v) => {
                setShowNote(v);
                if (share) save(v);
              }}
            />
          </div>

          {share ? (
            <>
              <div className="flex gap-2">
                <Input readOnly value={url} onFocus={(e) => e.target.select()} aria-label={t("share.link")} />
                <Button onClick={copy} size="icon" aria-label={t("share.copy")}>
                  {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {share.view_count > 0 && share.last_viewed_at
                  ? t("share.views", {
                      count: share.view_count,
                      time: formatDistanceToNow(new Date(share.last_viewed_at), { addSuffix: true, locale: dateLocale(i18n.language) }),
                    })
                  : t("share.noViews")}
              </p>
              <Button variant="outline" className="w-full" onClick={revoke} disabled={busy}>
                <Link2Off className="mr-2 h-4 w-4" aria-hidden />
                {t("share.revoke")}
              </Button>
            </>
          ) : (
            <Button className="w-full" onClick={() => save()} disabled={busy}>
              <Share2 className="mr-2 h-4 w-4" aria-hidden />
              {t("share.create")}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">{t("share.privacy")}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
