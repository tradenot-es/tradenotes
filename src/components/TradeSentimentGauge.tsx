import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface SentimentGaugeProps {
  symbol: string;
  side: "long" | "short";
  entryTime: string;
  className?: string;
}

export function TradeSentimentGauge({ symbol, side, entryTime, className }: SentimentGaugeProps) {
  const { t } = useTranslation();
  const [sentiment, setSentiment] = useState<number | null>(null);
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
        <div className="h-2 bg-muted rounded-full w-full" />
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
    if (sentiment < -0.1) return <TrendingDown className="h-4 w-4 text-red-500" />;
    if (sentiment > 0.1) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getSentimentIcon()}
          <span className="text-sm font-medium">
            {t("trades.sentiment.label")}: {getSentimentLabel()}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {sentiment.toFixed(2)}
        </span>
      </div>

      {/* Sentiment Gauge */}
      <div className="relative w-full h-2 bg-gradient-to-r from-red-500 via-gray-300 to-green-500 rounded-full overflow-hidden">
        <div
          className="absolute top-0 w-1 h-full bg-foreground/80 shadow-lg"
          style={{ left: `${sentimentPercent}%`, transform: "translateX(-50%)" }}
        />
      </div>

      {/* Contra-Trade Warning */}
      {isContraTrade && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/30">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-xs text-amber-600 dark:text-amber-400">
            <strong>{t("trades.sentiment.highRisk")}:</strong> {t("trades.sentiment.contraTrade")}
          </p>
        </div>
      )}
    </div>
  );
}
