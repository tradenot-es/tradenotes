import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de, enUS, fr, es, nl } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  pnl_net: number;
  entry_time: string;
  exit_time: string;
}

interface TradeCalendarProps {
  trades: Trade[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  onAddTrade: (date: Date) => void;
}

export function TradeCalendar({ trades, onDateSelect, selectedDate, onAddTrade }: TradeCalendarProps) {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    switch (i18n.language) {
      case 'de': return de;
      case 'fr': return fr;
      case 'es': return es;
      case 'nl': return nl;
      default: return enUS;
    }
  };

  const getTradesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return trades.filter(trade => {
      const tradeDate = format(new Date(trade.exit_time), 'yyyy-MM-dd');
      return tradeDate === dateStr;
    });
  };

  const selectedDateTrades = selectedDate ? getTradesForDate(selectedDate) : [];

  // Mark days with trades
  const modifiers = {
    hasTrades: (date: Date) => getTradesForDate(date).length > 0
  };

  const modifiersClassNames = {
    hasTrades: "bg-primary/20 font-bold"
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t("trades.calendarView")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            locale={getLocale()}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
          />
          <p className="text-sm text-muted-foreground mt-4">
            {t("trades.selectDate")}
          </p>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {t("trades.tradesOnDate")} {format(selectedDate, 'PPP', { locale: getLocale() })}
            </CardTitle>
            <Button size="sm" onClick={() => onAddTrade(selectedDate)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("trades.addTrade")}
            </Button>
          </CardHeader>
          <CardContent>
            {selectedDateTrades.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">{t("trades.noTradesOnDate")}</p>
                <Button onClick={() => onAddTrade(selectedDate)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  {t("trades.addTrade")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant={trade.side === "long" ? "default" : "secondary"}>
                        {trade.side === "long" ? (
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                        )}
                        {trade.side}
                      </Badge>
                      <span className="font-medium">{trade.symbol}</span>
                    </div>
                    <span className={`font-semibold ${trade.pnl_net >= 0 ? "text-success" : "text-destructive"}`}>
                      ${trade.pnl_net.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t("dashboard.netPnL")}:</span>
                    <span className={`font-bold ${
                      selectedDateTrades.reduce((sum, t) => sum + t.pnl_net, 0) >= 0
                        ? "text-success"
                        : "text-destructive"
                    }`}>
                      ${selectedDateTrades.reduce((sum, t) => sum + t.pnl_net, 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
