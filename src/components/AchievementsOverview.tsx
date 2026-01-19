import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AchievementBadge } from './AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export function AchievementsOverview() {
  const { achievements, loading, checkAchievements } = useAchievements();
  const { t } = useTranslation();
  const [isChecking, setIsChecking] = useState(false);

  const achievedCount = achievements.filter(a => a.achieved).length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (achievedCount / totalCount) * 100 : 0;

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      const newCount = await checkAchievements();
      if (newCount > 0) {
        toast.success(t('achievements.newUnlocked', `${newCount} neue(s) Achievement(s) freigeschaltet! 🎉`));
      } else {
        toast.info(t('achievements.noNew', 'Keine neuen Achievements. Weiter so!'));
      }
    } finally {
      setIsChecking(false);
    }
  };

  // Sort: achieved first (by date), then locked
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.achieved && !b.achieved) return -1;
    if (!a.achieved && b.achieved) return 1;
    if (a.achieved && b.achieved) {
      return new Date(b.achievedAt!).getTime() - new Date(a.achievedAt!).getTime();
    }
    return 0;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {t('achievements.title', 'Achievements')}
            </CardTitle>
            <CardDescription className="mt-1">
              {t('achievements.subtitle', 'Deine Trading-Meilensteine')}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCheck}
            disabled={isChecking}
            className="gap-2"
          >
            {isChecking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {t('achievements.check', 'Prüfen')}
          </Button>
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {t('achievements.progress', 'Fortschritt')}
            </span>
            <span className="font-medium">{achievedCount} / {totalCount}</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 py-2">
            {sortedAchievements.map((achievement) => (
              <div
                key={achievement.type}
                className="flex flex-col items-center gap-2"
              >
                <AchievementBadge
                  icon={achievement.icon}
                  name={achievement.name}
                  description={achievement.description}
                  achieved={achievement.achieved}
                  achievedAt={achievement.achievedAt}
                  progress={achievement.progress}
                  size="lg"
                />
                <span className={`text-xs text-center line-clamp-2 ${
                  achievement.achieved ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {achievement.name}
                </span>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
