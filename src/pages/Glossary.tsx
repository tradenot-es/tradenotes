import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  formula?: string;
  example?: string;
}

export default function Glossary() {
  const { t } = useTranslation();

  useEffect(() => {
    // Scroll to anchor on mount and when hash changes
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, []);

  const terms: GlossaryTerm[] = [
    {
      id: "avg-win-loss",
      term: t("glossary.avgWinLoss.term"),
      definition: t("glossary.avgWinLoss.definition"),
      formula: t("glossary.avgWinLoss.formula"),
      example: t("glossary.avgWinLoss.example")
    },
    {
      id: "breakout",
      term: t("glossary.breakout.term"),
      definition: t("glossary.breakout.definition"),
      example: t("glossary.breakout.example")
    },
    {
      id: "consolidation",
      term: t("glossary.consolidation.term"),
      definition: t("glossary.consolidation.definition"),
      example: t("glossary.consolidation.example")
    },
    {
      id: "consistency-tracker",
      term: t("glossary.consistencyTracker.term"),
      definition: t("glossary.consistencyTracker.definition"),
      example: t("glossary.consistencyTracker.example")
    },
    {
      id: "daily-trade-goal",
      term: t("glossary.dailyTradeGoal.term"),
      definition: t("glossary.dailyTradeGoal.definition"),
      example: t("glossary.dailyTradeGoal.example")
    },
    {
      id: "edge",
      term: t("glossary.edge.term"),
      definition: t("glossary.edge.definition"),
      example: t("glossary.edge.example")
    },
    {
      id: "equity-curve",
      term: t("glossary.equityCurve.term"),
      definition: t("glossary.equityCurve.definition"),
      example: t("glossary.equityCurve.example")
    },
    {
      id: "expectancy",
      term: t("glossary.expectancy.term"),
      definition: t("glossary.expectancy.definition"),
      formula: t("glossary.expectancy.formula"),
      example: t("glossary.expectancy.example")
    },
    {
      id: "gap",
      term: t("glossary.gap.term"),
      definition: t("glossary.gap.definition"),
      example: t("glossary.gap.example")
    },
    {
      id: "initial-risk",
      term: t("glossary.initialRisk.term"),
      definition: t("glossary.initialRisk.definition"),
      formula: t("glossary.initialRisk.formula"),
      example: t("glossary.initialRisk.example")
    },
    {
      id: "leverage",
      term: t("glossary.leverage.term"),
      definition: t("glossary.leverage.definition"),
      formula: t("glossary.leverage.formula"),
      example: t("glossary.leverage.example")
    },
    {
      id: "liquidity",
      term: t("glossary.liquidity.term"),
      definition: t("glossary.liquidity.definition"),
      example: t("glossary.liquidity.example")
    },
    {
      id: "max-drawdown",
      term: t("glossary.maxDrawdown.term"),
      definition: t("glossary.maxDrawdown.definition"),
      formula: t("glossary.maxDrawdown.formula"),
      example: t("glossary.maxDrawdown.example")
    },
    {
      id: "mfe",
      term: t("glossary.mfe.term"),
      definition: t("glossary.mfe.definition"),
      formula: t("glossary.mfe.formula"),
      example: t("glossary.mfe.example")
    },
    {
      id: "mae",
      term: t("glossary.mae.term"),
      definition: t("glossary.mae.definition"),
      formula: t("glossary.mae.formula"),
      example: t("glossary.mae.example")
    },
    {
      id: "pnl",
      term: t("glossary.pnl.term"),
      definition: t("glossary.pnl.definition"),
      formula: t("glossary.pnl.formula"),
      example: t("glossary.pnl.example")
    },
    {
      id: "portfolio-news",
      term: t("glossary.portfolioNews.term"),
      definition: t("glossary.portfolioNews.definition"),
      example: t("glossary.portfolioNews.example")
    },
    {
      id: "position-sizing",
      term: t("glossary.positionSizing.term"),
      definition: t("glossary.positionSizing.definition"),
      formula: t("glossary.positionSizing.formula"),
      example: t("glossary.positionSizing.example")
    },
    {
      id: "profit-factor",
      term: t("glossary.profitFactor.term"),
      definition: t("glossary.profitFactor.definition"),
      formula: t("glossary.profitFactor.formula"),
      example: t("glossary.profitFactor.example")
    },
    {
      id: "r-multiple",
      term: t("glossary.rMultiple.term"),
      definition: t("glossary.rMultiple.definition"),
      formula: t("glossary.rMultiple.formula"),
      example: t("glossary.rMultiple.example")
    },
    {
      id: "risk-reward",
      term: t("glossary.riskReward.term"),
      definition: t("glossary.riskReward.definition"),
      formula: t("glossary.riskReward.formula"),
      example: t("glossary.riskReward.example")
    },
    {
      id: "scalping",
      term: t("glossary.scalping.term"),
      definition: t("glossary.scalping.definition"),
      example: t("glossary.scalping.example")
    },
    {
      id: "setup",
      term: t("glossary.setup.term"),
      definition: t("glossary.setup.definition"),
      example: t("glossary.setup.example")
    },
    {
      id: "slippage",
      term: t("glossary.slippage.term"),
      definition: t("glossary.slippage.definition"),
      example: t("glossary.slippage.example")
    },
    {
      id: "stop-loss",
      term: t("glossary.stopLoss.term"),
      definition: t("glossary.stopLoss.definition"),
      example: t("glossary.stopLoss.example")
    },
    {
      id: "support-resistance",
      term: t("glossary.supportResistance.term"),
      definition: t("glossary.supportResistance.definition"),
      example: t("glossary.supportResistance.example")
    },
    {
      id: "take-profit",
      term: t("glossary.takeProfit.term"),
      definition: t("glossary.takeProfit.definition"),
      example: t("glossary.takeProfit.example")
    },
    {
      id: "trend",
      term: t("glossary.trend.term"),
      definition: t("glossary.trend.definition"),
      example: t("glossary.trend.example")
    },
    {
      id: "volatility",
      term: t("glossary.volatility.term"),
      definition: t("glossary.volatility.definition"),
      example: t("glossary.volatility.example")
    },
    {
      id: "volume",
      term: t("glossary.volume.term"),
      definition: t("glossary.volume.definition"),
      example: t("glossary.volume.example")
    },
    {
      id: "news-sentiment",
      term: t("glossary.newsSentiment.term"),
      definition: t("glossary.newsSentiment.definition"),
      example: t("glossary.newsSentiment.example")
    },
    {
      id: "win-rate",
      term: t("glossary.winRate.term"),
      definition: t("glossary.winRate.definition"),
      formula: t("glossary.winRate.formula"),
      example: t("glossary.winRate.example")
    },
    {
      id: "win-rate-risk-reward",
      term: t("glossary.winRateRiskReward.term"),
      definition: t("glossary.winRateRiskReward.definition"),
      example: t("glossary.winRateRiskReward.example")
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <PageHeader
        title={t("nav.glossary")}
        subtitle={t("glossary.subtitle")}
      />

      <div className="space-y-4">
        {terms.map((term) => (
          <Card key={term.id} id={term.id} className="scroll-mt-20">
            <CardHeader>
              <CardTitle className="text-2xl">{term.term}</CardTitle>
              <CardDescription className="text-base">
                {term.definition}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {term.formula && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground mb-1">
                    {t("glossary.formula")}:
                  </p>
                  <code className="block bg-muted p-3 rounded-md font-mono text-sm">
                    {term.formula}
                  </code>
                </div>
              )}
              {term.example && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground mb-1">
                    {t("glossary.example")}:
                  </p>
                  <p className="text-sm bg-muted/50 p-3 rounded-md">
                    {term.example}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
