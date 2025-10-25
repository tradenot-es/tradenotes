import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  formula?: string;
  example?: string;
}

export default function Glossary() {
  const { t } = useTranslation();

  const terms: GlossaryTerm[] = [
    {
      id: "r-multiple",
      term: "R-Multiple",
      definition: "Measures how many times your initial risk you won or lost on a trade. An R-Multiple of 2R means you made twice your initial risk, while -1R means you lost your full risk amount.",
      formula: "R-Multiple = Net P&L / Initial Risk",
      example: "Risk $100, profit $200 → R-Multiple = 2R"
    },
    {
      id: "initial-risk",
      term: "Initial Risk",
      definition: "The amount of money you are willing to lose on a trade, calculated from entry price to stop loss price.",
      formula: "Initial Risk = (Entry Price - Stop Loss Price) × Quantity",
      example: "Entry $50, Stop Loss $48, Qty 100 → Risk = $200"
    },
    {
      id: "expectancy",
      term: "Expectancy",
      definition: "The average amount you can expect to win or lose per trade over time. Positive expectancy means profitable system.",
      formula: "Expectancy = (Win Rate × Avg Win) - (Loss Rate × Avg Loss)",
      example: "60% win rate, $150 avg win, $100 avg loss → Expectancy = $50"
    },
    {
      id: "win-rate",
      term: "Win Rate",
      definition: "Percentage of trades that are profitable.",
      formula: "Win Rate = (Winning Trades / Total Trades) × 100%",
      example: "60 wins out of 100 trades → Win Rate = 60%"
    },
    {
      id: "profit-factor",
      term: "Profit Factor",
      definition: "Ratio of gross profits to gross losses. Above 1.0 means profitable, above 2.0 is excellent.",
      formula: "Profit Factor = Total Gross Profit / Total Gross Loss",
      example: "$10,000 profit, $5,000 losses → Profit Factor = 2.0"
    },
    {
      id: "risk-reward",
      term: "Risk-Reward Ratio",
      definition: "Compares potential profit to potential loss before entering a trade.",
      formula: "Risk-Reward = (Target Price - Entry Price) / (Entry Price - Stop Loss)",
      example: "Entry $50, Target $56, Stop $48 → R:R = 3:1"
    },
    {
      id: "max-drawdown",
      term: "Maximum Drawdown",
      definition: "The largest peak-to-trough decline in account equity. Measures worst-case scenario risk.",
      formula: "Max DD = (Peak Equity - Lowest Equity) / Peak Equity × 100%",
      example: "Peak $10,000, low $8,000 → Max DD = 20%"
    },
    {
      id: "avg-win-loss",
      term: "Average Win / Loss",
      definition: "Average profit of winning trades vs. average loss of losing trades.",
      formula: "Avg Win = Total Profit / # Wins, Avg Loss = Total Loss / # Losses",
      example: "5 wins totaling $500 → Avg Win = $100"
    },
    {
      id: "pnl",
      term: "P&L (Profit & Loss)",
      definition: "The net gain or loss from a trade after all fees and commissions.",
      formula: "P&L = (Exit Price - Entry Price) × Quantity - Fees",
      example: "Buy 100 @ $50, sell @ $55, $2 fees → P&L = $498"
    },
    {
      id: "setup",
      term: "Setup",
      definition: "A specific pattern or condition that signals a trading opportunity, based on your strategy.",
      example: "Breakout, Failed Rally, Gap Fill, Trend Follow"
    },
    {
      id: "stop-loss",
      term: "Stop Loss",
      definition: "Predetermined price level where you exit a trade to limit losses.",
      example: "Long entry $50, stop loss at $48 limits risk to $2/share"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Trading Glossary</h1>
        <p className="text-muted-foreground">
          Essential trading terms and risk management concepts explained
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
                    Formula:
                  </p>
                  <code className="block bg-muted p-3 rounded-md font-mono text-sm">
                    {term.formula}
                  </code>
                </div>
              )}
              {term.example && (
                <div>
                  <p className="font-semibold text-sm text-muted-foreground mb-1">
                    Example:
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
