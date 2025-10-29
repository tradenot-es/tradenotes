import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface Trade {
  pnl_net: number;
  exit_time: string;
}

interface StreakAnalysisProps {
  trades: Trade[];
}

export function StreakAnalysis({ trades }: StreakAnalysisProps) {
  const { t } = useTranslation();

  const streakData = useMemo(() => {
    if (trades.length === 0) {
      return {
        longestWinStreak: 0,
        longestLossStreak: 0,
        currentStreak: 0,
        currentStreakType: 'neutral' as 'win' | 'loss' | 'neutral',
        avgWinStreak: 0,
        avgLossStreak: 0,
        totalStreaks: 0
      };
    }

    // Sort trades by exit time (oldest first for proper streak calculation)
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()
    );

    let currentStreak = 0;
    let currentIsWin: boolean | null = null;
    let longestWinStreak = 0;
    let longestLossStreak = 0;
    let winStreakCount = 0;
    let lossStreakCount = 0;
    let totalWinStreakLength = 0;
    let totalLossStreakLength = 0;

    sortedTrades.forEach((trade, index) => {
      const isWin = trade.pnl_net > 0;

      if (currentIsWin === null) {
        // First trade
        currentIsWin = isWin;
        currentStreak = 1;
      } else if (currentIsWin === isWin) {
        // Continue streak
        currentStreak++;
      } else {
        // Streak ended
        if (currentIsWin) {
          longestWinStreak = Math.max(longestWinStreak, currentStreak);
          totalWinStreakLength += currentStreak;
          winStreakCount++;
        } else {
          longestLossStreak = Math.max(longestLossStreak, currentStreak);
          totalLossStreakLength += currentStreak;
          lossStreakCount++;
        }
        currentStreak = 1;
        currentIsWin = isWin;
      }

      // Last trade
      if (index === sortedTrades.length - 1) {
        if (currentIsWin) {
          longestWinStreak = Math.max(longestWinStreak, currentStreak);
          totalWinStreakLength += currentStreak;
          winStreakCount++;
        } else {
          longestLossStreak = Math.max(longestLossStreak, currentStreak);
          totalLossStreakLength += currentStreak;
          lossStreakCount++;
        }
      }
    });

    const lastTrade = sortedTrades[sortedTrades.length - 1];
    const currentStreakType = lastTrade.pnl_net > 0 ? 'win' : lastTrade.pnl_net < 0 ? 'loss' : 'neutral';

    return {
      longestWinStreak,
      longestLossStreak,
      currentStreak,
      currentStreakType,
      avgWinStreak: winStreakCount > 0 ? (totalWinStreakLength / winStreakCount).toFixed(1) : 0,
      avgLossStreak: lossStreakCount > 0 ? (totalLossStreakLength / lossStreakCount).toFixed(1) : 0,
      totalStreaks: winStreakCount + lossStreakCount
    };
  }, [trades]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t("reports.streakAnalysis")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Longest Win Streak */}
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-muted-foreground">
                {t("reports.longestWinStreak")}
              </span>
            </div>
            <div className="text-3xl font-bold text-success">
              {streakData.longestWinStreak}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("reports.avgStreak")}: {streakData.avgWinStreak}
            </div>
          </div>

          {/* Longest Loss Streak */}
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-muted-foreground">
                {t("reports.longestLossStreak")}
              </span>
            </div>
            <div className="text-3xl font-bold text-destructive">
              {streakData.longestLossStreak}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {t("reports.avgStreak")}: {streakData.avgLossStreak}
            </div>
          </div>

          {/* Current Streak */}
          <div className={`p-4 rounded-lg border ${
            streakData.currentStreakType === 'win' 
              ? 'bg-success/10 border-success/20' 
              : streakData.currentStreakType === 'loss'
              ? 'bg-destructive/10 border-destructive/20'
              : 'bg-muted/10 border-muted/20'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`h-4 w-4 ${
                streakData.currentStreakType === 'win' 
                  ? 'text-success' 
                  : streakData.currentStreakType === 'loss'
                  ? 'text-destructive'
                  : 'text-muted-foreground'
              }`} />
              <span className="text-sm font-medium text-muted-foreground">
                {t("reports.currentStreak")}
              </span>
            </div>
            <div className={`text-3xl font-bold ${
              streakData.currentStreakType === 'win' 
                ? 'text-success' 
                : streakData.currentStreakType === 'loss'
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}>
              {streakData.currentStreakType === 'win' ? '+' : streakData.currentStreakType === 'loss' ? '-' : ''}
              {streakData.currentStreak}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {streakData.currentStreakType === 'win' ? t("reports.winStreak") : 
               streakData.currentStreakType === 'loss' ? t("reports.lossStreak") : 
               t("reports.noActiveStreak")}
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {t("reports.streakInsight")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
