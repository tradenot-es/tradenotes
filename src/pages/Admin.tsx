import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { ExternalLink, Mail, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Stats {
  users: { total: number; verified: number; two_factor: number; new_7d: number; new_30d: number; d1: number; d7: number; d30: number; newsletter: number };
  signupsPerWeek: { week: string; signups: number }[];
  trades: { total: number; users: number; new_7d: number; with_screenshot: number; manual: number; bySource: { source: string; trades: number; users: number }[] };
  usage: { ibkrConnections: number; shares: number; shareViews: number; journalEntries: number };
  tech: {
    uploadsBytes: number;
    databaseBytes: number;
    mailQueuePending: number;
    mailSent24h: number;
    mailDailyLimit: number;
    smtpConfigured: boolean;
    marketEvents: { source: string; last_sync: string; events: number }[];
  };
  github:
    | null
    | { repo: string; error: string }
    | { repo: string; url: string; private: boolean; stars: number; forks: number; watchers: number; openIssues: number; feedbackOpen: number; feedbackTotal: number };
}

interface Campaign {
  id: string;
  kind: "service" | "newsletter";
  subject: string;
  created_at: string;
  total: number;
  sent: number;
  pending: number;
  failed: number;
}

const bytes = (n: number) => (n > 1e9 ? `${(n / 1e9).toFixed(1)} GB` : n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.round(n / 1e3)} kB`);

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border bg-background/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular mt-1 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Admin only (server checks ADMIN_EMAILS and, in production, 2FA): totals and mail to all users. */
const Admin = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const number = (n: number) => n.toLocaleString(i18n.language);
  const date = (iso: string) => new Date(iso).toLocaleString(i18n.language, { dateStyle: "short", timeStyle: "short" });

  const { data: stats, isError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data, error } = await apiFetch<Stats>("/api/admin/stats");
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });
  const { data: mail } = useQuery({
    queryKey: ["admin", "campaigns"],
    queryFn: async () => {
      const { data, error } = await apiFetch<{ campaigns: Campaign[]; recipients: Record<Campaign["kind"], number> }>("/api/admin/campaigns");
      if (error) throw error;
      return data;
    },
    refetchInterval: 30_000,
  });

  const [kind, setKind] = useState<Campaign["kind"]>("service");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ready = subject.trim().length > 0 && body.trim().length > 0;
  const recipients = mail?.recipients[kind] ?? 0;

  const sendTest = async () => {
    setBusy(true);
    const { error } = await apiFetch("/api/admin/campaigns/test", { method: "POST", json: { kind, subject, body } });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(t("admin.mail.testSent"));
  };

  const sendAll = async () => {
    setConfirm(false);
    setBusy(true);
    const { data, error } = await apiFetch<{ queued: number }>("/api/admin/campaigns", { method: "POST", json: { kind, subject, body } });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(t("admin.mail.queued", { count: data.queued }));
    setSubject("");
    setBody("");
    queryClient.invalidateQueries({ queryKey: ["admin"] });
  };

  if (isError) return <p className="text-muted-foreground">{t("admin.noAccess")}</p>;
  if (!stats) return <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />;

  const { users, trades, usage, tech, github } = stats;
  const sourceName = (s: string) => t(`admin.sources.${s}`, { defaultValue: s });

  return (
    <div className="space-y-6">
      <PageHeader title={t("admin.title")} subtitle={t("admin.subtitle")} />

      <Section title={t("admin.users.title")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <Tile label={t("admin.users.total")} value={number(users.total)} />
          <Tile label={t("admin.users.verified")} value={number(users.verified)} hint={t("admin.users.unverified", { count: users.total - users.verified })} />
          <Tile label={t("admin.users.new7")} value={number(users.new_7d)} hint={t("admin.users.new30", { count: users.new_30d })} />
          <Tile label={t("admin.users.active7")} value={number(users.d7)} hint={t("admin.users.active", { d1: users.d1, d30: users.d30 })} />
          <Tile label={t("admin.users.twoFactor")} value={users.verified ? `${Math.round((users.two_factor / users.verified) * 100)} %` : "–"} hint={number(users.two_factor)} />
          <Tile label={t("admin.users.newsletter")} value={number(users.newsletter)} />
        </div>
        <p className="mt-6 mb-2 text-sm font-medium">{t("admin.users.perWeek")}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.signupsPerWeek} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.5} />
              <XAxis dataKey="week" tickFormatter={(w: string) => new Date(w).toLocaleDateString(i18n.language, { day: "2-digit", month: "2-digit" })} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(w: string) => t("admin.users.weekOf", { date: new Date(w).toLocaleDateString(i18n.language) })}
                formatter={(v: number) => [number(v), t("admin.users.signups")]}
              />
              <Bar dataKey="signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>

      <Section title={t("admin.usage.title")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <Tile label={t("admin.usage.trades")} value={number(trades.total)} hint={t("admin.usage.tradesNew", { count: trades.new_7d })} />
          <Tile label={t("admin.usage.tradingUsers")} value={number(trades.users)} />
          <Tile label={t("admin.usage.ibkr")} value={number(usage.ibkrConnections)} />
          <Tile label={t("admin.usage.shares")} value={number(usage.shares)} hint={t("admin.usage.shareViews", { count: usage.shareViews })} />
          <Tile label={t("admin.usage.journal")} value={number(usage.journalEntries)} />
          <Tile label={t("admin.usage.screenshots")} value={number(trades.with_screenshot)} />
        </div>
        <table className="mt-5 w-full max-w-md text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="pb-2 font-normal">{t("admin.usage.source")}</th>
              <th className="pb-2 text-right font-normal">{t("admin.usage.trades")}</th>
              <th className="pb-2 text-right font-normal">{t("admin.usage.users")}</th>
            </tr>
          </thead>
          <tbody>
            {trades.bySource.map((s) => (
              <tr key={s.source} className="border-t">
                <td className="py-1.5">{sourceName(s.source)}</td>
                <td className="tabular py-1.5 text-right">{number(s.trades)}</td>
                <td className="tabular py-1.5 text-right">{number(s.users)}</td>
              </tr>
            ))}
            <tr className="border-t">
              <td className="py-1.5">{t("admin.sources.manual")}</td>
              <td className="tabular py-1.5 text-right">{number(trades.manual)}</td>
              <td className="py-1.5 text-right text-muted-foreground">–</td>
            </tr>
          </tbody>
        </table>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="GitHub">
          {!github ? (
            <p className="text-sm text-muted-foreground">{t("admin.github.notConfigured")}</p>
          ) : "error" in github ? (
            <p className="text-sm text-destructive">{github.error}</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Tile label={t("admin.github.stars")} value={number(github.stars)} />
                <Tile label={t("admin.github.forks")} value={number(github.forks)} />
                <Tile label={t("admin.github.watchers")} value={number(github.watchers)} />
                <Tile label={t("admin.github.openIssues")} value={number(github.openIssues)} />
                <Tile label={t("admin.github.feedbackOpen")} value={number(github.feedbackOpen)} hint={t("admin.github.feedbackTotal", { count: github.feedbackTotal })} />
              </div>
              <a href={github.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                {github.repo} {github.private && `(${t("admin.github.private")})`} <ExternalLink className="h-3 w-3" />
              </a>
            </>
          )}
        </Section>

        <Section title={t("admin.tech.title")}>
          <div className="grid grid-cols-2 gap-3">
            <Tile label={t("admin.tech.screenshots")} value={bytes(tech.uploadsBytes)} />
            <Tile label={t("admin.tech.database")} value={bytes(tech.databaseBytes)} />
            <Tile label={t("admin.tech.mailToday")} value={`${number(tech.mailSent24h)} / ${number(tech.mailDailyLimit)}`} hint={t("admin.tech.mailPending", { count: tech.mailQueuePending })} />
            <Tile label={t("admin.tech.smtp")} value={tech.smtpConfigured ? "✓" : "–"} hint={tech.smtpConfigured ? undefined : t("admin.tech.smtpMissing")} />
          </div>
          <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
            {tech.marketEvents.map((e) => (
              <li key={e.source}>
                {t(`admin.tech.calendar.${e.source}`, { defaultValue: e.source })}: {date(e.last_sync)} · {number(e.events)}
              </li>
            ))}
          </ul>
        </Section>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5" />
            {t("admin.mail.title")}
          </CardTitle>
          <CardDescription>{t("admin.mail.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
            {(["service", "newsletter"] as const).map((k) => (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={kind === k}
                onClick={() => setKind(k)}
                className={cn("rounded-lg border p-3 text-left text-sm", kind === k ? "border-primary bg-primary/10" : "border-border text-muted-foreground hover:bg-accent")}
              >
                <p className="font-semibold text-foreground">{t(`admin.mail.kinds.${k}`)}</p>
                <p className="mt-1 text-xs">{t(`admin.mail.kinds.${k}Hint`, { count: mail?.recipients[k] ?? 0 })}</p>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="mail-subject">{t("admin.mail.subject")}</Label>
            <Input id="mail-subject" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mail-body">{t("admin.mail.body")}</Label>
            <Textarea id="mail-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} maxLength={20000} />
            <p className="text-xs text-muted-foreground">{t("admin.mail.bodyHint")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={sendTest} disabled={!ready || busy}>
              {t("admin.mail.test")}
            </Button>
            <Button onClick={() => setConfirm(true)} disabled={!ready || busy || recipients === 0}>
              <Send className="h-4 w-4 mr-2" />
              {t("admin.mail.sendAll", { count: recipients })}
            </Button>
          </div>

          {mail && mail.campaigns.length > 0 && (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-normal">{t("admin.mail.sentAt")}</th>
                  <th className="pb-2 font-normal">{t("admin.mail.subject")}</th>
                  <th className="pb-2 text-right font-normal">{t("admin.mail.progress")}</th>
                </tr>
              </thead>
              <tbody>
                {mail.campaigns.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-1.5 whitespace-nowrap text-muted-foreground">{date(c.created_at)}</td>
                    <td className="py-1.5">
                      <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">{t(`admin.mail.kinds.${c.kind}`)}</span>
                      {c.subject}
                    </td>
                    <td className="tabular py-1.5 text-right whitespace-nowrap">
                      {c.sent}/{c.total}
                      {c.pending > 0 && <span className="text-muted-foreground"> · {t("admin.mail.pending", { count: c.pending })}</span>}
                      {c.failed > 0 && <span className="text-destructive"> · {t("admin.mail.failed", { count: c.failed })}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.mail.confirmTitle", { count: recipients })}</AlertDialogTitle>
            <AlertDialogDescription>{t("admin.mail.confirmText", { subject, perDay: tech.mailDailyLimit })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={sendAll}>{t("admin.mail.sendAll", { count: recipients })}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
