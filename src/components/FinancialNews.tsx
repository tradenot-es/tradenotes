import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsSourceFilter } from "./NewsSourceFilter";

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

interface FinancialNewsProps {
  date: Date;
  symbols?: string[];
}

export function FinancialNews({ date, symbols }: FinancialNewsProps) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  useEffect(() => {
    loadNews();
  }, [date, symbols, selectedSources]);

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      const dateStr = date.toISOString().split('T')[0];
      
      const { data, error: functionError } = await supabase.functions.invoke('financial-news', {
        body: { 
          action: 'get-articles',
          date: dateStr, 
          symbols,
          sources: selectedSources.length > 0 ? selectedSources : undefined
        }
      });

      if (functionError) throw functionError;

      if (data.success) {
        setArticles(data.articles);
      } else {
        setError(data.error || t("trades.noNewsAvailable"));
      }
    } catch (err: any) {
      console.error('Error loading news:', err);
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
        <div className="flex items-center justify-between">
          <CardTitle>{t("trades.newsOnDate")}</CardTitle>
          <NewsSourceFilter onSourcesChange={setSelectedSources} />
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : articles.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("trades.noNewsAvailable")}</p>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.uuid} className="border-b pb-4 last:border-0">
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
