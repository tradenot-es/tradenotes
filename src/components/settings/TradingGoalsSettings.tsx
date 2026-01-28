import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Target, TrendingUp, ShieldAlert, BarChart3 } from "lucide-react";
import { TradingGoalsConfig, GoalKey, TradingGoal } from "@/types/tradingGoals";
import { useCurrency } from "@/hooks/useCurrency";

interface TradingGoalsSettingsProps {
  goals: TradingGoalsConfig;
  onGoalChange: (key: GoalKey, updates: Partial<TradingGoal>) => void;
}

interface GoalRowProps {
  goalKey: GoalKey;
  goal: TradingGoal;
  label: string;
  suffix?: string;
  step?: string;
  onGoalChange: (key: GoalKey, updates: Partial<TradingGoal>) => void;
  formatValue?: (value: number) => string;
}

const GoalRow = ({ goalKey, goal, label, suffix, step = "1", onGoalChange }: GoalRowProps) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Checkbox
          id={goalKey}
          checked={goal.enabled}
          onCheckedChange={(checked) => onGoalChange(goalKey, { enabled: !!checked })}
        />
        <Label htmlFor={goalKey} className="text-sm cursor-pointer truncate">
          {label}
        </Label>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground w-5">{goal.operator}</span>
        <Input
          type="number"
          step={step}
          min="0"
          value={goal.target}
          onChange={(e) => onGoalChange(goalKey, { target: parseFloat(e.target.value) || 0 })}
          className="w-24 h-8 text-right"
          disabled={!goal.enabled}
        />
        {suffix && <span className="text-xs text-muted-foreground w-6">{suffix}</span>}
      </div>
    </div>
  );
};

export function TradingGoalsSettings({ goals, onGoalChange }: TradingGoalsSettingsProps) {
  const { t } = useTranslation();
  const { symbol: currencySymbol } = useCurrency();

  const profitGoals: { key: GoalKey; suffix?: string; step?: string }[] = [
    { key: "daily_pnl", suffix: currencySymbol, step: "10" },
    { key: "min_best_trade", suffix: currencySymbol, step: "10" },
    { key: "min_avg_win", suffix: currencySymbol, step: "5" },
    { key: "min_wins" },
  ];

  const riskLimits: { key: GoalKey; suffix?: string; step?: string }[] = [
    { key: "max_trades" },
    { key: "max_losses" },
    { key: "max_drawdown", suffix: currencySymbol, step: "10" },
    { key: "max_worst_trade", suffix: currencySymbol, step: "10" },
    { key: "max_avg_loss", suffix: currencySymbol, step: "5" },
    { key: "max_risk_per_trade", suffix: currencySymbol, step: "5" },
    { key: "max_commissions", suffix: currencySymbol, step: "5" },
    { key: "max_losing_streak" },
  ];

  const performanceGoals: { key: GoalKey; suffix?: string; step?: string }[] = [
    { key: "min_win_rate", suffix: "%", step: "1" },
    { key: "min_avg_r", step: "0.1" },
    { key: "min_profit_factor", step: "0.1" },
  ];

  const goalLabels: Record<GoalKey, string> = {
    daily_pnl: t("tradingGoals.dailyPnl"),
    max_trades: t("tradingGoals.maxTrades"),
    min_win_rate: t("tradingGoals.minWinRate"),
    max_drawdown: t("tradingGoals.maxDrawdown"),
    max_commissions: t("tradingGoals.maxCommissions"),
    min_avg_r: t("tradingGoals.minAvgR"),
    max_losing_streak: t("tradingGoals.maxLosingStreak"),
    min_profit_factor: t("tradingGoals.minProfitFactor"),
    min_wins: t("tradingGoals.minWins"),
    max_losses: t("tradingGoals.maxLosses"),
    min_avg_win: t("tradingGoals.minAvgWin"),
    max_avg_loss: t("tradingGoals.maxAvgLoss"),
    max_risk_per_trade: t("tradingGoals.maxRiskPerTrade"),
    min_best_trade: t("tradingGoals.minBestTrade"),
    max_worst_trade: t("tradingGoals.maxWorstTrade"),
  };

  const enabledCount = Object.values(goals).filter(g => g.enabled).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          {t("tradingGoals.settingsTitle")}
        </CardTitle>
        <CardDescription>
          {t("tradingGoals.settingsDescription")} ({enabledCount} {t("tradingGoals.activeGoals")})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={["profit", "risk"]} className="w-full">
          {/* Profit Goals */}
          <AccordionItem value="profit">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>{t("tradingGoals.profitGoals")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pt-2">
                {profitGoals.map(({ key, suffix, step }) => (
                  <GoalRow
                    key={key}
                    goalKey={key}
                    goal={goals[key]}
                    label={goalLabels[key]}
                    suffix={suffix}
                    step={step}
                    onGoalChange={onGoalChange}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Risk Limits */}
          <AccordionItem value="risk">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <span>{t("tradingGoals.riskLimits")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pt-2">
                {riskLimits.map(({ key, suffix, step }) => (
                  <GoalRow
                    key={key}
                    goalKey={key}
                    goal={goals[key]}
                    label={goalLabels[key]}
                    suffix={suffix}
                    step={step}
                    onGoalChange={onGoalChange}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Performance Goals */}
          <AccordionItem value="performance">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>{t("tradingGoals.performanceGoals")}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1 pt-2">
                {performanceGoals.map(({ key, suffix, step }) => (
                  <GoalRow
                    key={key}
                    goalKey={key}
                    goal={goals[key]}
                    label={goalLabels[key]}
                    suffix={suffix}
                    step={step}
                    onGoalChange={onGoalChange}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
