import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Info, Newspaper } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useFrequentSymbols } from "@/hooks/useFrequentSymbols";

interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  sentiment?: string;
  entities?: Array<{ symbol: string; name: string }>;
}

export function PortfolioNews() {
  const { t } = useTranslation();
  const { frequentSymbols, loading: symbolsLoading } = useFrequentSymbols();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!symbolsLoading && frequentSymbols.length > 0) {
      loadNews();
    } else if (!symbolsLoading) {
      setLoading(false);
    }
  }, [frequentSymbols, symbolsLoading]);

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      // Get top 5 most traded symbols
      const topSymbols = frequentSymbols.slice(0, 5).map(s => s.symbol);
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error: functionError } = await supabase.functions.invoke('financial-news', {
        body: { 
          action: 'get-articles',
          date: today,
          symbols: topSymbols,
        }
      });

      if (functionError) {
        if (functionError.message?.includes('429') || functionError.message?.includes('rate limit')) {
          setError('News temporarily unavailable due to rate limits. Please try again later.');
        } else {
          throw functionError;
        }
        return;
      }

      if (data.success) {
        setArticles(data.articles.slice(0, 5)); // Limit to 5 articles
      } else {
        if (data.error?.includes('rate limit') || data.error?.includes('429')) {
          setError('News temporarily unavailable due to rate limits. Please try again later.');
        } else {
          setError(data.error || t("trades.noNewsAvailable"));
        }
      }
    } catch (err: any) {
      console.error('Error loading portfolio news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (!sentiment) return <Minus className="h-4 w-4" />;
    if (sentiment.toLowerCase().includes('positive')) return <TrendingUp className="h-4 w-4 text-success" />;
    if (sentiment.toLowerCase().includes('negative')) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4" />;
  };

  if (symbolsLoading || loading) {
    return (
      <Card className="elegant-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>{t("dashboard.portfolioNews")}</CardTitle>
          </div>
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

  if (frequentSymbols.length === 0) {
    return (
      <Card className="elegant-shadow">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>{t("dashboard.portfolioNews")}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{t("dashboard.portfolioNewsTooltip")}</p>
                <a 
                  href="/dashboard/glossary#portfolio-news" 
                  className="text-xs text-primary hover:underline mt-2 block"
                >
                  Learn more in glossary →
                </a>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("dashboard.noSymbolsForNews")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-primary" />
          <CardTitle>{t("dashboard.portfolioNews")}</CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("dashboard.portfolioNewsTooltip")}</p>
                <a 
                  href="/dashboard/glossary#portfolio-news" 
                  className="text-xs text-primary hover:underline mt-2 block"
                >
                  Learn more in glossary →
                </a>
            </HoverCardContent>
          </HoverCard>
        </div>
        <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{t("dashboard.dynamicDashboard")}:</span> {t("dashboard.dynamicDashboardInfo")}
          </p>
        </div>
        <div className="flex gap-1 flex-wrap mt-2">
          {frequentSymbols.slice(0, 5).map((s) => (
            <Badge key={s.symbol} variant="secondary" className="text-xs">
              {s.symbol}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("trades.noNewsAvailable")}</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article, index) => (
              <div key={`portfolio-${article.uuid}-${article.published_at}-${index}`} className="border-b pb-4 last:border-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-sm font-medium line-clamp-2 flex-1">{article.title}</h4>
                  {article.sentiment && getSentimentIcon(article.sentiment)}
                </div>
                {article.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {article.source}
                  </Badge>
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
