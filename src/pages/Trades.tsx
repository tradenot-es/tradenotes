import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AddTradeFAB } from "@/components/AddTradeFAB";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { TradeCalendar } from "@/components/TradeCalendar";
import { FinancialNews } from "@/components/FinancialNews";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  entry_time: string;
  exit_time: string;
  fees: number;
  pnl_net: number;
  r?: number;
  tags?: string[];
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
  const [currency, setCurrency] = useState<string>("USD");
  const [preselectedDate, setPreselectedDate] = useState<Date>();

  useEffect(() => {
    if (user) {
      loadTrades();
      loadUserSettings();
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

  const loadUserSettings = async () => {
    const { data } = await supabase
      .from("user_settings")
      .select("base_currency")
      .single();

    if (data?.base_currency) {
      setCurrency(data.base_currency);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleAddTradeForDate = (date: Date) => {
    setPreselectedDate(date);
    setAddDialogOpen(true);
  };

  const getSymbolsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const symbols = trades
      .filter(trade => trade.exit_time.startsWith(dateStr))
      .map(trade => trade.symbol);
    return [...new Set(symbols)];
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("trades.title")}</h1>
          <p className="text-muted-foreground">{t("trades.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="currency" className="text-sm">{t("trades.selectCurrency")}:</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="JPY">JPY</SelectItem>
              <SelectItem value="CHF">CHF</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("trades.noTrades")}</p>
        </div>
      ) : (
        <>
          <TradeCalendar
            trades={trades}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            onAddTrade={handleAddTradeForDate}
          />

          {selectedDate && (
            <FinancialNews
              date={selectedDate}
              symbols={getSymbolsForDate(selectedDate)}
            />
          )}
        </>
      )}

      <AddTradeDialog 
        open={addDialogOpen} 
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setPreselectedDate(undefined);
        }}
        onSuccess={loadTrades}
        preselectedDate={preselectedDate}
      />

      <AddTradeFAB onClick={() => setAddDialogOpen(true)} />
    </div>
  );
};

export default Trades;
