import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Building2, HelpCircle, TrendingDown, Minus, ExternalLink, AlertTriangle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SectorSentiment {
  sector: string;
  avg_sentiment: number;
  min_sentiment?: number;
  max_sentiment?: number;
  volatility?: number;
  negative_count?: number;
  strongly_negative_count?: number;
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
  const [refreshing, setRefreshing] = useState(false);

  // Sector information with descriptions and example companies
  const getSectorInfo = (sector: string) => {
    const sectorKey = sector.toLowerCase().replace(/\s+/g, "_");
    return {
      description: t(`dashboard.sectors.${sectorKey}.description`),
      examples: t(`dashboard.sectors.${sectorKey}.examples`)
    };
  };

  useEffect(() => {
    loadSectorData();
  }, []);

  const loadSectorData = async (forceRefresh = false) => {
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load today's sectors
      const { data, error } = await supabase.functions.invoke("marketaux-news", {
        body: { action: "get-sector-overview", forceRefresh }
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
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadSectorData(true);
  };

  // Determine if sector has mixed signals
  const hasMixedSignals = (sector: SectorSentiment) => {
    const hasHighVolatility = (sector.volatility ?? 0) > 0.3;
    const hasNegativeDespitePositive = sector.avg_sentiment > 0.1 && (sector.negative_count ?? 0) > 2;
    const hasStronglyNegative = (sector.strongly_negative_count ?? 0) > 0;
    return hasHighVolatility || hasNegativeDespitePositive || hasStronglyNegative;
  };

  // Determine if sector needs warning (strongly negative articles despite positive average)
  const needsWarning = (sector: SectorSentiment) => {
    return sector.avg_sentiment > 0 && (sector.strongly_negative_count ?? 0) > 0;
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return "text-green-500";      // Strong bullish
    if (sentiment > 0.1) return "text-green-500";      // Slightly bullish
    if (sentiment > -0.1) return "text-yellow-500";    // Neutral
    if (sentiment > -0.3) return "text-red-500";       // Slightly bearish
    return "text-red-500";                              // Strong bearish
  };

  const getSentimentIcon = (sentiment: number, hasWarning: boolean = false) => {
    if (hasWarning) return "⚠️";
    if (sentiment > 0.3) return "🟢";       // Strong bullish
    if (sentiment > 0.1) return "🟢";       // Slightly bullish
    if (sentiment > -0.1) return "🟡";      // Neutral
    if (sentiment > -0.3) return "🔴";      // Slightly bearish
    return "🔴";                             // Strong bearish
  };

  const getSentimentLabel = (sentiment: number, isMixed: boolean = false) => {
    if (isMixed) return t("dashboard.sentiment.mixed", { defaultValue: "Mixed" });
    if (sentiment > 0.3) return t("trades.sentiment.bullish");           // Strong bullish
    if (sentiment > 0.1) return t("trades.sentiment.slightlyBullish");   // Slightly bullish
    if (sentiment > -0.1) return t("trades.sentiment.neutral");          // Neutral
    if (sentiment > -0.3) return t("trades.sentiment.slightlyBearish");  // Slightly bearish
    return t("trades.sentiment.bearish");                                 // Strong bearish
  };

  const getTrendIcon = (sentiment: number) => {
    // Arrow shows current sentiment direction, not historical trend
    if (sentiment > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;    // Positive = green up
    if (sentiment < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;   // Negative = red down
    return <Minus className="h-4 w-4 text-yellow-500" />;                              // Neutral = yellow horizontal
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
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("dashboard.sectorSentimentDescription")}</p>
            </HoverCardContent>
          </HoverCard>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="ml-auto inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            title={t("common.refresh")}
          >
            <RefreshCw className={cn("h-4 w-4 text-muted-foreground", refreshing && "animate-spin")} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sectors.map((sector) => {
            const history = sectorHistory[sector.sector] || [];
            const isMixed = hasMixedSignals(sector);
            const showWarning = needsWarning(sector);
            const negativeArticles = sector.articles?.filter(a => a.sentiment_score < -0.3) || [];
            
            return (
              <HoverCard key={sector.sector}>
                <HoverCardTrigger asChild>
                  <div className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors text-center cursor-pointer relative",
                    showWarning ? "border-yellow-500/50" : "border-border"
                  )}>
                    {/* Warning indicator */}
                    {showWarning && (
                      <div className="absolute top-2 right-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="h-4 w-4 text-yellow-500 animate-pulse" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{t("dashboard.sentiment.warningTooltip", { defaultValue: "Contains strongly negative news despite positive average" })}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    <span className="text-3xl mb-2">{getSentimentIcon(sector.avg_sentiment, showWarning)}</span>
                    <div className="mb-2">
                      <div className="flex items-center justify-center gap-1">
                        <p className="font-medium text-sm">{sector.sector}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="inline-flex items-center justify-center h-4 w-4 rounded hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-medium text-sm mb-1">{getSectorInfo(sector.sector).description}</p>
                              <p className="text-xs text-muted-foreground">
                                {t("dashboard.sectors.examples_label")}: {getSectorInfo(sector.sector).examples}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
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
                      <p className={cn(
                        "text-xs font-semibold",
                        isMixed ? "text-yellow-500" : getSentimentColor(sector.avg_sentiment)
                      )}>
                        {getSentimentLabel(sector.avg_sentiment, isMixed)}
                      </p>
                      {!isMixed && getTrendIcon(sector.avg_sentiment)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ø {sector.avg_sentiment.toFixed(2)}
                    </p>
                    
                    {/* Min/Max indicator */}
                    {sector.min_sentiment !== undefined && sector.max_sentiment !== undefined && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        <span className="text-red-400">{sector.min_sentiment.toFixed(2)}</span>
                        {" / "}
                        <span className="text-green-400">{sector.max_sentiment.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </HoverCardTrigger>
                
                <HoverCardContent className="w-96" align="center">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{sector.sector}</h4>
                      <p className="text-xs text-muted-foreground">
                        {t("dashboard.sectorArticles", { count: sector.article_count })}
                      </p>
                    </div>
                    
                    {/* Statistics overview */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-muted/50 rounded p-2 text-center">
                        <p className="text-muted-foreground">{t("dashboard.sentiment.average", { defaultValue: "Average" })}</p>
                        <p className={cn("font-semibold", getSentimentColor(sector.avg_sentiment))}>
                          {sector.avg_sentiment.toFixed(2)}
                        </p>
                      </div>
                      {sector.min_sentiment !== undefined && (
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="text-muted-foreground">Min</p>
                          <p className="font-semibold text-red-500">{sector.min_sentiment.toFixed(2)}</p>
                        </div>
                      )}
                      {sector.max_sentiment !== undefined && (
                        <div className="bg-muted/50 rounded p-2 text-center">
                          <p className="text-muted-foreground">Max</p>
                          <p className="font-semibold text-green-500">{sector.max_sentiment.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Volatility warning */}
                    {(sector.volatility ?? 0) > 0.3 && (
                      <div className="flex items-center gap-2 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded p-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        <p className="text-yellow-600 dark:text-yellow-400">
                          {t("dashboard.sentiment.highVolatility", { defaultValue: "High volatility: Sentiment varies widely across articles" })}
                        </p>
                      </div>
                    )}
                    
                    {/* Negative articles warning */}
                    {negativeArticles.length > 0 && sector.avg_sentiment > 0 && (
                      <div className="flex items-center gap-2 text-xs bg-red-500/10 border border-red-500/30 rounded p-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <p className="text-red-600 dark:text-red-400">
                          {t("dashboard.sentiment.negativeWarning", { 
                            count: negativeArticles.length,
                            defaultValue: `${negativeArticles.length} strongly negative article(s) despite positive average`
                          })}
                        </p>
                      </div>
                    )}
                    
                    {/* Top Articles - separated by sentiment */}
                    {sector.articles && sector.articles.length > 0 && (
                      <div className="space-y-2">
                        {/* Negative articles first if they exist */}
                        {negativeArticles.length > 0 && (
                          <>
                            <p className="text-xs font-medium text-red-500">
                              ⚠️ {t("dashboard.negativeArticles", { defaultValue: "Negative News" })}:
                            </p>
                            {negativeArticles.slice(0, 2).map((article, idx) => (
                              <div key={`neg-${idx}`} className="text-xs space-y-1 pb-2 border-b border-red-500/30 bg-red-500/5 rounded p-2">
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
                                  <span className="text-red-500 font-semibold">
                                    {t("trades.sentiment.bearish")} ({article.sentiment_score.toFixed(2)})
                                  </span>
                                  <span className="text-muted-foreground">
                                    {new Date(article.published_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                        
                        {/* Other top articles */}
                        <p className="text-xs font-medium text-muted-foreground">
                          {t("dashboard.topArticles")}:
                        </p>
                        {sector.articles
                          .filter(a => a.sentiment_score >= -0.3)
                          .slice(0, 3)
                          .map((article, idx) => (
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
                                  article.sentiment_score > 0.3 ? "text-green-500" :
                                  article.sentiment_score > 0.1 ? "text-green-500" :
                                  article.sentiment_score > -0.1 ? "text-yellow-500" :
                                  "text-red-500"
                                )}>
                                  {article.sentiment_score > 0.3 ? t("trades.sentiment.bullish") :
                                   article.sentiment_score > 0.1 ? t("trades.sentiment.slightlyBullish") :
                                   article.sentiment_score > -0.1 ? t("trades.sentiment.neutral") :
                                   t("trades.sentiment.slightlyBearish")} ({article.sentiment_score.toFixed(2)})
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
                          {t("dashboard.trend7Days")}: {getTrendIcon(sector.avg_sentiment)}
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