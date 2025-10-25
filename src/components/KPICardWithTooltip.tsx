import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { LucideIcon, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface KPICardWithTooltipProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tooltip?: string;
  glossaryLink?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function KPICardWithTooltip({ 
  title, 
  value, 
  icon: Icon, 
  tooltip, 
  glossaryLink,
  trend 
}: KPICardWithTooltipProps) {
  const isNegativeCurrency = typeof value === 'string' && value.startsWith('$-');
  const isPositiveCurrency = typeof value === 'string' && value.startsWith('$') && !value.startsWith('$-');
  
  const getValueColor = () => {
    if (isNegativeCurrency) return 'text-destructive';
    if (isPositiveCurrency && parseFloat(value.substring(1)) > 0) return 'text-success';
    return '';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tooltip && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p className="text-sm">{tooltip}</p>
                {glossaryLink && (
                  <Link 
                    to={glossaryLink} 
                    className="text-xs text-primary hover:underline mt-2 block"
                  >
                    Learn more in glossary →
                  </Link>
                )}
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getValueColor()}`}>{value}</div>
        {trend && (
          <p className={`text-xs ${trend.positive ? "text-success" : "text-destructive"}`}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
