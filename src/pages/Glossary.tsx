import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

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
      id: "r-multiple",
      term: t("glossary.rMultiple.term"),
      definition: t("glossary.rMultiple.definition"),
      formula: t("glossary.rMultiple.formula"),
      example: t("glossary.rMultiple.example")
    },
    {
      id: "initial-risk",
      term: t("glossary.initialRisk.term"),
      definition: t("glossary.initialRisk.definition"),
      formula: t("glossary.initialRisk.formula"),
      example: t("glossary.initialRisk.example")
    },
    {
      id: "expectancy",
      term: t("glossary.expectancy.term"),
      definition: t("glossary.expectancy.definition"),
      formula: t("glossary.expectancy.formula"),
      example: t("glossary.expectancy.example")
    },
    {
      id: "trade-rating",
      term: t("glossary.tradeRating.term"),
      definition: t("glossary.tradeRating.definition"),
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
    },
    {
      id: "profit-factor",
      term: t("glossary.profitFactor.term"),
      definition: t("glossary.profitFactor.definition"),
      formula: t("glossary.profitFactor.formula"),
      example: t("glossary.profitFactor.example")
    },
    {
      id: "risk-reward",
      term: t("glossary.riskReward.term"),
      definition: t("glossary.riskReward.definition"),
      formula: t("glossary.riskReward.formula"),
      example: t("glossary.riskReward.example")
    },
    {
      id: "max-drawdown",
      term: t("glossary.maxDrawdown.term"),
      definition: t("glossary.maxDrawdown.definition"),
      formula: t("glossary.maxDrawdown.formula"),
      example: t("glossary.maxDrawdown.example")
    },
    {
      id: "avg-win-loss",
      term: t("glossary.avgWinLoss.term"),
      definition: t("glossary.avgWinLoss.definition"),
      formula: t("glossary.avgWinLoss.formula"),
      example: t("glossary.avgWinLoss.example")
    },
    {
      id: "pnl",
      term: t("glossary.pnl.term"),
      definition: t("glossary.pnl.definition"),
      formula: t("glossary.pnl.formula"),
      example: t("glossary.pnl.example")
    },
    {
      id: "setup",
      term: t("glossary.setup.term"),
      definition: t("glossary.setup.definition"),
      example: t("glossary.setup.example")
    },
    {
      id: "stop-loss",
      term: t("glossary.stopLoss.term"),
      definition: t("glossary.stopLoss.definition"),
      example: t("glossary.stopLoss.example")
    },
    {
      id: "equity-curve",
      term: t("glossary.equityCurve.term"),
      definition: t("glossary.equityCurve.definition"),
      example: t("glossary.equityCurve.example")
    },
    {
      id: "consistency-tracker",
      term: t("glossary.consistencyTracker.term"),
      definition: t("glossary.consistencyTracker.definition"),
      example: t("glossary.consistencyTracker.example")
    },
    {
      id: "portfolio-news",
      term: t("glossary.portfolioNews.term"),
      definition: t("glossary.portfolioNews.definition"),
      example: t("glossary.portfolioNews.example")
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t("nav.glossary")}</h1>
        <p className="text-muted-foreground">
          {t("glossary.subtitle")}
        </p>
      </div>

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
