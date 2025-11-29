import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface NewsContextProps {
  symbol: string;
  entryTime: string;
  className?: string;
}

interface TopStory {
  title: string;
  url: string;
  match_score: number;
  highlight: string;
  entity_types: string[];
}

export function TradeNewsContext({ symbol, entryTime, className }: NewsContextProps) {
  const { t } = useTranslation();
  const [topStory, setTopStory] = useState<TopStory | null>(null);
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewsContext();
  }, [symbol, entryTime]);

  const loadNewsContext = async () => {
    setLoading(true);

    try {
      // Get news ±1h around entry time
      const entryDate = new Date(entryTime);
      const start = new Date(entryDate.getTime() - 60 * 60 * 1000).toISOString();
      const end = new Date(entryDate.getTime() + 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.functions.invoke("marketaux-news", {
        body: {
          symbols: [symbol],
          timeWindow: { start, end },
          limit: 5
        }
      });

      if (error) throw error;

      if (data?.success && data.articles?.length > 0) {
        // Find article with highest match_score > 10
        const relevantArticles = data.articles.filter((article: any) => {
          const entity = article.entities?.find((e: any) => e.symbol === symbol);
          return entity && entity.match_score > 10;
        });

        if (relevantArticles.length > 0) {
          const bestArticle = relevantArticles.reduce((best: any, current: any) => {
            const bestEntity = best.entities?.find((e: any) => e.symbol === symbol);
            const currentEntity = current.entities?.find((e: any) => e.symbol === symbol);
            return (currentEntity?.match_score || 0) > (bestEntity?.match_score || 0) ? current : best;
          });

          const entity = bestArticle.entities.find((e: any) => e.symbol === symbol);
          const highlight = entity?.highlights?.[0]?.highlight || bestArticle.snippet;

          setTopStory({
            title: bestArticle.title,
            url: bestArticle.url,
            match_score: entity?.match_score || 0,
            highlight: highlight,
            entity_types: bestArticle.entities.map((e: any) => e.type).filter(Boolean)
          });

          // Generate auto-tags based on entity types
          const entityTypes = bestArticle.entities.map((e: any) => e.type).filter(Boolean);
          const tags: string[] = [];
          if (entityTypes.includes("earnings")) tags.push("Earnings Play");
          if (entityTypes.includes("macro")) tags.push("Macro Event");
          if (entityTypes.includes("politics")) tags.push("Political Catalyst");
          if (tags.length === 0 && entity?.match_score > 50) tags.push("News Catalyst");

          setAutoTags(tags);
        }
      }
    } catch (err) {
      console.error("Error loading news context:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  if (!topStory) {
    return null;
  }

  return (
    <div className={className}>
      <div className="space-y-2 p-3 rounded-lg border border-border bg-card/50">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-sm font-medium line-clamp-2">{topStory.title}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                "{topStory.highlight}"
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {t("trades.newsContext.match")}: {topStory.match_score}%
              </Badge>
              {autoTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  🏷️ {tag}
                </Badge>
              ))}
            </div>

            <a
              href={topStory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              {t("common.readMore")} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
