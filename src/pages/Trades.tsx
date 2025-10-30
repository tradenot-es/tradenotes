import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AddTradeFAB } from "@/components/AddTradeFAB";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { TradeCalendar } from "@/components/TradeCalendar";
import { TradeFilters, TradeFilterOptions } from "@/components/TradeFilters";
import { PortfolioNews } from "@/components/PortfolioNews";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  market: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  fees: number;
  pnl_net: number;
  rating?: number;
  screenshot_url?: string;
  setup?: string;
  note?: string;
}

const Trades = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preselectedDate, setPreselectedDate] = useState<Date>();
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<TradeFilterOptions>({});

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  const loadTrades = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .order("exit_time", { ascending: false });

    if (!error && data) {
      setTrades(data);
    }
    setLoading(false);
  };

  // Apply filters to trades
  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      if (filters.symbol && !trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false;
      }
      if (filters.market && trade.market !== filters.market) {
        return false;
      }
      if (filters.side && trade.side !== filters.side) {
        return false;
      }
      if (filters.setup && trade.setup !== filters.setup) {
        return false;
      }
      if (filters.dateFrom && new Date(trade.exit_time) < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && new Date(trade.exit_time) > filters.dateTo) {
        return false;
      }
      if (filters.minPnl !== undefined && trade.pnl_net < filters.minPnl) {
        return false;
      }
      if (filters.maxPnl !== undefined && trade.pnl_net > filters.maxPnl) {
        return false;
      }
      if (filters.minRating && (!trade.rating || trade.rating < filters.minRating)) {
        return false;
      }
      if (filters.hasScreenshot !== undefined) {
        if (filters.hasScreenshot && !trade.screenshot_url) return false;
        if (!filters.hasScreenshot && trade.screenshot_url) return false;
      }
      return true;
    });
  }, [trades, filters]);

  const availableSetups = useMemo(() => {
    const setups = trades
      .map((t) => t.setup)
      .filter((s): s is string => s !== undefined && s !== null);
    return [...new Set(setups)];
  }, [trades]);


  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTradeForDate = (date: Date) => {
    setEditTrade(null);
    setPreselectedDate(date);
    setAddDialogOpen(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditTrade(trade);
    setPreselectedDate(undefined);
    setAddDialogOpen(true);
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("trades.title")}</h1>
          <p className="text-muted-foreground">{t("trades.subtitle")}</p>
        </div>
        <TradeFilters
          onFilterChange={setFilters}
          availableSetups={availableSetups}
          compact
        />
      </div>

      <PortfolioNews />

      <div className="h-[calc(100vh-14rem)]">
        <TradeCalendar
          trades={filteredTrades}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onAddTrade={handleAddTradeForDate}
          onEditTrade={handleEditTrade}
        />
      </div>

      <AddTradeDialog 
        open={addDialogOpen} 
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) {
            setPreselectedDate(undefined);
            setEditTrade(null);
          }
        }}
        onSuccess={loadTrades}
        preselectedDate={preselectedDate}
        editTrade={editTrade}
      />

      <AddTradeFAB onClick={() => {
        setEditTrade(null);
        setPreselectedDate(undefined);
        setAddDialogOpen(true);
      }} />
    </div>
  );
};

export default Trades;
