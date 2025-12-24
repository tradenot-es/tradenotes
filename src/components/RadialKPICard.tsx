import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialProgress } from "@/components/RadialProgress";
import { LucideIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface RadialKPICardProps {
  title: string;
  value: number; // 0-100 for percentage
  displayValue?: string;
  icon: LucideIcon;
  color?: "success" | "primary" | "warning" | "destructive";
  subtitle?: string;
  tooltip?: string;
  glossaryLink?: string;
  delay?: number;
}

export function RadialKPICard({ 
  title, 
  value, 
  displayValue,
  icon: Icon, 
  color = "primary",
  subtitle,
  tooltip,
  glossaryLink,
  delay = 0
}: RadialKPICardProps) {
  const getBgClass = () => {
    if (color === 'destructive') return 'bg-destructive/10 border-destructive/20';
    if (color === 'success') return 'bg-success/10 border-success/20';
    if (color === 'warning') return 'bg-warning/10 border-warning/20';
    return 'bg-primary/10 border-primary/20';
  };

  const getIconBgClass = () => {
    if (color === 'destructive') return 'bg-destructive/10';
    if (color === 'success') return 'bg-success/10';
    if (color === 'warning') return 'bg-warning/10';
    return 'bg-primary/10';
  };

  const getIconColor = () => {
    if (color === 'destructive') return 'text-destructive';
    if (color === 'success') return 'text-success';
    if (color === 'warning') return 'text-warning';
    return 'text-primary';
  };

  return (
    <Card 
      className={`elegant-shadow animate-fade-in border dynamic-bg ${getBgClass()} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`} 
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tooltip && (
            <HoverCard>
              <HoverCardTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
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
      <CardContent className="flex justify-center">
        <RadialProgress
          value={Math.max(0, Math.min(100, value))}
          size={120}
          strokeWidth={8}
          color={color}
          subtitle={displayValue || subtitle}
        />
      </CardContent>
    </Card>
  );
}
