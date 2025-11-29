import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface PoliticalArticle {
  uuid: string;
  title: string;
  snippet: string;
  url: string;
  published_at: string;
  source: string;
}

interface PoliticalEventsProps {
  date: Date;
}

export function PoliticalEvents({ date }: PoliticalEventsProps) {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<PoliticalArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadPoliticalEvents();
  }, [date]);

  const loadPoliticalEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const dateStr = date.toISOString().split('T')[0];
      
      console.log("PoliticalEvents: Fetching for", dateStr);

      // Fetch political/business news using keywords approach
      const { data, error: functionError } = await supabase.functions.invoke('marketaux-news', {
        body: { 
          action: 'get-political-events',
          date: dateStr,
          keywords: 'Trump,Fed,Powell,Biden,election,policy',
          limit: 5
        }
      });

      if (functionError) {
        console.error("PoliticalEvents: Function error", functionError);
        throw functionError;
      }

      console.log("PoliticalEvents: Response", data);

      if (data?.success) {
        setArticles(data.articles || []);
      } else {
        setError(data?.error || "No political events found");
      }
    } catch (err: any) {
      console.error('PoliticalEvents: Error loading events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            <CardTitle>Political Events</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error || articles.length === 0) {
    return null; // Don't show card if no events
  }

  return (
    <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-amber-900 dark:text-amber-100">Political Events</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Key political and policy events that may impact markets
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article, index) => (
            <div key={`${date.toISOString()}-${article.uuid}-${index}`} className="border-b border-amber-200/50 dark:border-amber-900/50 pb-4 last:border-0">
              <h4 className="text-sm font-medium line-clamp-2 mb-2">{article.title}</h4>
              {article.snippet && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {article.snippet}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs border-amber-300 dark:border-amber-800">
                  {article.source}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/30">
                  {new Date(article.published_at).toLocaleDateString()}
                </Badge>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Read More <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
