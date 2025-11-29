import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface SymbolFrequency {
  symbol: string;
  count: number;
  market: string;
}

export function useFrequentSymbols(market?: string) {
  const { user } = useAuth();
  const [frequentSymbols, setFrequentSymbols] = useState<SymbolFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadFrequentSymbols = async () => {
      try {
        let query = supabase
          .from("trades")
          .select("symbol, market");

        if (market) {
          query = query.eq("market", market);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          // Normalize common symbol typos
          const normalizeSymbol = (symbol: string): string => {
            const upperSymbol = symbol.toUpperCase();
            // Known typos/variations
            if (upperSymbol === 'APPL') return 'AAPL';
            if (upperSymbol === 'GOOGL') return 'GOOGL'; // Already correct
            if (upperSymbol === 'GOOG') return 'GOOGL'; // Normalize to Class A
            return upperSymbol;
          };

          // Count symbol frequency with normalization
          const symbolCounts = data.reduce((acc, trade) => {
            const normalizedSymbol = normalizeSymbol(trade.symbol);
            const key = `${normalizedSymbol}-${trade.market}`;
            if (!acc[key]) {
              acc[key] = { symbol: normalizedSymbol, count: 0, market: trade.market || "Stock" };
            }
            acc[key].count++;
            return acc;
          }, {} as Record<string, SymbolFrequency>);

          // Sort by frequency
          const sorted = Object.values(symbolCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 most traded

          setFrequentSymbols(sorted);
        }
      } catch (error) {
        console.error("Error loading frequent symbols:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFrequentSymbols();
  }, [user, market]);

  return { frequentSymbols, loading };
}
