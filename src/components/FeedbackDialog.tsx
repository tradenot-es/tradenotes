import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Bug, Lightbulb, MessageSquare, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";
import { deviceTimeZone } from "@/lib/timezone";
import { cn } from "@/lib/utils";
import { instance } from "@/config/instance";
import { project } from "@/config/project";

type FeedbackType = "bug" | "idea" | "other";

const TYPES: { type: FeedbackType; icon: typeof Bug }[] = [
  { type: "bug", icon: Bug },
  { type: "idea", icon: Lightbulb },
  { type: "other", icon: MessageSquare },
];

/** "Bug or idea?": goes to the server, which mails it to us and files it as a GitHub issue. */
export function FeedbackDialog({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("idea");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [withContext, setWithContext] = useState(true);
  const [sending, setSending] = useState(false);

  const valid = title.trim().length >= 3 && message.trim().length >= 10;

  const send = async () => {
    if (!valid) return;
    setSending(true);
    const context = withContext
      ? {
          path: location.pathname,
          language: i18n.language,
          timeZone: deviceTimeZone(),
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          userAgent: navigator.userAgent.slice(0, 400),
        }
      : undefined;
    const { error } = await apiFetch("/api/feedback", { method: "POST", json: { type, title, message, context } });
    setSending(false);
    if (error) {
      toast.error(error.status === 429 ? t("feedback.tooMany") : t("feedback.error"));
      return;
    }
    toast.success(t("feedback.thanks"));
    setTitle("");
    setMessage("");
    setOpen(false);
  };

  // self-hosted: no feedback mail to tradenot.es; bugs and ideas go to the project's GitHub issues
  if (instance.selfHosted) {
    return (
      <Button variant="ghost" className={cn("w-full justify-start", className)} asChild>
        <a href={project.issuesUrl} target="_blank" rel="noopener noreferrer">
          <MessageSquarePlus className="h-4 w-4 mr-3" />
          {t("feedback.button")}
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={cn("w-full justify-start", className)}>
          <MessageSquarePlus className="h-4 w-4 mr-3" />
          {t("feedback.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("feedback.title")}</DialogTitle>
          <DialogDescription>{t("feedback.description")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t("feedback.typeLabel")}>
          {TYPES.map(({ type: value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={type === value}
              onClick={() => setType(value)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
                type === value ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:bg-accent",
              )}
            >
              <Icon className={cn("h-5 w-5", type === value && "text-primary")} />
              {t(`feedback.types.${value}`)}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback-title">{t("feedback.titleLabel")}</Label>
          <Input
            id="feedback-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder={t(`feedback.titlePlaceholder.${type}`)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="feedback-message">{t("feedback.messageLabel")}</Label>
          <Textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={4000}
            rows={6}
            placeholder={t(`feedback.messagePlaceholder.${type}`)}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={withContext} onCheckedChange={(v) => setWithContext(v === true)} className="mt-0.5" />
          {t("feedback.includeContext")}
        </label>
        <p className="text-xs text-muted-foreground">{t("feedback.privacyNote")}</p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={send} disabled={!valid || sending}>
            {sending ? t("feedback.sending") : t("feedback.send")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
