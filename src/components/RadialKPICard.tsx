import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialProgress } from "@/components/RadialProgress";
import { LucideIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
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
}

export function RadialKPICard({ 
  title, 
  value, 
  displayValue,
  icon: Icon, 
  color = "primary",
  subtitle,
  tooltip,
  glossaryLink
}: RadialKPICardProps) {
  return (
    <Card className="elegant-shadow">
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
