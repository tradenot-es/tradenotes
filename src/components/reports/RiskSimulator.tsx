import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";
import { Calculator, TrendingUp, AlertTriangle, Shuffle } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface Trade {
  id: string;
  pnl_net: number;
  r?: number | null;
  initial_risk?: number | null;
  exit_time: string;
  setup?: string | null;
  symbol: string;
}

interface RiskSimulatorProps {
  trades: Trade[];
}

type ScenarioType = "r-exit" | "position-size" | "monte-carlo";

export const RiskSimulator = ({ trades }: RiskSimulatorProps) => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [scenario, setScenario] = useState<ScenarioType>("r-exit");
  const [rTarget, setRTarget] = useState(2);
  const [positionSizeMultiplier, setPositionSizeMultiplier] = useState(100);
  const [monteCarloIterations] = useState(100);

  // Sort trades by date
  const sortedTrades = useMemo(() => 
    [...trades].sort((a, b) => new Date(a.exit_time).getTime() - new Date(b.exit_time).getTime()),
    [trades]
  );

  // Original equity curve
  const originalEquity = useMemo(() => {
    let cumulative = 0;
    return sortedTrades.map((trade, idx) => {
      cumulative += trade.pnl_net;
      return { index: idx + 1, original: cumulative, date: new Date(trade.exit_time).toLocaleDateString() };
    });
  }, [sortedTrades]);

  // R-Exit Simulation
  const rExitSimulation = useMemo(() => {
    if (scenario !== "r-exit") return originalEquity;
    
    const tradesWithR = sortedTrades.filter(t => t.initial_risk && t.initial_risk > 0);
    if (tradesWithR.length === 0) return originalEquity;

    let cumulative = 0;
    let simulatedCumulative = 0;

    return sortedTrades.map((trade, idx) => {
      cumulative += trade.pnl_net;
      
      // Simulate: what if we always exited at target R?
      if (trade.initial_risk && trade.initial_risk > 0) {
        const originalR = trade.pnl_net / trade.initial_risk;
        if (originalR > 0) {
          // Winner: cap at target R
          const cappedPnL = Math.min(originalR, rTarget) * trade.initial_risk;
          simulatedCumulative += cappedPnL;
        } else {
          // Loser: keep as is (assuming we hit stop loss)
          simulatedCumulative += trade.pnl_net;
        }
      } else {
        simulatedCumulative += trade.pnl_net;
      }

      return {
        index: idx + 1,
        original: cumulative,
        simulated: simulatedCumulative,
        date: new Date(trade.exit_time).toLocaleDateString(),
      };
    });
  }, [sortedTrades, scenario, rTarget, originalEquity]);

  // Position Size Simulation
  const positionSizeSimulation = useMemo(() => {
    if (scenario !== "position-size") return originalEquity;

    const multiplier = positionSizeMultiplier / 100;
    let cumulative = 0;
    let simulatedCumulative = 0;

    return sortedTrades.map((trade, idx) => {
      cumulative += trade.pnl_net;
      simulatedCumulative += trade.pnl_net * multiplier;

      return {
        index: idx + 1,
        original: cumulative,
        simulated: simulatedCumulative,
        date: new Date(trade.exit_time).toLocaleDateString(),
      };
    });
  }, [sortedTrades, scenario, positionSizeMultiplier, originalEquity]);

  // Monte Carlo Simulation
  const monteCarloSimulation = useMemo(() => {
    if (scenario !== "monte-carlo" || sortedTrades.length === 0) return [];

    const pnlValues = sortedTrades.map(t => t.pnl_net);
    const paths: number[][] = [];

    // Generate multiple random paths
    for (let i = 0; i < monteCarloIterations; i++) {
      const shuffled = [...pnlValues].sort(() => Math.random() - 0.5);
      let cumulative = 0;
      const path = shuffled.map(pnl => {
        cumulative += pnl;
        return cumulative;
      });
      paths.push(path);
    }

    // Calculate percentiles
    const result = [];
    for (let i = 0; i < pnlValues.length; i++) {
      const valuesAtIndex = paths.map(path => path[i]).sort((a, b) => a - b);
      const p5 = valuesAtIndex[Math.floor(monteCarloIterations * 0.05)];
      const p25 = valuesAtIndex[Math.floor(monteCarloIterations * 0.25)];
      const p50 = valuesAtIndex[Math.floor(monteCarloIterations * 0.5)];
      const p75 = valuesAtIndex[Math.floor(monteCarloIterations * 0.75)];
      const p95 = valuesAtIndex[Math.floor(monteCarloIterations * 0.95)];

      result.push({
        index: i + 1,
        original: originalEquity[i]?.original || 0,
        p5,
        p25,
        p50,
        p75,
        p95,
      });
    }

    return result;
  }, [sortedTrades, scenario, monteCarloIterations, originalEquity]);

  // Get current simulation data
  const simulationData = useMemo(() => {
    switch (scenario) {
      case "r-exit":
        return rExitSimulation;
      case "position-size":
        return positionSizeSimulation;
      case "monte-carlo":
        return monteCarloSimulation;
      default:
        return originalEquity;
    }
  }, [scenario, rExitSimulation, positionSizeSimulation, monteCarloSimulation, originalEquity]);

  // Calculate comparison stats
  const comparisonStats = useMemo(() => {
    if (simulationData.length === 0) return null;
    
    const last = simulationData[simulationData.length - 1];
    const originalFinal = last.original || 0;
    
    if (scenario === "monte-carlo") {
      return {
        originalFinal,
        medianFinal: last.p50 || 0,
        bestCase: last.p95 || 0,
        worstCase: last.p5 || 0,
      };
    }
    
    const simulatedFinal = (last as any).simulated || originalFinal;
    const difference = simulatedFinal - originalFinal;
    const percentChange = originalFinal !== 0 ? (difference / Math.abs(originalFinal)) * 100 : 0;

    return {
      originalFinal,
      simulatedFinal,
      difference,
      percentChange,
    };
  }, [simulationData, scenario]);

  const tradesWithRCount = sortedTrades.filter(t => t.initial_risk && t.initial_risk > 0).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <CardTitle>{t("riskSimulator.title")}</CardTitle>
        </div>
        <CardDescription>{t("riskSimulator.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selector */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{t("riskSimulator.scenario")}</Label>
            <Select value={scenario} onValueChange={(v) => setScenario(v as ScenarioType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="r-exit">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {t("riskSimulator.rExit")}
                  </div>
                </SelectItem>
                <SelectItem value="position-size">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {t("riskSimulator.positionSize")}
                  </div>
                </SelectItem>
                <SelectItem value="monte-carlo">
                  <div className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    {t("riskSimulator.monteCarlo")}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scenario-specific controls */}
          {scenario === "r-exit" && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>{t("riskSimulator.targetR")}</Label>
                <Badge variant="outline">{rTarget}R</Badge>
              </div>
              <Slider
                value={[rTarget]}
                onValueChange={([v]) => setRTarget(v)}
                min={0.5}
                max={5}
                step={0.5}
                className="w-full"
              />
              {tradesWithRCount < sortedTrades.length && (
                <p className="text-xs text-muted-foreground">
                  {t("riskSimulator.tradesWithR", { count: tradesWithRCount, total: sortedTrades.length })}
                </p>
              )}
            </div>
          )}

          {scenario === "position-size" && (
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>{t("riskSimulator.sizeMultiplier")}</Label>
                <Badge variant="outline">{positionSizeMultiplier}%</Badge>
              </div>
              <Slider
                value={[positionSizeMultiplier]}
                onValueChange={([v]) => setPositionSizeMultiplier(v)}
                min={25}
                max={300}
                step={25}
                className="w-full"
              />
            </div>
          )}

          {scenario === "monte-carlo" && (
            <div className="md:col-span-2 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {t("riskSimulator.monteCarloDesc", { iterations: monteCarloIterations })}
              </p>
            </div>
          )}
        </div>

        {/* Comparison Stats */}
        {comparisonStats && (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.originalResult")}</p>
              <p className={`text-lg font-bold ${comparisonStats.originalFinal >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(comparisonStats.originalFinal)}
              </p>
            </div>
            
            {scenario !== "monte-carlo" ? (
              <>
                <div className="p-4 bg-primary/10 rounded-lg text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.simulatedResult")}</p>
                  <p className={`text-lg font-bold ${(comparisonStats as any).simulatedFinal >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency((comparisonStats as any).simulatedFinal)}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.difference")}</p>
                  <p className={`text-lg font-bold ${(comparisonStats as any).difference >= 0 ? "text-success" : "text-destructive"}`}>
                    {(comparisonStats as any).difference >= 0 ? "+" : ""}{formatCurrency((comparisonStats as any).difference)}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.percentChange")}</p>
                  <p className={`text-lg font-bold ${(comparisonStats as any).percentChange >= 0 ? "text-success" : "text-destructive"}`}>
                    {(comparisonStats as any).percentChange >= 0 ? "+" : ""}{(comparisonStats as any).percentChange.toFixed(1)}%
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.median")}</p>
                  <p className={`text-lg font-bold ${(comparisonStats as any).medianFinal >= 0 ? "text-success" : "text-destructive"}`}>
                    {formatCurrency((comparisonStats as any).medianFinal)}
                  </p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg text-center border border-success/20">
                  <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.bestCase")}</p>
                  <p className="text-lg font-bold text-success">
                    {formatCurrency((comparisonStats as any).bestCase)}
                  </p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg text-center border border-destructive/20">
                  <p className="text-xs text-muted-foreground mb-1">{t("riskSimulator.worstCase")}</p>
                  <p className="text-lg font-bold text-destructive">
                    {formatCurrency((comparisonStats as any).worstCase)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Chart */}
        <div className="h-[350px]">
          {scenario === "monte-carlo" ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area type="monotone" dataKey="p95" stroke="none" fill="hsl(var(--success))" fillOpacity={0.1} name="95th %" />
                <Area type="monotone" dataKey="p75" stroke="none" fill="hsl(var(--success))" fillOpacity={0.2} name="75th %" />
                <Area type="monotone" dataKey="p25" stroke="none" fill="hsl(var(--destructive))" fillOpacity={0.2} name="25th %" />
                <Area type="monotone" dataKey="p5" stroke="none" fill="hsl(var(--destructive))" fillOpacity={0.1} name="5th %" />
                <Line type="monotone" dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name={t("riskSimulator.median")} />
                <Line type="monotone" dataKey="original" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} name={t("riskSimulator.original")} />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="index" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="original"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name={t("riskSimulator.original")}
                />
                <Line
                  type="monotone"
                  dataKey="simulated"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name={t("riskSimulator.simulated")}
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
