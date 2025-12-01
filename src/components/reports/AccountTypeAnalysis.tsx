import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccountTypeStats } from "@/hooks/useAccountTypeStats";
import { useCurrency } from "@/hooks/useCurrency";
import { AccountType } from "@/types/trade";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend, LineChart, Line } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Trade {
  account_type?: AccountType | string | null;
  pnl_net: number;
  exit_time: string;
}

interface AccountTypeAnalysisProps {
  trades: Trade[];
}

const getAccountTypeLabel = (type: AccountType, t: any) => {
  const labels = {
    sim: t("accountTypes.sim"),
    evaluation: t("accountTypes.evaluation"),
    performance: t("accountTypes.performance"),
    live: t("accountTypes.live"),
  };
  return labels[type] || type;
};

const getAccountTypeEmoji = (type: AccountType) => {
  const emojis = {
    sim: "🔵",
    evaluation: "🟡",
    performance: "🟢",
    live: "🔴",
  };
  return emojis[type] || "⚪";
};

const getAccountTypeColor = (type: AccountType) => {
  const colors = {
    sim: "hsl(var(--chart-1))",
    evaluation: "hsl(var(--chart-2))",
    performance: "hsl(var(--chart-3))",
    live: "hsl(var(--chart-4))",
  };
  return colors[type] || "hsl(var(--primary))";
};

export function AccountTypeAnalysis({ trades }: AccountTypeAnalysisProps) {
  const { t } = useTranslation();
  const { formatCurrency, formatCurrencyCompact } = useCurrency();
  const stats = useAccountTypeStats(trades);

  // Prepare data for charts
  const pnlComparisonData = stats.map(stat => ({
    accountType: getAccountTypeLabel(stat.accountType, t),
    pnl: stat.totalPnL,
    color: getAccountTypeColor(stat.accountType),
  }));

  const tradeDistributionData = stats.map(stat => ({
    name: getAccountTypeLabel(stat.accountType, t),
    value: stat.trades,
    fill: getAccountTypeColor(stat.accountType),
  }));

  // Generate mini equity curves per account type
  const equityCurveData = stats.map(stat => {
    const accountTrades = trades
      .filter(t => (t.account_type || 'live') === stat.accountType)
      .sort((a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime());

    let cumulative = 0;
    const curve = accountTrades.map((trade, index) => {
      cumulative += trade.pnl_net;
      return {
        trade: index + 1,
        equity: cumulative,
      };
    });

    return {
      accountType: stat.accountType,
      label: getAccountTypeLabel(stat.accountType, t),
      curve,
      color: getAccountTypeColor(stat.accountType),
    };
  });

  return (
    <div className="space-y-6">
      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.accountTypesComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("reports.accountType")}</TableHead>
                <TableHead className="text-right">{t("reports.trades")}</TableHead>
                <TableHead className="text-right">{t("reports.winRate")}</TableHead>
                <TableHead className="text-right">{t("reports.profitFactor")}</TableHead>
                <TableHead className="text-right">{t("reports.totalPnL")}</TableHead>
                <TableHead className="text-right">{t("reports.avgTrade")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.accountType}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{getAccountTypeEmoji(stat.accountType)}</span>
                      <span className="font-medium">{getAccountTypeLabel(stat.accountType, t)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{stat.trades}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={stat.winRate >= 50 ? "default" : "destructive"}>
                      {stat.winRate.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={stat.profitFactor >= 1.5 ? "default" : stat.profitFactor >= 1 ? "secondary" : "destructive"}>
                      {stat.profitFactor === Infinity ? "∞" : stat.profitFactor.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${stat.totalPnL >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency(stat.totalPnL)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(stat.totalPnL / stat.trades)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* P&L Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.pnlByAccountType")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pnlComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="accountType" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Bar dataKey="pnl">
                  {pnlComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trade Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.tradesByAccountType")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {tradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Mini Equity Curves */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.equityCurvesByAccountType")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {equityCurveData.map((data) => (
              <div key={data.accountType} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>{getAccountTypeEmoji(data.accountType)}</span>
                  <h4 className="font-semibold">{data.label}</h4>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.curve}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trade" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line type="monotone" dataKey="equity" stroke={data.color} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
