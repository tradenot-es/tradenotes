import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface DataPoint {
  date: string;
  equity: number;
}

interface EquityCurveChartProps {
  data: DataPoint[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  const { t } = useTranslation();
  
  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{t("dashboard.equityCurve")}</CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("dashboard.equityCurveTooltip")}</p>
              <Link 
                to="/glossary#equity-curve" 
                className="text-xs text-primary hover:underline mt-2 block"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = "/glossary#equity-curve";
                }}
              >
                Learn more in glossary →
              </Link>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--primary))",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)",
              }}
            />
            <Line
              type="monotone"
              dataKey="equity"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={false}
              fill="url(#equityGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
