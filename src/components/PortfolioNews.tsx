import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Info, Newspaper, Languages } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useFrequentSymbols } from "@/hooks/useFrequentSymbols";
import { toast } from "sonner";

interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  sentiment?: string;
  entities?: Array<{ symbol: string; name: string }>;
  translatedTitle?: string;
  translatedDescription?: string;
}

export function PortfolioNews() {
  const { t, i18n } = useTranslation();
  const { frequentSymbols, loading: symbolsLoading } = useFrequentSymbols();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCached, setIsCached] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  useEffect(() => {
    if (!symbolsLoading && frequentSymbols.length > 0) {
      loadNews();
    } else if (!symbolsLoading) {
      setLoading(false);
    }
  }, [frequentSymbols, symbolsLoading]);

  // Auto-translate when language is not English
  useEffect(() => {
    if (articles.length > 0 && i18n.language !== 'en' && !articles[0].translatedTitle && !translating) {
      translateNews();
    }
  }, [articles, i18n.language]);

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      // Filter only stock symbols (exclude futures like NQ, GC, ES)
      const stockSymbols = frequentSymbols
        .filter(s => s.market === 'Stock' || s.market === 'stock')
        .slice(0, 5)
        .map(s => s.symbol);
      
      if (stockSymbols.length === 0) {
        setError(t("dashboard.stocksOnlyNews"));
        setLoading(false);
        return;
      }
      
      const topSymbols = stockSymbols;
      
      // Try up to 7 days back to find news
      let articlesFound = false;
      const maxDaysBack = 7;
      
      for (let daysBack = 0; daysBack <= maxDaysBack && !articlesFound; daysBack++) {
        const now = new Date();
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - daysBack);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        console.log(`PortfolioNews: Trying date ${dateStr} (${daysBack} days back), symbols:`, topSymbols);
        
        const { data, error: functionError } = await supabase.functions.invoke('marketaux-news', {
          body: { 
            symbols: topSymbols,
            limit: 5
          }
        });

        if (functionError) {
          console.error(`Error loading news for ${dateStr}:`, functionError);
          if (functionError.message?.includes('429') || functionError.message?.includes('rate limit')) {
            setError('News temporarily unavailable due to rate limits. Please try again later.');
            break;
          }
          continue;
        }

        if (data.success && data.articles?.length > 0) {
          const articles = data.articles.slice(0, 5);
          console.log(`PortfolioNews: Found ${articles.length} articles for ${dateStr}, cached:`, data.meta?.cached);
          setArticles(articles);
          setIsCached(data.meta?.cached || false);
          articlesFound = true;
        } else if (data.meta?.error === 'unsupported_symbols') {
          // Stop trying if symbols are not supported
          console.log(`PortfolioNews: Symbols not supported by news provider`);
          setError('News is only available for stock symbols (like AAPL, GOOGL, TSLA). Futures and indices are not supported.');
          break;
        } else {
          console.log(`PortfolioNews: No articles for ${dateStr}, trying earlier date...`);
        }
      }
      
      if (!articlesFound && !error) {
        setError(t("trades.noNewsAvailable"));
      }
    } catch (err: any) {
      console.error('Error loading portfolio news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const translateNews = async () => {
    if (articles.some(a => a.translatedTitle)) {
      setShowTranslated(!showTranslated);
      return;
    }

    setTranslating(true);
    try {
      const targetLang = i18n.language;
      
      const translated = await Promise.all(
        articles.map(async (article) => {
          const { data, error } = await supabase.functions.invoke('translate-news', {
            body: { 
              title: article.title,
              description: article.description,
              targetLanguage: targetLang
            }
          });

          if (error || !data?.success) {
            console.error('Translation error:', error);
            return article;
          }

          return {
            ...article,
            translatedTitle: data.translatedTitle,
            translatedDescription: data.translatedDescription
          };
        })
      );

      setArticles(translated);
      setShowTranslated(true);
      toast.success(t("dashboard.newsTranslated"));
    } catch (err) {
      console.error('Translation failed:', err);
      toast.error(t("dashboard.translationFailed"));
    } finally {
      setTranslating(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>{t("dashboard.portfolioNews")}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
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
          {articles.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={translateNews}
              disabled={translating}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {translating ? t("common.translating") : showTranslated ? t("common.showOriginal") : t("common.translate")}
            </Button>
          )}
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <CardTitle>{t("dashboard.portfolioNews")}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
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
            {showTranslated && (
              <Badge variant="secondary" className="text-xs">
                {t("dashboard.autoTranslated")}
              </Badge>
            )}
          </div>
          {articles.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={translateNews}
              disabled={translating}
              className="gap-2"
            >
              <Languages className="h-4 w-4" />
              {translating ? t("common.translating") : showTranslated ? t("common.showOriginal") : t("common.translate")}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <TrendingUp className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{t("dashboard.dynamicDashboard")}:</span> {t("dashboard.dynamicDashboardInfo")}
            {isCached && <span className="ml-2 text-success">• Cached</span>}
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
                  <h4 className="text-sm font-medium line-clamp-2 flex-1">
                    {showTranslated && article.translatedTitle ? article.translatedTitle : article.title}
                  </h4>
                  {article.sentiment && getSentimentIcon(article.sentiment)}
                </div>
                {article.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {showTranslated && article.translatedDescription ? article.translatedDescription : article.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className="text-xs">
                    {new Date(article.published_at).toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    })}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {article.source}
                  </Badge>
                  {article.entities?.slice(0, 3).map((entity) => (
                    <Badge key={entity.symbol} variant="secondary" className="text-xs">
                      {entity.symbol}
                    </Badge>
                  ))}
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {t("common.readMore")} <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
