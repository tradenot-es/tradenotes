import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PositionSizeCalculatorProps {
  entryPrice?: number;
  stopLossPrice?: number;
  side?: 'long' | 'short';
  onApplySize?: (size: number) => void;
  className?: string;
  defaultOpen?: boolean;
}

const RISK_PRESETS = [0.5, 1, 2, 3];

export function PositionSizeCalculator({
  entryPrice,
  stopLossPrice,
  side = 'long',
  onApplySize,
  className,
  defaultOpen = false,
}: PositionSizeCalculatorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [accountSize, setAccountSize] = useState<string>('50000');
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [manualStopDistance, setManualStopDistance] = useState<string>('');

  // Calculate stop distance from prices
  const autoStopDistance = useMemo(() => {
    if (entryPrice && stopLossPrice && entryPrice > 0 && stopLossPrice > 0) {
      return Math.abs(entryPrice - stopLossPrice);
    }
    return null;
  }, [entryPrice, stopLossPrice]);

  const stopDistance = autoStopDistance || (manualStopDistance ? parseFloat(manualStopDistance) : 0);

  // Calculate position size
  const calculation = useMemo(() => {
    const account = parseFloat(accountSize) || 0;
    if (account <= 0 || riskPercent <= 0 || stopDistance <= 0) {
      return null;
    }

    const riskAmount = account * (riskPercent / 100);
    const positionSize = Math.floor(riskAmount / stopDistance);
    const actualRiskAmount = positionSize * stopDistance;

    return {
      riskAmount,
      positionSize,
      actualRiskAmount,
      positionValue: entryPrice ? positionSize * entryPrice : null,
    };
  }, [accountSize, riskPercent, stopDistance, entryPrice]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <Card className="border-dashed">
        <CollapsibleTrigger asChild>
          {/* a real button, so the calculator opens by keyboard too */}
          <button type="button" className="block w-full rounded-t-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <CardHeader className="py-3 cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-sm font-medium">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                {t('positionCalculator.title', 'Position Size Calculator')}
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )} />
            </CardTitle>
          </CardHeader>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 space-y-4">
            {/* Account Size */}
            <div className="space-y-2">
              <Label htmlFor="accountSize" className="text-xs">
                {t('positionCalculator.accountSize', 'Account-Größe')} ($)
              </Label>
              <Input
                id="accountSize"
                type="number"
                value={accountSize}
                onChange={(e) => setAccountSize(e.target.value)}
                placeholder="50000"
                className="h-9"
              />
            </div>

            {/* Risk Percent */}
            <div className="space-y-2">
              <Label className="text-xs">
                {t('positionCalculator.riskPercent', 'Risiko pro Trade')}
              </Label>
              <div className="flex gap-2">
                {RISK_PRESETS.map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={riskPercent === preset ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 h-8"
                    onClick={() => setRiskPercent(preset)}
                  >
                    {preset}%
                  </Button>
                ))}
              </div>
            </div>

            {/* Stop Distance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="stopDistance" className="text-xs">
                  {t('positionCalculator.stopDistance', 'Stop Distance')} ($)
                </Label>
                {autoStopDistance && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        {t('positionCalculator.autoCalculated', 'Automatisch aus Entry und Stop-Loss berechnet')}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                id="stopDistance"
                type="number"
                step="0.01"
                value={autoStopDistance?.toFixed(2) || manualStopDistance}
                onChange={(e) => setManualStopDistance(e.target.value)}
                placeholder="2.50"
                disabled={!!autoStopDistance}
                className={cn("h-9", autoStopDistance && "bg-muted")}
              />
            </div>

            {/* Results */}
            {calculation && (
              <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {t('positionCalculator.riskAmount', 'Risikobetrag')}:
                  </span>
                  <span className="text-sm font-medium">
                    ${calculation.riskAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {t('positionCalculator.calculatedSize', 'Position')}:
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {calculation.positionSize} {t('positionCalculator.shares', 'Stück')}
                  </span>
                </div>
                {calculation.positionValue && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {t('positionCalculator.positionValue', 'Positionswert')}:
                    </span>
                    <span className="text-sm">
                      ${calculation.positionValue.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Apply Button */}
            {onApplySize && calculation && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => onApplySize(calculation.positionSize)}
              >
                {t('positionCalculator.applySize', 'Größe übernehmen')}
              </Button>
            )}

            {!calculation && stopDistance <= 0 && (
              <p className="text-xs text-muted-foreground text-center">
                {t('positionCalculator.enterStopLoss', 'Gib einen Stop-Loss ein um die Position zu berechnen')}
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
