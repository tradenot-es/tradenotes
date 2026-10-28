import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { ChevronDown, NotebookPen, TrendingDown, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IntradayPnlChart } from "@/components/charts/IntradayPnlChart";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { useTradingGoals } from "@/hooks/useTradingGoals";
import { db } from "@/lib/api";
import { dateLocale } from "@/lib/dateLocale";
import { BehaviorTrade, DetectedFlags, detectPatterns, effectiveMistakes } from "@/lib/behavior";
import { cn } from "@/lib/utils";

interface DayTrade extends BehaviorTrade {
  symbol: string;
  side: string;
  fees: number;
  r?: number | null;
  setup?: string | null;
}

interface DayData {
  date: string;
  trades: DayTrade[];
  pnl: number;
  wins: number;
  losses: number;
  best: number;
  worst: number;
  fees: number;
}

const PAGE = 14;

/** Trading days, newest first: intraday P&L curve, stats, trades and the day's notes. */
export default function Days() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [trades, setTrades] = useState<DayTrade[]>([]);
  const [notes, setNotes] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE);
  const { goals } = useTradingGoals(trades);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      db.from("trades").select("id, symbol, side, qty, fees, r, setup, pnl_net, entry_time, exit_time, mistakes, emotions").order("exit_time", { ascending: true }),
      db.from("journal_entries").select("date, content").order("date", { ascending: false }),
    ]).then(([tradesRes, journalRes]) => {
      setTrades(tradesRes.data ?? []);
      const byDate = new Map<string, string[]>();
      for (const e of journalRes.data ?? []) byDate.set(e.date, [...(byDate.get(e.date) ?? []), e.content]);
      setNotes(byDate);
      setLoading(false);
    });
  }, [user]);

  const flags: DetectedFlags = useMemo(
    () => detectPatterns(trades, goals.max_trades.enabled ? goals.max_trades.target : undefined),
    [trades, goals],
  );

  const days = useMemo<DayData[]>(() => {
    const map = new Map<string, DayTrade[]>();
    for (const tr of trades) {
      const d = format(parseISO(tr.exit_time), "yyyy-MM-dd");
      map.set(d, [...(map.get(d) ?? []), tr]);
    }
    return [...map.entries()]
      .map(([date, list]) => ({
        date,
        trades: list,
        pnl: list.reduce((s, tr) => s + tr.pnl_net, 0),
        wins: list.filter((tr) => tr.pnl_net > 0).length,
        losses: list.filter((tr) => tr.pnl_net < 0).length,
        best: Math.max(...list.map((tr) => tr.pnl_net)),
        worst: Math.min(...list.map((tr) => tr.pnl_net)),
        fees: list.reduce((s, tr) => s + (tr.fees || 0), 0),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [trades]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("days.title")} subtitle={t("days.subtitle")} />

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : days.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">{t("days.empty")}</CardContent>
        </Card>
      ) : (
        <>
          {days.slice(0, visible).map((day, i) => (
            <DayCard
              key={day.date}
              day={day}
              index={i}
              notes={notes.get(day.date) ?? []}
              flags={flags}
              formatCurrency={formatCurrency}
              locale={dateLocale(i18n.language)}
            />
          ))}
          {visible < days.length && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE)}>
                {t("days.loadMore", { count: Math.min(PAGE, days.length - visible) })}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface DayCardProps {
  day: DayData;
  index: number;
  notes: string[];
  flags: DetectedFlags;
  formatCurrency: (v: number) => string;
  locale: ReturnType<typeof dateLocale>;
}

function DayCard({ day, index, notes, flags, formatCurrency, locale }: DayCardProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const positive = day.pnl >= 0;
  const winRate = (day.wins / day.trades.length) * 100;
  const mistakeCount = day.trades.filter((tr) => effectiveMistakes(tr, flags).length > 0).length;

  const points = useMemo(() => {
    let sum = 0;
    return day.trades.map((tr) => {
      sum += tr.pnl_net;
      return { time: tr.exit_time, value: sum, label: `${tr.symbol} ${tr.pnl_net > 0 ? "+" : ""}${formatCurrency(tr.pnl_net)}` };
    });
  }, [day.trades, formatCurrency]);

  const stats = [
    { label: t("days.trades"), value: String(day.trades.length) },
    { label: t("days.winRate"), value: `${winRate.toFixed(0)} %` },
    { label: t("days.best"), value: formatCurrency(day.best) },
    { label: t("days.worst"), value: formatCurrency(day.worst) },
    { label: t("days.fees"), value: formatCurrency(day.fees) },
    { label: t("days.mistakes"), value: String(mistakeCount) },
  ];

  return (
    <Card className="overflow-hidden animate-rise-in motion-stagger" style={{ "--stagger": Math.min(index, 6) } as React.CSSProperties}>
      <CardContent className="p-0">
        <div className="grid gap-6 p-5 md:grid-cols-[14rem_1fr]">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">{format(parseISO(day.date), "EEEE", { locale })}</p>
              <p className="text-lg font-semibold">{format(parseISO(day.date), "PPP", { locale })}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full",
                  positive ? "bg-chart-profit/15 text-chart-profit" : "bg-chart-loss/15 text-chart-loss",
                )}
                aria-hidden
              >
                {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </span>
              <span className="tabular text-3xl font-bold">
                {day.pnl > 0 ? "+" : ""}
                {formatCurrency(day.pnl)}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              {stats.map((s) => (
                <div key={s.label} className="contents">
                  <dt className="text-muted-foreground">{s.label}</dt>
                  <dd className="tabular text-right font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex min-w-0 flex-col justify-between gap-3">
            <IntradayPnlChart
              points={points}
              formatValue={formatCurrency}
              height={150}
              ariaLabel={t("days.chartLabel", { pnl: formatCurrency(day.pnl), count: day.trades.length })}
            />
            {notes.length > 0 && (
              <div className="flex gap-2 rounded-lg bg-muted/40 p-3 text-sm">
                <NotebookPen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <p className="line-clamp-3 whitespace-pre-line text-muted-foreground">{notes.join("\n\n")}</p>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-center gap-2 border-t py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          {open ? t("days.hideTrades") : t("days.showTrades", { count: day.trades.length })}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} aria-hidden />
        </button>

        {open && (
          <div className="overflow-x-auto border-t animate-rise-in">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-2 font-medium">{t("days.time")}</th>
                  <th className="px-3 py-2 font-medium">{t("days.symbol")}</th>
                  <th className="px-3 py-2 font-medium">{t("days.side")}</th>
                  <th className="px-3 py-2 text-right font-medium">P&L</th>
                  <th className="px-3 py-2 text-right font-medium">R</th>
                  <th className="px-5 py-2 font-medium">{t("days.behavior")}</th>
                </tr>
              </thead>
              <tbody>
                {day.trades.map((tr) => {
                  const tags = effectiveMistakes(tr, flags);
                  return (
                    <tr key={tr.id} className="border-t">
                      <td className="tabular px-5 py-2 text-muted-foreground">
                        {format(parseISO(tr.entry_time), "HH:mm")}–{format(parseISO(tr.exit_time), "HH:mm")}
                      </td>
                      <td className="px-3 py-2 font-medium">{tr.symbol}</td>
                      <td className="px-3 py-2 capitalize">{tr.side}</td>
                      <td className="tabular px-3 py-2 text-right font-medium">
                        {tr.pnl_net > 0 ? "+" : ""}
                        {formatCurrency(tr.pnl_net)}
                      </td>
                      <td className="tabular px-3 py-2 text-right">{tr.r != null ? tr.r.toFixed(2) : "–"}</td>
                      <td className="px-5 py-2">
                        <div className="flex flex-wrap gap-1">
                          {tags.map((m) => (
                            <Badge key={m} variant="outline" className="border-destructive/40 text-xs font-normal">
                              {t(`behavior.mistakes.${m}`)}
                            </Badge>
                          ))}
                          {(tr.emotions ?? []).map((e) => (
                            <Badge key={e} variant="secondary" className="text-xs font-normal">
                              {t(`behavior.emotions.${e}`)}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
