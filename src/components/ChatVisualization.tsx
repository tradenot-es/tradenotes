import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Visualization {
  type: "bar" | "line" | "pie" | "table";
  title: string;
  data: Record<string, any>[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  columns?: string[];
}

interface ChatVisualizationProps {
  visualization: Visualization;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--warning))",
  "hsl(var(--destructive))",
  "hsl(var(--accent))",
  "hsl(210, 70%, 50%)",
  "hsl(280, 60%, 50%)",
];

export const ChatVisualization = ({ visualization }: ChatVisualizationProps) => {
  const { t } = useTranslation();
  const { type, title, data, xKey, yKey, labelKey, valueKey, columns } = visualization;

  if (!data || data.length === 0) {
    return null;
  }

  const renderBarChart = () => {
    const xDataKey = xKey || Object.keys(data[0])[0];
    const yDataKey = yKey || Object.keys(data[0])[1];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 11 }} 
            angle={-45} 
            textAnchor="end"
            height={50}
            className="fill-muted-foreground"
          />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Bar dataKey={yDataKey} radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLineChart = () => {
    const xDataKey = xKey || Object.keys(data[0])[0];
    const yDataKey = yKey || Object.keys(data[0])[1];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey={xDataKey} 
            tick={{ fontSize: 11 }}
            className="fill-muted-foreground"
          />
          <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey={yDataKey}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderPieChart = () => {
    const nameKey = labelKey || Object.keys(data[0])[0];
    const dataKey = valueKey || Object.keys(data[0])[1];

    return (
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={40}
            paddingAngle={2}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderTable = () => {
    const tableColumns = columns || Object.keys(data[0]);

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map((col) => (
                <TableHead key={col} className="text-xs font-medium">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((row, idx) => (
              <TableRow key={idx}>
                {tableColumns.map((col) => (
                  <TableCell key={col} className="text-xs py-2">
                    {typeof row[col] === "number"
                      ? row[col].toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : row[col]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data.length > 10 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {t("assistant.showingTopResults", { count: 10, total: data.length })}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
      {title && (
        <h4 className="text-xs font-medium text-muted-foreground mb-2">{title}</h4>
      )}
      {type === "bar" && renderBarChart()}
      {type === "line" && renderLineChart()}
      {type === "pie" && renderPieChart()}
      {type === "table" && renderTable()}
    </div>
  );
};
