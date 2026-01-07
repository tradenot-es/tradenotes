import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  achieved: boolean;
  achievedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function AchievementBadge({
  icon,
  name,
  description,
  achieved,
  achievedAt,
  size = 'md',
  showTooltip = true,
}: AchievementBadgeProps) {
  const { i18n } = useTranslation();

  const sizeClasses = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
  };

  const badge = (
    <div
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-300',
        sizeClasses[size],
        achieved
          ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300/50'
          : 'bg-muted/50 grayscale opacity-40'
      )}
    >
      <span className={cn('select-none', !achieved && 'opacity-50')}>
        {icon}
      </span>
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
      <TooltipContent className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {achieved && achievedAt && (
            <p className="text-xs text-primary">
              ✓ {format(new Date(achievedAt), 'dd. MMM yyyy', { 
                locale: i18n.language === 'de' ? de : undefined 
              })}
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
