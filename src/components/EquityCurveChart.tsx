import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface DataPoint {
  date: string;
  equity: number;
}

interface EquityCurveChartProps {
  data: DataPoint[];
}

export function EquityCurveChart({ data }: EquityCurveChartProps) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();

  const formatYAxis = (value: number) => {
    return `${symbol}${value.toLocaleString()}`;
  };

  const calculateYAxisDomain = () => {
    if (data.length === 0) return [0, 100];
    const values = data.map(d => d.equity);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  };

  const calculateYAxisTicks = () => {
    const [min, max] = calculateYAxisDomain();
    const range = max - min;
    const tickCount = 8;
    const rawStep = range / (tickCount - 1);
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
    const step = Math.ceil(rawStep / magnitude) * magnitude;
    const ticks = [];
    for (let i = Math.floor(min / step) * step; i <= max; i += step) {
      ticks.push(i);
    }
    return ticks;
  };
  
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
              <a 
                href="/dashboard/glossary#equity-curve" 
                className="text-xs text-primary hover:underline mt-2 block"
              >
                Learn more in glossary →
              </a>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
              minTickGap={30}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              tickFormatter={formatYAxis}
              domain={calculateYAxisDomain()}
              ticks={calculateYAxisTicks()}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--primary))",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)",
              }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
