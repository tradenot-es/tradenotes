import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useEffect, useState, useMemo, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  formula?: string;
  example?: string;
}

export default function Glossary() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
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

  const filteredTerms = useMemo(() => {
    if (!searchQuery.trim()) return terms;
    
    const query = searchQuery.toLowerCase().trim();
    
    const matchingTerms = terms.filter(term => 
      term.term.toLowerCase().includes(query) ||
      term.definition.toLowerCase().includes(query) ||
      (term.formula && term.formula.toLowerCase().includes(query)) ||
      (term.example && term.example.toLowerCase().includes(query))
    );
    
    return matchingTerms.sort((a, b) => {
      const aTermLower = a.term.toLowerCase();
      const bTermLower = b.term.toLowerCase();
      
      const aExact = aTermLower === query;
      const bExact = bTermLower === query;
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
      
      const aStarts = aTermLower.startsWith(query);
      const bStarts = bTermLower.startsWith(query);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      const aContains = aTermLower.includes(query);
      const bContains = bTermLower.includes(query);
      if (aContains && !bContains) return -1;
      if (bContains && !aContains) return 1;
      
      return aTermLower.localeCompare(bTermLower);
    });
  }, [terms, searchQuery]);

  // Group terms by first letter
  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    
    filteredTerms.forEach(term => {
      const firstLetter = term.term.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(term);
    });
    
    return groups;
  }, [filteredTerms]);

  // Get all available letters
  const availableLetters = useMemo(() => {
    return Object.keys(groupedTerms).sort();
  }, [groupedTerms]);

  // All alphabet letters
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const scrollToLetter = (letter: string) => {
    const section = sectionRefs.current[letter];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveLetter(letter);
    }
  };

  // Update active letter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const letter of availableLetters) {
        const section = sectionRefs.current[letter];
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveLetter(letter);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [availableLetters]);

  return (
    <div className="space-y-6 p-2">
      <PageHeader
        title={t("nav.glossary")}
        subtitle={t("glossary.subtitle")}
      />

      {/* Search and A-Z Navigation */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("glossary.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* A-Z Navigation Bar */}
        {!searchQuery && (
          <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-lg border">
            {alphabet.map(letter => {
              const hasTerms = availableLetters.includes(letter);
              return (
                <Button
                  key={letter}
                  variant={activeLetter === letter ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-sm font-medium",
                    !hasTerms && "opacity-30 cursor-not-allowed"
                  )}
                  disabled={!hasTerms}
                  onClick={() => hasTerms && scrollToLetter(letter)}
                >
                  {letter}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grouped Terms */}
      <div className="space-y-8">
        {filteredTerms.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {t("glossary.noResults")}
          </p>
        ) : searchQuery ? (
          // Show flat list when searching
          <div className="space-y-4">
            {filteredTerms.map((term) => (
              <GlossaryCard key={term.id} term={term} t={t} />
            ))}
          </div>
        ) : (
          // Show grouped by letter when not searching
          availableLetters.map(letter => (
            <div
              key={letter}
              ref={(el) => (sectionRefs.current[letter] = el)}
              className="scroll-mt-32"
            >
              <h2 className="text-2xl font-bold text-primary mb-4 sticky top-16 bg-background/95 backdrop-blur-sm py-2 z-10 border-b">
                {letter}
              </h2>
              <div className="space-y-4">
                {groupedTerms[letter].map((term) => (
                  <GlossaryCard key={term.id} term={term} t={t} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Extracted Card component for cleaner code
function GlossaryCard({ term, t }: { term: GlossaryTerm; t: (key: string) => string }) {
  return (
    <Card id={term.id} className="scroll-mt-20">
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
  );
}