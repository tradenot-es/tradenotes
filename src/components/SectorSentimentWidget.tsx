import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendingUp, Building2, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SectorSentiment {
  sector: string;
  avg_sentiment: number;
  article_count: number;
}

export function SectorSentimentWidget() {
  const { t } = useTranslation();
  const [sectors, setSectors] = useState<SectorSentiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSectorSentiments();
  }, []);

  const loadSectorSentiments = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("marketaux-news", {
        body: { action: "get-sector-overview" }
      });

      if (error) throw error;

      if (data?.success && data.sectors) {
        setSectors(data.sectors);
      }
    } catch (err) {
      console.error("Error loading sector sentiments:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return "text-green-500";
    if (sentiment < -0.2) return "text-red-500";
    return "text-yellow-500";
  };

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.2) return "🟢";
    if (sentiment < -0.2) return "🔴";
    return "🟡";
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.2) return t("trades.sentiment.bullish");
    if (sentiment < -0.2) return t("trades.sentiment.bearish");
    return t("trades.sentiment.neutral");
  };

  if (loading) {
    return (
      <Card className="elegant-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>{t("dashboard.sectorSentiment")}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{t("dashboard.sectorSentimentDescription")}</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sectors.length === 0) {
    return null;
  }

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <CardTitle>{t("dashboard.sectorSentiment")}</CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("dashboard.sectorSentimentDescription")}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectors.map((sector) => (
            <div key={sector.sector} className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors text-center">
              <span className="text-3xl mb-2">{getSentimentIcon(sector.avg_sentiment)}</span>
              <div className="mb-2">
                <p className="font-medium text-sm">{sector.sector}</p>
                <p className="text-xs text-muted-foreground">
                  {sector.article_count} {t("dashboard.articles")}
                </p>
              </div>
              <div>
                <p className={cn("text-xs font-semibold mb-1", getSentimentColor(sector.avg_sentiment))}>
                  {getSentimentLabel(sector.avg_sentiment)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {sector.avg_sentiment.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
