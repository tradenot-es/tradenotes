import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { differenceInMinutes, format, parseISO } from "date-fns";
import { ArrowRight, Share2, Star } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api";
import { dateLocale } from "@/lib/dateLocale";
import { cn } from "@/lib/utils";

interface SharedTradeData {
  symbol: string;
  market: string | null;
  side: "long" | "short";
  qty: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  fees: number | null;
  pnl_net: number;
  r: number | null;
  setup: string | null;
  rating: number | null;
  mistakes: string[] | null;
  emotions: string[] | null;
  account_type: string | null;
  mfe_price: number | null;
  mae_price: number | null;
  note: string | null;
  has_screenshot: boolean;
}

/** Mentor mode: one trade, read-only, for anyone with the link. Never indexed. */
export default function SharedTrade() {
  const { token } = useParams();
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<{ trade: SharedTradeData; sharedBy: string | null; currency: string } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    // private links must never show up in search results
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    apiFetch<{ trade: SharedTradeData; sharedBy: string | null; currency: string }>(`/api/public/share/${token}`).then(({ data, error }) => {
      if (error) setMissing(true);
      else setData(data);
    });
  }, [token]);

  useEffect(() => {
    if (data) document.title = `${t("share.pageTitle", { symbol: data.trade.symbol })} | TradeNot.es`;
  }, [data, t]);

  const money = (v: number) =>
    new Intl.NumberFormat(i18n.language, { style: "currency", currency: data?.currency ?? "USD", maximumFractionDigits: 2 }).format(v);
  const when = (iso: string) => format(parseISO(iso), "PPp", { locale: dateLocale(i18n.language) });
  const holding = (a: string, b: string) => {
    const min = differenceInMinutes(parseISO(b), parseISO(a));
    return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-16 pt-28 sm:px-6">
        {missing && (
          <Card>
            <CardHeader>
              <CardTitle>{t("share.missingTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{t("share.missingText")}</CardContent>
          </Card>
        )}
        {!data && !missing && <Skeleton className="h-96 w-full rounded-xl" />}

        {data && (
          <article className="space-y-6">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Share2 className="h-4 w-4" aria-hidden />
              {data.sharedBy ? t("share.sharedBy", { name: data.sharedBy }) : t("share.sharedAnonymous")}
            </p>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{data.trade.symbol}</h1>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant={data.trade.side === "long" ? "default" : "secondary"}>{t(`trades.${data.trade.side}`)}</Badge>
                      {data.trade.market && <Badge variant="outline">{data.trade.market}</Badge>}
                      {data.trade.setup && <Badge variant="outline">{data.trade.setup}</Badge>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn("tabular text-4xl font-bold", data.trade.pnl_net >= 0 ? "text-success" : "text-destructive")}>
                      {data.trade.pnl_net > 0 ? "+" : ""}
                      {money(data.trade.pnl_net)}
                    </p>
                    {data.trade.r !== null && (
                      <p className="tabular text-sm text-muted-foreground">
                        {data.trade.r > 0 ? "+" : ""}
                        {Number(data.trade.r).toFixed(2)} R
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <Fact label={t("trades.entryPrice")} value={String(data.trade.entry_price)} detail={when(data.trade.entry_time)} />
                  <Fact label={t("trades.exitPrice")} value={String(data.trade.exit_price)} detail={when(data.trade.exit_time)} />
                  <Fact label={t("trades.qty")} value={String(data.trade.qty)} detail={holding(data.trade.entry_time, data.trade.exit_time)} />
                  {data.trade.fees !== null && <Fact label={t("trades.fees")} value={money(Number(data.trade.fees))} />}
                  {data.trade.mfe_price !== null && <Fact label="MFE" value={String(data.trade.mfe_price)} />}
                  {data.trade.mae_price !== null && <Fact label="MAE" value={String(data.trade.mae_price)} />}
                </dl>

                {!!data.trade.rating && (
                  <div className="flex items-center gap-1" aria-label={`${t("trades.rating")}: ${data.trade.rating}/5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={cn("h-5 w-5", n <= data.trade.rating! ? "fill-warning text-warning" : "text-muted-foreground/40")} aria-hidden />
                    ))}
                  </div>
                )}

                {(!!data.trade.mistakes?.length || !!data.trade.emotions?.length) && (
                  <div className="flex flex-wrap gap-2">
                    {data.trade.mistakes?.map((m) => (
                      <Badge key={m} variant="destructive">
                        {t(`behavior.mistakes.${m}`, m)}
                      </Badge>
                    ))}
                    {data.trade.emotions?.map((e) => (
                      <Badge key={e} variant="secondary">
                        {t(`behavior.emotions.${e}`, e)}
                      </Badge>
                    ))}
                  </div>
                )}

                {data.trade.note && (
                  <div>
                    <h2 className="mb-1 text-sm font-semibold">{t("trades.note")}</h2>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">{data.trade.note}</p>
                  </div>
                )}

                {data.trade.has_screenshot && (
                  <img
                    src={`/api/public/share/${token}/screenshot`}
                    alt={t("share.screenshotAlt", { symbol: data.trade.symbol })}
                    className="w-full rounded-lg border"
                    loading="lazy"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-start gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold">{t("share.ctaTitle")}</p>
                  <p className="text-sm text-muted-foreground">{t("share.ctaText")}</p>
                </div>
                <Button asChild>
                  <Link to="/auth">
                    {t("share.ctaButton")}
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Fact({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="tabular text-lg font-semibold">{value}</dd>
      {detail && <dd className="text-xs text-muted-foreground">{detail}</dd>}
    </div>
  );
}
