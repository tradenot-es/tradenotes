import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AddTradeFAB } from "@/components/AddTradeFAB";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { TradeCalendar } from "@/components/TradeCalendar";

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
    <div className="h-[calc(100vh-8rem)]">
      <TradeCalendar
        trades={trades}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
        onAddTrade={handleAddTradeForDate}
        onEditTrade={handleEditTrade}
      />

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
