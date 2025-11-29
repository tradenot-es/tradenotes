import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { TrendingUp, Building2, Info, TrendingDown, Minus, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SectorSentiment {
  sector: string;
  avg_sentiment: number;
  article_count: number;
  articles?: Array<{
    title: string;
    url: string;
    sentiment_score: number;
    published_at: string;
  }>;
}

interface SectorHistory {
  date: string;
  avg_sentiment: number;
}

export function SectorSentimentWidget() {
  const { t } = useTranslation();
  const [sectors, setSectors] = useState<SectorSentiment[]>([]);
  const [sectorHistory, setSectorHistory] = useState<Record<string, SectorHistory[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSectorData();
  }, []);

  const loadSectorData = async () => {
    setLoading(true);

    try {
      // Load today's sectors
      const { data, error } = await supabase.functions.invoke("marketaux-news", {
        body: { action: "get-sector-overview" }
      });

      if (error) throw error;

      if (data?.success && data.sectors) {
        setSectors(data.sectors);
        
        // Load 7-day history for each sector
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: historyData } = await supabase
          .from("sector_sentiments")
          .select("sector, date, avg_sentiment")
          .gte("date", sevenDaysAgo.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (historyData) {
          const grouped = historyData.reduce((acc, item) => {
            if (!acc[item.sector]) acc[item.sector] = [];
            acc[item.sector].push({
              date: item.date,
              avg_sentiment: item.avg_sentiment
            });
            return acc;
          }, {} as Record<string, SectorHistory[]>);
          
          setSectorHistory(grouped);
        }
      }
    } catch (err) {
      console.error("Error loading sector data:", err);
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

  const getTrendIcon = (history: SectorHistory[], currentSentiment: number) => {
    if (!history || history.length < 2) return <Minus className="h-4 w-4 text-muted-foreground" />;
    
    const previousAvg = history.slice(0, -1).reduce((sum, h) => sum + h.avg_sentiment, 0) / (history.length - 1);
    const diff = currentSentiment - previousAvg;
    
    if (diff > 0.05) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (diff < -0.05) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-yellow-500" />;
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
          {sectors.map((sector) => {
            const history = sectorHistory[sector.sector] || [];
            
            return (
              <HoverCard key={sector.sector}>
                <HoverCardTrigger asChild>
                  <div className="flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors text-center cursor-pointer">
                    <span className="text-3xl mb-2">{getSentimentIcon(sector.avg_sentiment)}</span>
                    <div className="mb-2">
                      <p className="font-medium text-sm">{sector.sector}</p>
                      <p className="text-xs text-muted-foreground">
                        {sector.article_count} {t("dashboard.articles")}
                      </p>
                    </div>
                    
                    {/* Sparkline */}
                    {history.length > 1 && (
                      <div className="w-full h-8 mb-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={history}>
                            <Line 
                              type="monotone" 
                              dataKey="avg_sentiment" 
                              stroke={sector.avg_sentiment > 0 ? "hsl(var(--chart-2))" : "hsl(var(--chart-1))"}
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <p className={cn("text-xs font-semibold", getSentimentColor(sector.avg_sentiment))}>
                        {getSentimentLabel(sector.avg_sentiment)}
                      </p>
                      {getTrendIcon(history, sector.avg_sentiment)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {sector.avg_sentiment.toFixed(2)}
                    </p>
                  </div>
                </HoverCardTrigger>
                
                <HoverCardContent className="w-80" align="center">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{sector.sector}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t("dashboard.sectorArticles", { count: sector.article_count })}
                      </p>
                    </div>
                    
                    {sector.articles && sector.articles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("dashboard.topArticles")}:
                        </p>
                        {sector.articles.map((article, idx) => (
                          <div key={idx} className="text-xs space-y-1 pb-2 border-b border-border last:border-0">
                            <a 
                              href={article.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-medium hover:text-primary flex items-start gap-1 group"
                            >
                              <span className="flex-1">{article.title}</span>
                              <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                            </a>
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-xs font-semibold",
                                article.sentiment_score > 0.2 ? "text-green-500" :
                                article.sentiment_score < -0.2 ? "text-red-500" :
                                "text-yellow-500"
                              )}>
                                {article.sentiment_score > 0.2 ? t("trades.sentiment.bullish") :
                                 article.sentiment_score < -0.2 ? t("trades.sentiment.bearish") :
                                 t("trades.sentiment.neutral")} ({article.sentiment_score.toFixed(2)})
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(article.published_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {history.length > 1 && (
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground">
                          {t("dashboard.trend7Days")}: {getTrendIcon(history, sector.avg_sentiment)}
                        </p>
                      </div>
                    )}
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
