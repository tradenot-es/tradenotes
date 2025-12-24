import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";

interface DataPoint {
  period: string;
  pnl: number;
}

interface PnLChartProps {
  data: DataPoint[];
  title: string;
}

export function PnLChart({ data, title }: PnLChartProps) {
  const { t } = useTranslation();
  const { symbol } = useCurrency();

  const formatYAxis = (value: number) => {
    return `${symbol}${value.toLocaleString()}`;
  };

  const formatLabel = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('de-DE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return `${symbol}${formatted}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.period}</p>
          <p className={`text-lg font-bold ${value >= 0 ? 'text-success' : 'text-destructive'}`}>
            {value >= 0 ? '+' : ''}{formatLabel(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="elegant-shadow">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <HoverCard>
            <HoverCardTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{t("dashboard.pnlChartTooltip")}</p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="period" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12}
              tickLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                  opacity={0.9}
                />
              ))}
              <LabelList
                dataKey="pnl"
                position="top"
                formatter={formatLabel}
                style={{
                  fill: "hsl(var(--foreground))",
                  fontSize: "11px",
                  fontWeight: "600"
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
