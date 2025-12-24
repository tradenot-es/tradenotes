import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  delay?: number;
}

export function KPICard({ title, value, icon: Icon, trend, delay = 0 }: KPICardProps) {
  const isNegativeCurrency = typeof value === 'string' && value.startsWith('$-');
  const isPositiveCurrency = typeof value === 'string' && value.startsWith('$') && !value.startsWith('$-') && parseFloat(value.substring(1)) > 0;
  
  const getValueColor = () => {
    if (isNegativeCurrency) return 'text-destructive';
    if (isPositiveCurrency) return 'text-success';
    return '';
  };

  const getBgClass = () => {
    if (isNegativeCurrency) return 'bg-destructive/10 border-destructive/20';
    if (isPositiveCurrency) return 'bg-success/10 border-success/20';
    return 'bg-card border-border/30';
  };

  const getIconBgClass = () => {
    if (isNegativeCurrency) return 'bg-destructive/10';
    if (isPositiveCurrency) return 'bg-success/10';
    return 'bg-primary/10';
  };

  const getIconColor = () => {
    if (isNegativeCurrency) return 'text-destructive';
    if (isPositiveCurrency) return 'text-success';
    return 'text-primary';
  };

  return (
    <Card 
      className={`animate-fade-in border dynamic-bg ${getBgClass()} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`} 
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
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
