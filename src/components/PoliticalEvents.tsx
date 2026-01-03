import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, UserCircle } from "lucide-react";

interface PoliticalArticle {
  uuid: string;
  title: string;
  snippet: string;
  url: string;
  published_at: string;
  source: string;
  date?: string;
}

interface PoliticalEventsProps {
  date: Date;
  events: PoliticalArticle[];
  loading?: boolean;
  hasAnyEventsInPeriod?: boolean;
}

export function PoliticalEvents({ date, events, loading, hasAnyEventsInPeriod }: PoliticalEventsProps) {
  const { t } = useTranslation();

  // Show loading state
  if (loading) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {t("calendar.loadingPoliticalEvents")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show message when no events for this specific day
  if (!events || events.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {hasAnyEventsInPeriod 
              ? t("calendar.noPoliticalEventsOnDate")
              : t("calendar.noPoliticalEventsInPeriod")
            }
          </p>
        </CardContent>
      </Card>
    );
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
          {events.map((article, index) => (
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
