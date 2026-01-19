import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementBadge } from './AchievementBadge';
import { useAchievements } from '@/hooks/useAchievements';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Trophy, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AchievementsWidget() {
  const { achievements, loading } = useAchievements();
  const { t } = useTranslation();

  const achievedCount = achievements.filter(a => a.achieved).length;
  const totalCount = achievements.length;

  // Get latest achievements first, then show locked ones
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.achieved && !b.achieved) return -1;
    if (!a.achieved && b.achieved) return 1;
    if (a.achieved && b.achieved) {
      return new Date(b.achievedAt!).getTime() - new Date(a.achievedAt!).getTime();
    }
    return 0;
  });

  // Show all achievements in scrollable area
  const displayAchievements = sortedAchievements;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="w-14 h-14 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            {t('achievements.title', 'Achievements')}
            <span className="text-sm font-normal text-muted-foreground">
              ({achievedCount}/{totalCount})
            </span>
          </CardTitle>
          <Link to="/dashboard/account">
            <Button variant="ghost" size="sm" className="h-8 gap-1">
              {t('common.viewAll', 'Alle anzeigen')}
              <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex gap-1.5 overflow-hidden">
            {displayAchievements.map((achievement) => (
              <div key={achievement.type} className="flex-shrink-0">
                <AchievementBadge
                  icon={achievement.icon}
                  name={achievement.name}
                  description={achievement.description}
                  achieved={achievement.achieved}
                  achievedAt={achievement.achievedAt}
                  progress={achievement.progress}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </TooltipProvider>
        
        {achievedCount === 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            {t('achievements.noAchievements', 'Starte mit dem Trading um Achievements freizuschalten!')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
