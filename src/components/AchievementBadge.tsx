import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de, enUS, fr, es, nl, it } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/components/ui/progress';

interface AchievementProgress {
  current: number;
  target: number;
}

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  progress?: AchievementProgress;
}

const getLocale = (lang: string) => {
  switch (lang) {
    case 'de': return de;
    case 'fr': return fr;
    case 'es': return es;
    case 'nl': return nl;
    case 'it': return it;
    default: return enUS;
  }
};

export function AchievementBadge({
  icon,
  name,
  description,
  achieved,
  achievedAt,
  size = 'md',
  showTooltip = true,
  progress,
}: AchievementBadgeProps) {
  const { i18n } = useTranslation();

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const progressPercent = progress ? (progress.current / progress.target) * 100 : 0;

  const badge = (
    <div className="relative group cursor-pointer">
      <div
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-300',
          'hover:scale-110 hover:z-10',
          sizeClasses[size],
          achieved
            ? 'bg-muted/30'
            : 'bg-muted/50 opacity-50'
        )}
      >
        <span className={cn(
          'select-none transition-all duration-300',
          !achieved && 'grayscale opacity-60'
        )}>
          {icon}
        </span>
      </div>
      {/* Progress ring for locked achievements */}
      {!achieved && progress && progress.current > 0 && (
        <svg 
          className="absolute inset-0 -rotate-90" 
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-primary/30"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${progressPercent * 2.89} 289`}
            className="text-primary transition-all duration-500"
          />
        </svg>
      )}
    </div>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs z-[1000]">
        <div className="space-y-2">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {achieved && achievedAt && (
            <p className="text-xs text-primary">
              ✓ {format(new Date(achievedAt), 'dd. MMM yyyy', { 
                locale: getLocale(i18n.language)
              })}
            </p>
          )}
          {!achieved && progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Fortschritt</span>
                <span className="font-medium text-primary">{progress.current}/{progress.target}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
