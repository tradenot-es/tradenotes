import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, ChevronDown, ChevronUp, Loader2, Calendar, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";
import { db, invoke } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { Badge } from "@/components/ui/badge";

interface DailySummary {
  id: string;
  date: string;
  summary_text: string;
  highlights: {
    bestTrade?: { symbol: string; pnl: number };
    worstTrade?: { symbol: string; pnl: number };
    mostTradedSymbol?: string;
    bestHour?: string;
    worstHour?: string;
  };
  suggestions: string[];
  trades_count: number;
  net_pnl: number;
}

interface DailySummaryCardProps {
  selectedDate?: Date;
}

export const DailySummaryCard = ({ selectedDate }: DailySummaryCardProps) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const dateToUse = selectedDate || new Date();
  const formattedDate = format(dateToUse, "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      loadSummary();
    }
  }, [user, formattedDate]);

  const loadSummary = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await db
      .from("daily_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", formattedDate)
      .maybeSingle();

    if (!error && data) {
      setSummary({
        ...data,
        highlights: data.highlights as DailySummary["highlights"],
        suggestions: data.suggestions as string[],
      });
    } else {
      setSummary(null);
    }
    setLoading(false);
  };

  const generateSummary = async () => {
    if (!user) return;
    setGenerating(true);

    try {
      const { data, error } = await invoke("daily-summary", {
        body: { date: formattedDate },
      });

      if (error) throw error;

      if (data.summary) {
        setSummary(data.summary);
        toast.success(t("dailySummary.generated"));
      } else if (data.message) {
        toast.info(data.message);
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(t("dailySummary.generateError"));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            {t("dailySummary.title")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {format(dateToUse, "dd.MM.yyyy")}
            </Badge>
            {!summary && (
              <Button
                size="sm"
                onClick={generateSummary}
                disabled={generating}
                className="gap-2"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? t("dailySummary.generating") : t("dailySummary.generate")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {summary ? (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            {/* Quick Stats */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("dailySummary.trades")}:</span>
                <span className="font-semibold">{summary.trades_count}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("dailySummary.netPnL")}:</span>
                <span className={`font-semibold ${summary.net_pnl >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(summary.net_pnl)}
                </span>
              </div>
            </div>

            {/* Summary Text */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{summary.summary_text}</p>
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full gap-2">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    {t("dailySummary.showLess")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    {t("dailySummary.showMore")}
                  </>
                )}
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 pt-4">
              {/* Highlights */}
              {summary.highlights && Object.keys(summary.highlights).length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {summary.highlights.bestTrade && (
                    <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 text-success mb-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-xs font-medium">{t("dailySummary.bestTrade")}</span>
                      </div>
                      <div className="font-semibold">{summary.highlights.bestTrade.symbol}</div>
                      <div className="text-sm text-success">
                        +{formatCurrency(summary.highlights.bestTrade.pnl)}
                      </div>
                    </div>
                  )}
                  {summary.highlights.worstTrade && (
                    <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-2 text-destructive mb-1">
                        <TrendingDown className="h-4 w-4" />
                        <span className="text-xs font-medium">{t("dailySummary.worstTrade")}</span>
                      </div>
                      <div className="font-semibold">{summary.highlights.worstTrade.symbol}</div>
                      <div className="text-sm text-destructive">
                        {formatCurrency(summary.highlights.worstTrade.pnl)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {summary.suggestions && summary.suggestions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    {t("dailySummary.suggestions")}
                  </div>
                  <ul className="space-y-2">
                    {summary.suggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/30"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Regenerate Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={generateSummary}
                disabled={generating}
                className="w-full gap-2"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {t("dailySummary.regenerate")}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="text-center py-6">
            <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {t("dailySummary.noSummary")}
            </p>
            <Button onClick={generateSummary} disabled={generating} className="gap-2">
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating ? t("dailySummary.generating") : t("dailySummary.generate")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
