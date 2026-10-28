import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { LucideIcon, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface KPICardWithTooltipProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tooltip?: string;
  glossaryLink?: string;
  valueColor?: "success" | "warning" | "destructive" | "default";
  trend?: {
    value: string;
    positive: boolean;
  };
  delay?: number;
}

export function KPICardWithTooltip({ 
  title, 
  value, 
  icon: Icon, 
  tooltip, 
  glossaryLink,
  valueColor,
  trend,
  delay = 0
}: KPICardWithTooltipProps) {
  const isNegativeCurrency = typeof value === 'string' && value.startsWith('$-');
  const isPositiveCurrency = typeof value === 'string' && value.startsWith('$') && !value.startsWith('$-') && parseFloat(value.substring(1)) > 0;
  
  const getEffectiveColor = () => {
    if (valueColor === "success") return 'success';
    if (valueColor === "destructive") return 'destructive';
    if (valueColor === "warning") return 'warning';
    if (valueColor === "default") return 'neutral';
    if (isNegativeCurrency) return 'destructive';
    if (isPositiveCurrency) return 'success';
    return 'neutral';
  };

  const effectiveColor = getEffectiveColor();

  const getValueColor = () => {
    if (effectiveColor === 'success') return 'text-success';
    if (effectiveColor === 'destructive') return 'text-destructive';
    if (effectiveColor === 'warning') return 'text-warning';
    return '';
  };

  const getBgClass = () => {
    if (effectiveColor === 'destructive') return 'bg-destructive/10 border-destructive/20';
    if (effectiveColor === 'success') return 'bg-success/10 border-success/20';
    if (effectiveColor === 'warning') return 'bg-warning/10 border-warning/20';
    return 'bg-card border-border/30';
  };

  const getIconBgClass = () => {
    if (effectiveColor === 'destructive') return 'bg-destructive/10';
    if (effectiveColor === 'success') return 'bg-success/10';
    if (effectiveColor === 'warning') return 'bg-warning/10';
    return 'bg-primary/10';
  };

  const getIconColor = () => {
    if (effectiveColor === 'destructive') return 'text-destructive';
    if (effectiveColor === 'success') return 'text-success';
    if (effectiveColor === 'warning') return 'text-warning';
    return 'text-primary';
  };

  return (
    <Card 
      className={`animate-fade-in border dynamic-bg ${getBgClass()} transition-colors duration-300`} 
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tooltip && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </button>
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
        <div className={`rounded-lg ${getIconBgClass()} p-2`}>
          <Icon className={`h-5 w-5 ${getIconColor()}`} />
        </div>
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
