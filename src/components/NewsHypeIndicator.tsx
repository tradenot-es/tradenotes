import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Flame, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface HypeIndicatorProps {
  symbol: string;
  entryTime: string;
  className?: string;
}

export function NewsHypeIndicator({ symbol, entryTime, className }: HypeIndicatorProps) {
  const { t } = useTranslation();
  const [hypeLevel, setHypeLevel] = useState<"low" | "medium" | "high">("low");
  const [articleCount, setArticleCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHypeLevel();
  }, [symbol, entryTime]);

  const loadHypeLevel = async () => {
    setLoading(true);

    try {
      // Get volume for last 12 hours before entry
      const entryDate = new Date(entryTime);
      const start = new Date(entryDate.getTime() - 12 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase.functions.invoke("marketaux-news", {
        body: {
          action: "get-news-volume",
          symbols: [symbol],
          timeWindow: { start, end: entryDate.toISOString() }
        }
      });

      if (error) throw error;

      if (data?.success && data.hourlyVolume) {
        // Calculate total articles in 12h window
        const total = data.hourlyVolume.reduce((sum: number, item: any) => sum + item.count, 0);
        setArticleCount(total);

        // Determine hype level based on article count
        if (total >= 20) setHypeLevel("high");
        else if (total >= 10) setHypeLevel("medium");
        else setHypeLevel("low");
      }
    } catch (err) {
      console.error("Error loading hype level:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || hypeLevel === "low") {
    return null; // Only show if medium/high hype
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-md", className, {
      "bg-amber-500/10 border border-amber-500/30": hypeLevel === "medium",
      "bg-red-500/10 border border-red-500/30": hypeLevel === "high"
    })}>
      <Flame className={cn("h-4 w-4", {
        "text-amber-500": hypeLevel === "medium",
        "text-red-500": hypeLevel === "high"
      })} />
      <div className="flex-1">
        <p className={cn("text-xs font-medium", {
          "text-amber-600 dark:text-amber-400": hypeLevel === "medium",
          "text-red-600 dark:text-red-400": hypeLevel === "high"
        })}>
          {hypeLevel === "high" ? t("trades.hype.high") : t("trades.hype.medium")}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("trades.hype.articles", { count: articleCount })}
        </p>
      </div>
      <TrendingUp className={cn("h-4 w-4", {
        "text-amber-500": hypeLevel === "medium",
        "text-red-500": hypeLevel === "high"
      })} />
    </div>
  );
}
