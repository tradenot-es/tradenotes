import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { de, enUS, fr, es, nl } from "date-fns/locale";
import { AddTradeFAB } from "@/components/AddTradeFAB";
import { AddTradeDialog } from "@/components/AddTradeDialog";
import { TradeCalendar } from "@/components/TradeCalendar";
import { TradeFilters, TradeFilterOptions } from "@/components/TradeFilters";
import { TradesTable } from "@/components/TradesTable";
import { PageHeader } from "@/components/PageHeader";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { db } from "@/lib/api";
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
  account_name?: string;
}

const Trades = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      case 'es': return es;
      case 'nl': return nl;
      default: return enUS;
    }
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preselectedDate, setPreselectedDate] = useState<Date>();
  const [editTrade, setEditTrade] = useState<Trade | null>(null);
  const [filters, setFilters] = useState<TradeFilterOptions>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadTrades();
    }
  }, [user]);

  useEffect(() => {
    const shouldAddTrade = searchParams.get('addTrade') === 'true';
    const dateParam = searchParams.get('date');
    
    if (shouldAddTrade && !loading) {
      setEditTrade(null);
      setPreselectedDate(new Date());
      setAddDialogOpen(true);
      // Remove URL parameter to prevent reopening on refresh
      searchParams.delete('addTrade');
      setSearchParams(searchParams, { replace: true });
    }
    
    if (dateParam && !loading) {
      // Set filter for the specific date
      const selectedDate = new Date(dateParam);
      const dateStart = new Date(selectedDate);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(selectedDate);
      dateEnd.setHours(23, 59, 59, 999);
      
      setFilters({
        dateFrom: dateStart,
        dateTo: dateEnd,
      });
      
      // Update calendar view to show that month
      setCurrentMonth(selectedDate);
      setSelectedDate(selectedDate);
      
      // Remove URL parameter after applying filter
      searchParams.delete('date');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, loading, setSearchParams]);

  const loadTrades = async () => {
    setLoading(true);
    const { data, error } = await db
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

  // Get trades for current month
  const currentMonthTrades = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59);
    
    return filteredTrades.filter((trade) => {
      const tradeDate = new Date(trade.exit_time);
      return tradeDate >= monthStart && tradeDate <= monthEnd;
    });
  }, [filteredTrades, currentMonth]);


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

  const handleDeleteTrade = async (tradeId: string) => {
    const { error } = await db.from("trades").delete().eq("id", tradeId);
    if (error) {
      toast.error(t("trades.deleteError"));
    } else {
      toast.success(t("trades.deleteSuccess"));
      loadTrades();
    }
  };

  const webhookTrades = useMemo(() => {
    return trades.filter((trade) => trade.account_name);
  }, [trades]);

  const handleDeleteAllWebhookTrades = async () => {
    if (!user) return;
    
    const { error } = await db
      .from("trades")
      .delete()
      .eq("user_id", user.id)
      .not("account_name", "is", null);
    
    if (error) {
      toast.error(t("trades.deleteAllWebhookError"));
    } else {
      toast.success(t("trades.deleteAllWebhookSuccess", { count: webhookTrades.length }));
      loadTrades();
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <PageHeader
        title={t("trades.title")}
        subtitle={t("trades.subtitle")}
        actions={
          <div className="flex items-center gap-2">
            {webhookTrades.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("trades.deleteAllWebhook", { count: webhookTrades.length })}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("trades.deleteAllWebhookDialog.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("trades.deleteAllWebhookDialog.description", { count: webhookTrades.length })}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAllWebhookTrades}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {t("common.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <TradeFilters
              onFilterChange={setFilters}
              availableSetups={availableSetups}
              compact
            />
          </div>
        }
      />


      <div className="overflow-auto">
        <TradeCalendar
          trades={filteredTrades}
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate}
          onAddTrade={handleAddTradeForDate}
          onEditTrade={handleEditTrade}
          onMonthChange={setCurrentMonth}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {t("trades.monthlyOverview", { 
              month: format(currentMonth, 'MMMM yyyy', { locale: getLocale() })
            })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {currentMonthTrades.length} {currentMonthTrades.length === 1 ? 'trade' : 'trades'}
          </p>
        </div>
        <TradesTable 
          trades={currentMonthTrades} 
          onEditTrade={handleEditTrade}
          onDeleteTrade={handleDeleteTrade}
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
