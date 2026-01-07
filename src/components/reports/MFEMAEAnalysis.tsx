import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Info } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface Trade {
  id: string;
  symbol: string;
  side: string;
  entry_price: number;
  exit_price: number;
  mfe_price?: number | null;
  mae_price?: number | null;
  pnl_net: number;
}

interface MFEMAEAnalysisProps {
  trades: Trade[];
}

export function MFEMAEAnalysis({ trades }: MFEMAEAnalysisProps) {
  const { t } = useTranslation();

  // Filter trades with MFE/MAE data
  const tradesWithData = useMemo(() => {
    return trades.filter(trade => 
      trade.mfe_price != null && 
      trade.mae_price != null &&
      trade.entry_price > 0
    ).map(trade => {
      const isLong = trade.side === 'long';
      
      // Calculate MFE% and MAE%
      const mfePercent = isLong
        ? ((trade.mfe_price! - trade.entry_price) / trade.entry_price) * 100
        : ((trade.entry_price - trade.mfe_price!) / trade.entry_price) * 100;
      
      const maePercent = isLong
        ? ((trade.entry_price - trade.mae_price!) / trade.entry_price) * 100
        : ((trade.mae_price! - trade.entry_price) / trade.entry_price) * 100;

      // Calculate exit percent
      const exitPercent = isLong
        ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
        : ((trade.entry_price - trade.exit_price) / trade.entry_price) * 100;

      // Missed profit = MFE% - Exit%
      const missedProfit = mfePercent - exitPercent;

      return {
        ...trade,
        mfePercent: Math.max(0, mfePercent),
        maePercent: Math.max(0, maePercent),
        exitPercent,
        missedProfit,
        isWin: trade.pnl_net > 0,
      };
    });
  }, [trades]);

  // Statistics
  const stats = useMemo(() => {
    if (tradesWithData.length === 0) return null;

    const wins = tradesWithData.filter(t => t.isWin);
    const losses = tradesWithData.filter(t => !t.isWin);

    const avgMFE = tradesWithData.reduce((sum, t) => sum + t.mfePercent, 0) / tradesWithData.length;
    const avgMAE = tradesWithData.reduce((sum, t) => sum + t.maePercent, 0) / tradesWithData.length;
    const avgMissedProfit = tradesWithData.reduce((sum, t) => sum + t.missedProfit, 0) / tradesWithData.length;

    // Optimal stop-loss calculation (80th percentile of winning trades' MAE)
    const winningMAEs = wins.map(t => t.maePercent).sort((a, b) => a - b);
    const percentile80Index = Math.floor(winningMAEs.length * 0.8);
    const optimalStop = winningMAEs[percentile80Index] || avgMAE;

    return {
      totalTrades: tradesWithData.length,
      avgMFE,
      avgMAE,
      avgMissedProfit,
      optimalStop,
      winAvgMFE: wins.length > 0 ? wins.reduce((sum, t) => sum + t.mfePercent, 0) / wins.length : 0,
      lossAvgMAE: losses.length > 0 ? losses.reduce((sum, t) => sum + t.maePercent, 0) / losses.length : 0,
    };
  }, [tradesWithData]);

  // MAE Distribution for histogram
  const maeDistribution = useMemo(() => {
    const bins = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5];
    const counts = bins.map(bin => ({
      range: `<${bin}%`,
      count: tradesWithData.filter(t => t.maePercent < bin).length,
      wins: tradesWithData.filter(t => t.maePercent < bin && t.isWin).length,
    }));
    return counts;
  }, [tradesWithData]);

  // Top missed profit trades
  const topMissedProfitTrades = useMemo(() => {
    return [...tradesWithData]
      .filter(t => t.missedProfit > 0)
      .sort((a, b) => b.missedProfit - a.missedProfit)
      .slice(0, 5);
  }, [tradesWithData]);

  if (tradesWithData.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t('mfeMAE.title', 'MFE/MAE Analyse')}
            </CardTitle>
            <CardDescription>
              {t('mfeMAE.setupSubtitle', 'Optimiere deine Stop-Loss und Take-Profit Strategien mit datenbasierter Analyse')}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* What is MFE/MAE */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                {t('mfeMAE.whatIsMFE', 'Was ist MFE?')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <strong className="text-emerald-500">Maximum Favorable Excursion</strong> – {t('mfeMAE.mfeExplanation', 'Wie weit lief dein Trade maximal ins Plus, bevor du ausgestiegen bist?')}
              </p>
              <div className="mt-3 p-2 rounded bg-background/50 text-xs">
                <span className="text-muted-foreground">{t('mfeMAE.example', 'Beispiel')}:</span> {t('mfeMAE.mfeExample', 'Entry bei $100, Höchststand $112, Exit bei $108 → MFE = 12%')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                {t('mfeMAE.whatIsMAE', 'Was ist MAE?')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                <strong className="text-red-500">Maximum Adverse Excursion</strong> – {t('mfeMAE.maeExplanation', 'Wie weit lief dein Trade maximal gegen dich?')}
              </p>
              <div className="mt-3 p-2 rounded bg-background/50 text-xs">
                <span className="text-muted-foreground">{t('mfeMAE.example', 'Beispiel')}:</span> {t('mfeMAE.maeExample', 'Entry bei $100, Tiefststand $95, Exit bei $108 → MAE = 5%')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why is it important */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              {t('mfeMAE.whyImportant', 'Warum ist das wichtig?')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('mfeMAE.benefit1Title', 'Stop-Loss optimieren')}</p>
                  <p className="text-xs text-muted-foreground">{t('mfeMAE.benefit1', 'Finde den optimalen Stop-Loss basierend auf echten Daten')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('mfeMAE.benefit2Title', 'Take-Profit verbessern')}</p>
                  <p className="text-xs text-muted-foreground">{t('mfeMAE.benefit2', 'Sieh wie viel Gewinn du "auf dem Tisch lässt"')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t('mfeMAE.benefit3Title', 'Verhalten analysieren')}</p>
                  <p className="text-xs text-muted-foreground">{t('mfeMAE.benefit3', 'Steigst du zu früh aus oder hältst du Verlierer zu lange?')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to enable */}
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">!</span>
              {t('mfeMAE.howToEnable', 'So aktivierst du diese Funktion')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('mfeMAE.requiresData', 'Diese Analyse benötigt High/Low-Preisdaten während des Trades, die nur deine Trading-Plattform automatisch tracken kann.')}
            </p>
            
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="font-medium text-sm mb-2">{t('mfeMAE.ninjaTraderTitle', 'NinjaTrader Benutzer')}</p>
              <p className="text-xs text-muted-foreground mb-3">
                {t('mfeMAE.ninjaTraderHint', 'Erweitere dein TradeNotesSync Script um highDuringTrade und lowDuringTrade Felder zu senden. Diese werden automatisch zu MFE/MAE konvertiert.')}
              </p>
              <div className="p-2 rounded bg-background font-mono text-xs overflow-x-auto">
                <code className="text-muted-foreground">
                  {'"highDuringTrade": 112.50,'}<br/>
                  {'"lowDuringTrade": 98.75'}
                </code>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
              {t('mfeMAE.comingSoon', 'Feature verfügbar sobald Trades mit High/Low-Daten importiert werden')}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              {t('mfeMAE.avgMFE', 'Ø MFE')}
            </div>
            <p className="text-2xl font-bold text-emerald-500">
              {stats?.avgMFE.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingDown className="h-4 w-4 text-red-500" />
              {t('mfeMAE.avgMAE', 'Ø MAE')}
            </div>
            <p className="text-2xl font-bold text-red-500">
              {stats?.avgMAE.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t('mfeMAE.missedProfit', 'Ø Verpasst')}
            </div>
            <p className="text-2xl font-bold text-amber-500">
              {stats?.avgMissedProfit.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Target className="h-4 w-4 text-primary" />
              {t('mfeMAE.optimalStop', 'Optimaler Stop')}
              <TooltipProvider>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {t('mfeMAE.optimalStopHint', '80% deiner Gewinntrades hatten einen MAE unter diesem Wert')}
                  </TooltipContent>
                </UITooltip>
              </TooltipProvider>
            </div>
            <p className="text-2xl font-bold text-primary">
              {stats?.optimalStop.toFixed(2)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('mfeMAE.scatterTitle', 'MFE vs MAE Scatter Plot')}
          </CardTitle>
          <CardDescription>
            {t('mfeMAE.scatterDesc', 'Jeder Punkt ist ein Trade. Grün = Gewinn, Rot = Verlust.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                type="number"
                dataKey="maePercent"
                name="MAE"
                unit="%"
                label={{ value: 'MAE %', position: 'bottom', offset: 0 }}
                className="text-muted-foreground"
              />
              <YAxis
                type="number"
                dataKey="mfePercent"
                name="MFE"
                unit="%"
                label={{ value: 'MFE %', angle: -90, position: 'left' }}
                className="text-muted-foreground"
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{data.symbol}</p>
                      <p className="text-sm text-muted-foreground">MFE: {data.mfePercent.toFixed(2)}%</p>
                      <p className="text-sm text-muted-foreground">MAE: {data.maePercent.toFixed(2)}%</p>
                      <p className={`text-sm ${data.isWin ? 'text-emerald-500' : 'text-red-500'}`}>
                        P&L: ${data.pnl_net.toFixed(2)}
                      </p>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
              />
              <Scatter
                data={tradesWithData}
                fill="#10b981"
              >
                {tradesWithData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isWin ? '#10b981' : '#ef4444'}
                    opacity={0.7}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* MAE Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t('mfeMAE.maeDistribution', 'MAE Verteilung')}
          </CardTitle>
          <CardDescription>
            {t('mfeMAE.maeDistributionDesc', 'Wie weit laufen deine Trades gegen dich, bevor sie drehen?')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={maeDistribution} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="range" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-popover border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{data.range}</p>
                      <p className="text-sm">{data.count} Trades</p>
                      <p className="text-sm text-emerald-500">{data.wins} Gewinner</p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Missed Profit Table */}
      {topMissedProfitTrades.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('mfeMAE.missedProfitTitle', 'Höchster verpasster Gewinn')}
            </CardTitle>
            <CardDescription>
              {t('mfeMAE.missedProfitDesc', 'Trades bei denen du zu früh ausgestiegen bist')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topMissedProfitTrades.map((trade, index) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium">{trade.symbol}</p>
                      <p className="text-xs text-muted-foreground">
                        Exit: {trade.exitPercent.toFixed(2)}% | MFE: {trade.mfePercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-500 font-bold">
                      +{trade.missedProfit.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('mfeMAE.couldHaveGained', 'verpasst')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insight Box */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm">
                <strong>{t('mfeMAE.insight1Title', 'Stop-Loss Optimierung')}:</strong>{' '}
                {t('mfeMAE.insight1', '80% deiner Gewinntrades hatten einen maximalen Drawdown (MAE) von weniger als {{value}}%. Setze deinen Stop-Loss entsprechend.', { value: stats?.optimalStop.toFixed(1) })}
              </p>
              <p className="text-sm">
                <strong>{t('mfeMAE.insight2Title', 'Take-Profit')}:</strong>{' '}
                {t('mfeMAE.insight2', 'Im Durchschnitt laufen deine Trades {{value}}% ins Plus (MFE) bevor du aussteigst. Du verlässt {{missed}}% auf dem Tisch.', { value: stats?.avgMFE.toFixed(1), missed: stats?.avgMissedProfit.toFixed(1) })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
