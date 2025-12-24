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
  const isPositiveCurrency = typeof value === 'string' && value.startsWith('$') && !value.startsWith('$-');
  
  const getValueColor = () => {
    if (valueColor === "success") return 'text-success';
    if (valueColor === "warning") return 'text-warning';
    if (valueColor === "destructive") return 'text-destructive';
    if (valueColor === "default") return '';
    
    if (isNegativeCurrency) return 'text-destructive';
    if (isPositiveCurrency && parseFloat(value.substring(1)) > 0) return 'text-success';
    return '';
  };

  return (
    <Card className="animate-fade-in" style={{ animationDelay: `${delay * 0.1}s` }}>
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
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-5 w-5 text-primary" />
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
