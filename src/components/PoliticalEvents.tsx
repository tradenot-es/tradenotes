import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalLink, Calendar, Landmark, BarChart3, Users, TrendingUp, Globe, Fuel, Vote, Info } from "lucide-react";
import { getCategoryIcon, getCategoryLabel } from "@/lib/economicCalendar";
import type { PoliticalEvent } from "@/hooks/usePoliticalEvents";

interface PoliticalEventsProps {
  date: Date;
  events: PoliticalEvent[];
  loading?: boolean;
  hasAnyEventsInPeriod?: boolean;
}

export function PoliticalEvents({ date, events, loading, hasAnyEventsInPeriod }: PoliticalEventsProps) {
  const { t } = useTranslation();

  const getImpactBadge = (impact?: 'high' | 'medium' | 'low' | 'political') => {
    const getTooltipContent = () => {
      switch (impact) {
        case 'high':
          return t("calendar.impactHighTooltip");
        case 'medium':
          return t("calendar.impactMediumTooltip");
        case 'low':
          return t("calendar.impactLowTooltip");
        default:
          return t("calendar.impactPoliticalTooltip");
      }
    };

    const badge = (() => {
      switch (impact) {
        case 'high':
          return <Badge variant="destructive" className="text-xs">{t("calendar.highImpact")}</Badge>;
        case 'medium':
          return <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300">{t("calendar.mediumImpact")}</Badge>;
        case 'low':
          return <Badge variant="outline" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{t("calendar.lowImpact")}</Badge>;
        default:
          return <Badge variant="outline" className="text-xs">{t("calendar.political")}</Badge>;
      }
    })();

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center gap-1 cursor-help">
              {badge}
              <Info className="h-3 w-3 text-muted-foreground" />
            </span>
          </TooltipTrigger>
          <TooltipContent className="z-[1000]">
            <p className="max-w-xs text-sm">{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getCategoryIconComponent = (category?: string) => {
    switch (category) {
      case 'fomc':
        return <Landmark className="h-4 w-4 text-blue-600" />;
      case 'cpi':
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case 'nfp':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'gdp':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'summit':
        return <Globe className="h-4 w-4 text-cyan-600" />;
      case 'ecb':
        return <Landmark className="h-4 w-4 text-yellow-600" />;
      case 'boe':
        return <Landmark className="h-4 w-4 text-red-700" />;
      case 'boj':
        return <Landmark className="h-4 w-4 text-rose-600" />;
      case 'opec':
        return <Fuel className="h-4 w-4 text-amber-700" />;
      case 'election':
        return <Vote className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

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

  // Separate scheduled events from news
  const scheduledEvents = events.filter(e => e.isScheduled);
  const newsEvents = events.filter(e => !e.isScheduled);

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
    <div className="space-y-4">
      {/* Scheduled Economic Events */}
      {scheduledEvents.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-900 dark:text-blue-100 text-base">
                {t("calendar.scheduledEvents")}
              </CardTitle>
              <Badge variant="outline" className="ml-auto text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700">
                {t("calendar.confirmed")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {scheduledEvents.map((event, index) => (
                <div key={`${date.toISOString()}-${event.uuid}-${index}`} className="border-b border-blue-200/50 dark:border-blue-900/50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    {getCategoryIconComponent(event.category)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{event.title}</h4>
                      {event.snippet && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {event.snippet}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {getImpactBadge(event.impact_level)}
                        {event.category && (
                          <Badge variant="outline" className="text-xs border-blue-300 dark:border-blue-800">
                            {getCategoryLabel(event.category)}
                          </Badge>
                        )}
                        {event.time && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30">
                            {event.time} EST
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* News Events */}
      {newsEvents.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📰</span>
              <CardTitle className="text-amber-900 dark:text-amber-100 text-base">
                {t("calendar.relatedNews")}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {newsEvents.map((article, index) => (
                <div key={`${date.toISOString()}-${article.uuid}-${index}`} className="border-b border-amber-200/50 dark:border-amber-900/50 pb-3 last:border-0 last:pb-0">
                  <h4 className="text-sm font-medium line-clamp-2 mb-1">{article.title}</h4>
                  {article.snippet && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {article.snippet}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getImpactBadge(article.impact_level)}
                    <Badge variant="outline" className="text-xs border-amber-300 dark:border-amber-800">
                      {article.source}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-amber-100 dark:bg-amber-900/30">
                      {new Date(article.published_at).toLocaleDateString()}
                    </Badge>
                    {article.url && (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        {t("common.readMore")} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
