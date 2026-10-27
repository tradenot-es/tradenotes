import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Landmark, RefreshCw, Unplug } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";
import { dateLocale } from "@/lib/dateLocale";

interface Connection {
  query_id: string;
  last_sync_at: string | null;
  last_status: string | null;
  last_error: string | null;
}

/**
 * Interactive Brokers via Flex Web Service: the user stores a read-only report token
 * and the id of a Flex Query; the server fetches the executions daily (server/src/ibkr.ts).
 */
export function IbkrConnection({ onImported }: { onImported?: () => void }) {
  const { t, i18n } = useTranslation();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [editing, setEditing] = useState(false);
  const [token, setToken] = useState("");
  const [queryId, setQueryId] = useState("");
  const [busy, setBusy] = useState<"save" | "sync" | "delete" | null>(null);

  const load = async () => {
    const { data } = await apiFetch<{ connection: Connection | null }>("/api/connections/ibkr");
    setConnection(data?.connection ?? null);
  };
  useEffect(() => {
    load();
  }, []);

  const sync = async () => {
    setBusy("sync");
    const { data, error } = await apiFetch<{ tradesCreated: number; duplicates: number; received: number }>("/api/connections/ibkr/sync", { method: "POST" });
    setBusy(null);
    await load();
    if (error) {
      toast.error(t("import.ibkr.syncError", { message: error.message }));
      return;
    }
    toast.success(t("import.ibkr.syncResult", { received: data.received, created: data.tradesCreated }));
    onImported?.();
  };

  const save = async () => {
    setBusy("save");
    const { error } = await apiFetch("/api/connections/ibkr", { method: "PUT", json: { token, queryId } });
    setBusy(null);
    if (error) {
      toast.error(t("import.ibkr.invalid"));
      return;
    }
    setToken("");
    setEditing(false);
    await load();
    // fetch right away so the user sees whether token and query work
    await sync();
  };

  const remove = async () => {
    setBusy("delete");
    await apiFetch("/api/connections/ibkr", { method: "DELETE" });
    setBusy(null);
    setConnection(null);
    toast.success(t("import.ibkr.removed"));
  };

  const showForm = !connection || editing;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" aria-hidden />
          {t("import.ibkr.title")}
        </CardTitle>
        <CardDescription className="text-base">{t("import.ibkr.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {connection && (
          <div className="space-y-3 rounded-lg border p-4" role="status">
            <p className="text-sm font-medium">{t("import.ibkr.connected", { queryId: connection.query_id })}</p>
            <p className="text-xs text-muted-foreground">
              {connection.last_sync_at
                ? t("import.ibkr.lastSync", {
                    time: formatDistanceToNow(new Date(connection.last_sync_at), { addSuffix: true, locale: dateLocale(i18n.language) }),
                  })
                : t("import.ibkr.neverSynced")}
              {connection.last_status && !connection.last_error && ` · ${connection.last_status}`}
            </p>
            {connection.last_error && <p className="text-xs text-destructive">{t("import.ibkr.lastError", { message: connection.last_error })}</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={sync} disabled={busy !== null}>
                <RefreshCw className={`mr-2 h-4 w-4 ${busy === "sync" ? "animate-spin" : ""}`} aria-hidden />
                {t("import.ibkr.syncNow")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(!editing)} disabled={busy !== null}>
                {t("import.ibkr.changeToken")}
              </Button>
              <Button size="sm" variant="ghost" onClick={remove} disabled={busy !== null}>
                <Unplug className="mr-2 h-4 w-4" aria-hidden />
                {t("import.ibkr.disconnect")}
              </Button>
            </div>
          </div>
        )}

        {showForm && (
          <>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>{t("import.ibkr.step1")}</li>
              <li>{t("import.ibkr.step2")}</li>
              <li>{t("import.ibkr.step3")}</li>
              <li>{t("import.ibkr.step4")}</li>
            </ol>
            <form
              className="grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="ibkr-token">{t("import.ibkr.token")}</Label>
                <Input id="ibkr-token" type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ibkr-query">{t("import.ibkr.queryId")}</Label>
                <Input id="ibkr-query" inputMode="numeric" value={queryId} onChange={(e) => setQueryId(e.target.value)} required />
              </div>
              <Button type="submit" disabled={busy !== null || !token || !queryId}>
                {busy === "save" ? t("import.ibkr.saving") : t("import.ibkr.connect")}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground">{t("import.ibkr.note")}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
