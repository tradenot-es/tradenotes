import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Info, Newspaper, Languages, Tag, Clock } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useFrequentSymbols } from "@/hooks/useFrequentSymbols";
import { toast } from "sonner";
import { getNewsProxies } from "@/lib/symbolData";

interface NewsArticle {
  uuid: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  source: string;
  sentiment?: string;
  entities?: Array<{ symbol: string; name: string; type?: string }>;
  translatedTitle?: string;
  translatedDescription?: string;
}

interface GroupedNews {
  originalSymbol: string;
  market: string;
  proxySymbols: string[];
  articles: NewsArticle[];
}

export function PortfolioNews() {
  const { t, i18n } = useTranslation();
  const { frequentSymbols, loading: symbolsLoading } = useFrequentSymbols();
  const [groupedNews, setGroupedNews] = useState<GroupedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isCached, setIsCached] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [proxyMapping, setProxyMapping] = useState<Record<string, string[]>>({});

  // Generate smart tags based on article entities
  const generateSmartTags = (article: NewsArticle): string[] => {
    const tags: string[] = [];
    const entityTypes = article.entities?.map(e => e.type).filter(Boolean) || [];
    
    if (entityTypes.includes("earnings")) tags.push(t("dashboard.smartTags.earningsPlay"));
    if (entityTypes.includes("macro")) tags.push(t("dashboard.smartTags.macroEvent"));
    if (entityTypes.includes("politics")) tags.push(t("dashboard.smartTags.politicalCatalyst"));
    if (tags.length === 0) tags.push(t("dashboard.smartTags.newsCatalyst"));
    
    return tags;
  };

  // Group news articles by original symbol
  const groupNewsBySymbol = (
    articles: NewsArticle[], 
    mapping: Record<string, string[]>,
    symbols: Array<{ symbol: string; market: string }>
  ): GroupedNews[] => {
    const groups: GroupedNews[] = [];
    const usedArticleIds = new Set<string>(); // Track which articles have been used
    
    symbols.forEach(({ symbol, market }) => {
      const proxies = mapping[symbol] || [symbol];
      const symbolArticles: NewsArticle[] = [];
      
      // Find articles that mention any of the proxy symbols
      articles.forEach(article => {
        // Skip if article already used by another symbol
        if (usedArticleIds.has(article.uuid)) return;
        
        const articleSymbols = article.entities?.map(e => e.symbol.toUpperCase()) || [];
        const hasMatch = proxies.some(proxy => 
          articleSymbols.includes(proxy.toUpperCase())
        );
        
        if (hasMatch && symbolArticles.length < 3) {
          symbolArticles.push(article);
          usedArticleIds.add(article.uuid); // Mark as used
        }
      });
      
      groups.push({
        originalSymbol: symbol,
        market,
        proxySymbols: proxies,
        articles: symbolArticles
      });
    });
    
    // Sort groups by article count (symbols with more news first)
    return groups.sort((a, b) => b.articles.length - a.articles.length);
  };

  useEffect(() => {
    if (!symbolsLoading && frequentSymbols.length > 0) {
      loadNews();
    } else if (!symbolsLoading) {
      setLoading(false);
    }
  }, [frequentSymbols, symbolsLoading]);

  // Auto-translate when new news arrive or language changes
  useEffect(() => {
    const allArticles = groupedNews.flatMap(g => g.articles);
    const needsTranslation = allArticles.length > 0 && 
                            i18n.language !== 'en' && 
                            !allArticles.some(a => a.translatedTitle);
    
    if (needsTranslation && !translating) {
      console.log(`PortfolioNews: Auto-translating ${allArticles.length} articles to ${i18n.language}`);
      translateNews();
    }
  }, [groupedNews.length, i18n.language]); // Trigger when news count changes or language changes

  const loadNews = async () => {
    setLoading(true);
    setError("");

    try {
      // Smart Fetch: Convert futures/commodities to news-friendly proxies
      const mapping: Record<string, string[]> = {};
      const newsSymbols: string[] = [];
      
      frequentSymbols.slice(0, 5).forEach(s => {
        const proxies = getNewsProxies(s.symbol, s.market);
        if (proxies.length > 0) {
          mapping[s.symbol] = proxies;
          newsSymbols.push(...proxies);
        } else {
          // If no proxy, use original symbol
          mapping[s.symbol] = [s.symbol];
          newsSymbols.push(s.symbol);
        }
      });
      
      // Remove duplicates (case-insensitive)
      const uniqueSymbols = new Map<string, string>();
      newsSymbols.forEach(sym => {
        const upper = sym.toUpperCase();
        if (!uniqueSymbols.has(upper)) {
          uniqueSymbols.set(upper, sym);
        }
      });
      const topSymbols = Array.from(uniqueSymbols.values());
      
      if (topSymbols.length === 0) {
        setError(t("dashboard.noNewsProxiesAvailable"));
        setLoading(false);
        return;
      }
      
      setProxyMapping(mapping);
      console.log('PortfolioNews Smart Fetch - Original symbols:', frequentSymbols.slice(0, 5).map(s => s.symbol));
      console.log('PortfolioNews Smart Fetch - Proxy symbols:', topSymbols);
      console.log('PortfolioNews Smart Fetch - Mapping:', mapping);
      
      // Fetch news with 3-day range (handled by edge function)
      console.log('PortfolioNews: Fetching news for symbols:', topSymbols);
      
      const { data, error: functionError } = await supabase.functions.invoke('marketaux-news', {
        body: { 
          symbols: topSymbols,
          limit: 25  // Increased for better coverage across multiple symbols
        }
      });

      if (functionError) {
        console.error('Error loading news:', functionError);
        if (functionError.message?.includes('429') || functionError.message?.includes('rate limit')) {
          setError('News temporarily unavailable due to rate limits. Please try again later.');
        } else {
          setError(functionError.message);
        }
      } else if (data.success && data.articles?.length > 0) {
        const articles = data.articles;
        console.log(`PortfolioNews: Found ${articles.length} articles, cached:`, data.meta?.cached);
        
        // Debug: Log which symbols are mentioned in articles
        const mentionedSymbols = new Set<string>();
        articles.forEach(article => {
          article.entities?.forEach(entity => {
            mentionedSymbols.add(entity.symbol.toUpperCase());
          });
        });
        console.log('PortfolioNews: Symbols mentioned in articles:', Array.from(mentionedSymbols));
        console.log('PortfolioNews: Expected symbols:', topSymbols);
        
        // Group articles by original symbols
        const grouped = groupNewsBySymbol(articles, mapping, frequentSymbols.slice(0, 5));
        console.log('PortfolioNews: Grouped news:', grouped.map(g => ({ 
          symbol: g.originalSymbol, 
          articleCount: g.articles.length 
        })));
        setGroupedNews(grouped);
        setIsCached(data.meta?.cached || false);
      } else if (data.meta?.error === 'unsupported_symbols') {
        console.log('PortfolioNews: Symbols not supported by news provider');
        setError(t("dashboard.noNewsProxiesAvailable"));
      } else {
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
    const allArticles = groupedNews.flatMap(g => g.articles);
    if (allArticles.some(a => a.translatedTitle)) {
      setShowTranslated(!showTranslated);
      return;
    }

    setTranslating(true);
    try {
      const targetLang = i18n.language;
      
      // Batch translate all articles in one API call
      const articlesToTranslate = allArticles.map(article => ({
        uuid: article.uuid,
        title: article.title,
        description: article.description || ''
      }));

      console.log(`PortfolioNews: Batch translating ${articlesToTranslate.length} articles to ${targetLang}`);

      const { data, error } = await supabase.functions.invoke('translate-news', {
        body: { 
          articles: articlesToTranslate,
          targetLanguage: targetLang
        }
      });

      if (error || !data?.success) {
        console.error('Batch translation error:', error);
        toast.error(t("dashboard.translationFailed"));
        setTranslating(false);
        return;
      }

      // Map translations back to articles by UUID
      const translationMap = new Map<string, any>();
      data.translations.forEach((t: any) => {
        translationMap.set(t.uuid, t);
      });

      console.log(`PortfolioNews: Translation complete - ${data.meta.cached} cached, ${data.meta.fresh} fresh`);

      // Apply translations to grouped news
      const translatedGroups = groupedNews.map(group => ({
        ...group,
        articles: group.articles.map(article => {
          const translation = translationMap.get(article.uuid);
          if (translation) {
            return {
              ...article,
              translatedTitle: translation.translatedTitle,
              translatedDescription: translation.translatedDescription
            };
          }
          return article;
        })
      }));

      setGroupedNews(translatedGroups);
      setShowTranslated(true);
      
      if (data.meta.cached > 0) {
        toast.success(t("dashboard.newsTranslated") + ` (${data.meta.cached} cached)`);
      } else {
        toast.success(t("dashboard.newsTranslated"));
      }
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
          {groupedNews.some(g => g.articles.length > 0) && (
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
          {groupedNews.some(g => g.articles.length > 0) && (
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
          {frequentSymbols.slice(0, 5).map((s) => {
            const proxies = proxyMapping[s.symbol];
            return (
              <Badge key={s.symbol} variant="secondary" className="text-xs">
                {s.symbol}
                {proxies && proxies.length > 0 && proxies[0] !== s.symbol && (
                  <span className="ml-1 text-primary">→ {proxies.join(', ')}</span>
                )}
              </Badge>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : groupedNews.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("trades.noNewsAvailable")}</p>
        ) : (
          <Accordion type="multiple" defaultValue={[groupedNews[0]?.originalSymbol]} className="w-full">
            {groupedNews.map((group) => (
              <AccordionItem key={group.originalSymbol} value={group.originalSymbol}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="default" className="font-semibold">
                      {group.originalSymbol}
                    </Badge>
                    {group.proxySymbols[0] !== group.originalSymbol && (
                      <span className="text-xs text-muted-foreground">
                        → {t("dashboard.via")} {group.proxySymbols.join(', ')}
                      </span>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {t("dashboard.newsCount", { count: group.articles.length })}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {group.articles.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      {t("dashboard.noNewsForSymbol")}
                    </p>
                  ) : (
                    <div className="space-y-4 pt-2">
                      {group.articles.map((article, index) => {
                        const smartTags = generateSmartTags(article);
                        return (
                          <div key={`${group.originalSymbol}-${article.uuid}-${index}`} className="border-b pb-4 last:border-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="text-sm font-medium line-clamp-2 flex-1">
                                {showTranslated && article.translatedTitle ? article.translatedTitle : article.title}
                              </h4>
                              {article.sentiment && getSentimentIcon(article.sentiment)}
                            </div>
                            
                            {/* Smart Tags */}
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {smartTags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs gap-1">
                                  <Tag className="h-3 w-3" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {article.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {showTranslated && article.translatedDescription ? article.translatedDescription : article.description}
                              </p>
                            )}
                            
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(article.published_at).toLocaleString(
                                  i18n.language === 'de' ? 'de-DE' : 
                                  i18n.language === 'es' ? 'es-ES' : 
                                  i18n.language === 'fr' ? 'fr-FR' : 
                                  i18n.language === 'nl' ? 'nl-NL' : 
                                  'en-US', 
                                  { 
                                    day: '2-digit', 
                                    month: '2-digit', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }
                                )}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {article.source}
                              </Badge>
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
                        );
                      })}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
