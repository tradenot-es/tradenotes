import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SentimentGaugeProps {
  symbol: string;
  side: "long" | "short";
  entryTime: string;
  className?: string;
}

export function TradeSentimentGauge({ symbol, side, entryTime, className }: SentimentGaugeProps) {
  const { t } = useTranslation();
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [articleCount, setArticleCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadSentiment();
  }, [symbol, entryTime]);

  const loadSentiment = async () => {
    setLoading(true);
    setError("");

    try {
      // Calculate 24h window before entry
      const entryDate = new Date(entryTime);
      const start = new Date(entryDate.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const end = entryDate.toISOString();

      const { data, error: functionError } = await supabase.functions.invoke("marketaux-news", {
        body: {
          action: "get-sentiment",
          symbols: [symbol],
          timeWindow: { start, end }
        }
      });

      if (functionError) throw functionError;

      if (data?.success && data.sentiment) {
        setSentiment(data.sentiment.avg_sentiment);
        setArticleCount(data.sentiment.article_count || 0);
      }
    } catch (err: any) {
      console.error("Error loading sentiment:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-2 bg-muted rounded-full w-24" />
      </div>
    );
  }

  if (error || sentiment === null) {
    return null; // Don't show if no data
  }

  // Check if contra-trade
  const isContraTrade = (side === "long" && sentiment < -0.2) || (side === "short" && sentiment > 0.2);
  const sentimentPercent = ((sentiment + 1) / 2) * 100; // Convert -1/+1 to 0-100%

  const getSentimentLabel = () => {
    if (sentiment < -0.3) return t("trades.sentiment.veryBearish");
    if (sentiment < -0.1) return t("trades.sentiment.bearish");
    if (sentiment > 0.3) return t("trades.sentiment.veryBullish");
    if (sentiment > 0.1) return t("trades.sentiment.bullish");
    return t("trades.sentiment.neutral");
  };

  const getSentimentIcon = () => {
    if (sentiment < -0.1) return <TrendingDown className="h-3 w-3 text-red-500" />;
    if (sentiment > 0.1) return <TrendingUp className="h-3 w-3 text-green-500" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getSentimentColor = () => {
    if (sentiment < -0.1) return "text-red-500";
    if (sentiment > 0.1) return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-2 cursor-help", className)}>
            {getSentimentIcon()}
            <span className={cn("text-xs font-medium", getSentimentColor())}>
              {getSentimentLabel()}
            </span>
            {articleCount === 0 && (
              <span className="text-xs text-muted-foreground/50">
                ({t("trades.sentiment.noNews")})
              </span>
            )}
            <HelpCircle className="h-3 w-3 text-muted-foreground/50" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{t("trades.sentiment.tooltipTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("trades.sentiment.tooltipDescription")}
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-border">
              <span className="text-xs">{t("trades.sentiment.score")}: <strong>{sentiment.toFixed(2)}</strong></span>
              <span className="text-xs text-muted-foreground">({articleCount} {t("trades.sentiment.articles")})</span>
            </div>
            {/* Mini Gauge */}
            <div className="relative w-full h-1.5 bg-gradient-to-r from-red-500 via-gray-300 to-green-500 rounded-full">
              <div
                className="absolute top-0 w-0.5 h-full bg-foreground shadow"
                style={{ left: `${sentimentPercent}%`, transform: "translateX(-50%)" }}
              />
            </div>
            {isContraTrade && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {t("trades.sentiment.contraTradeShort")}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
