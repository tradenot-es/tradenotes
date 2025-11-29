import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MarketauxArticle {
  uuid: string;
  title: string;
  snippet: string;
  url: string;
  published_at: string;
  source: string;
  entities: Array<{
    symbol: string;
    name: string;
    sentiment_score: number;
    match_score: number;
  }>;
}

interface FinancialNewsProps {
  date: Date;
  symbols?: string[];
  market?: string;
}

export function FinancialNews({ date, symbols, market }: FinancialNewsProps) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<MarketauxArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const loadingRef = useRef(false);
  const lastRequestRef = useRef<string>("");

  useEffect(() => {
    const requestKey = `${date.toISOString()}-${JSON.stringify(symbols)}-${market}`;
    
    if (loadingRef.current || lastRequestRef.current === requestKey) {
      return;
    }
    
    lastRequestRef.current = requestKey;
    loadNews();
  }, [date, symbols, market]);

  const loadNews = async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Only fetch news if we have symbols (Marketaux requires symbols)
      if (!symbols || symbols.length === 0) {
        setError(t("trades.noNewsAvailable"));
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      console.log("FinancialNews: Fetching from marketaux-news for", dateStr, symbols);

      const { data, error: functionError } = await supabase.functions.invoke('marketaux-news', {
        body: { 
          symbols,
          date: dateStr,
          limit: 10
        }
      });

      if (functionError) {
        console.error("FinancialNews: Function error", functionError);
        if (functionError.message?.includes('429') || functionError.message?.includes('rate limit')) {
          setError('News temporarily unavailable due to rate limits. Please try again later.');
        } else {
          throw functionError;
        }
        return;
      }

      console.log("FinancialNews: Response", data);

      if (data?.success) {
        setArticles(data.articles || []);
        if (data.articles.length === 0) {
          setError(t("trades.noNewsAvailable") + " (Date: " + dateStr + ")");
        }
      } else {
        console.error("FinancialNews: API error", data);
        if (data?.error?.includes('rate limit') || data?.error?.includes('429')) {
          setError('News temporarily unavailable due to rate limits. Please try again later.');
        } else {
          setError(data?.error || t("trades.noNewsAvailable"));
        }
      }
    } catch (err: any) {
      console.error('FinancialNews: Error loading news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const getSentimentIcon = (sentimentScore: number) => {
    if (sentimentScore > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (sentimentScore < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getSentimentColor = (sentimentScore: number) => {
    if (sentimentScore > 0.2) return "text-green-500";
    if (sentimentScore < -0.2) return "text-red-500";
    return "text-muted-foreground";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("trades.newsOnDate")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("trades.newsOnDate")}</CardTitle>
        {symbols && symbols.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            {t("trades.newsAnalyzedFor")}: <span className="font-medium">{symbols.join(", ")}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("trades.noNewsAvailable")}</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => {
              const relevantEntity = article.entities?.find(e => symbols?.includes(e.symbol));
              const matchScore = relevantEntity?.match_score || 0;
              const sentimentScore = relevantEntity?.sentiment_score || 0;

              return (
                <div key={`${date.toISOString()}-${article.uuid}-${index}`} className="border-b pb-4 last:border-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-sm font-medium line-clamp-2 flex-1">{article.title}</h4>
                    <div className="flex items-center gap-1">
                      {matchScore > 50 && (
                        <Flame className="h-3 w-3 text-orange-500" title={`High relevance: ${matchScore}%`} />
                      )}
                      {getSentimentIcon(sentimentScore)}
                    </div>
                  </div>
                  {article.snippet && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {article.snippet}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {article.source}
                    </Badge>
                    {matchScore > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Match: {matchScore}%
                      </Badge>
                    )}
                    {sentimentScore !== 0 && (
                      <Badge variant="outline" className={cn("text-xs", getSentimentColor(sentimentScore))}>
                        Sentiment: {sentimentScore > 0 ? '+' : ''}{sentimentScore.toFixed(2)}
                      </Badge>
                    )}
                    {article.entities?.slice(0, 3).map((entity) => (
                      <Badge key={entity.symbol} variant="secondary" className="text-xs">
                        {entity.symbol}
                      </Badge>
                    ))}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      {t("common.readMore")} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
