import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { de, enUS, fr, es, nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FinancialNews } from "./FinancialNews";
import { usePoliticalEvents } from "@/hooks/usePoliticalEvents";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import trumpEmoji from "@/assets/trump-emoji.png";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  // Temporarily disabled due to API rate limits
  // const { getEventsForDate } = usePoliticalEvents(calendarStart, calendarEnd);
  const getEventsForDate = (date: Date) => [];

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

  const getSymbolsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const symbols = trades
      .filter(trade => trade.exit_time.startsWith(dateStr))
      .map(trade => trade.symbol);
    return [...new Set(symbols)];
  };

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2000, i, 1), 'MMMM', { locale: getLocale() })
  }));

  const currentYear = currentMonth.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear - 5 + i).toString(),
    label: (currentYear - 5 + i).toString()
  }));

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(parseInt(month));
    setCurrentMonth(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
  };

  const getDayPnL = (date: Date) => {
    const dayTrades = getTradesForDate(date);
    return dayTrades.reduce((sum, trade) => sum + trade.pnl_net, 0);
  };

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 h-full">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground pb-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {calendarDays.map((day, idx) => {
                const dayTrades = getTradesForDate(day);
                const dayPnL = getDayPnL(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const politicalEvents = getEventsForDate(day);
                const hasTrumpEvent = politicalEvents.some(e => e.type === 'trump_speech');

                return (
                  <div
                    key={idx}
                    onClick={() => onDateSelect(day)}
                    className={`
                      relative border rounded-lg p-3 min-h-[120px] cursor-pointer transition-all
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                      ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent'}
                      ${dayTrades.length > 0 ? 'border-primary/50' : 'border-border'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {format(day, 'd')}
                        </span>
                        {hasTrumpEvent && isCurrentMonth && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <img 
                                  src={trumpEmoji} 
                                  alt="Trump speech" 
                                  className="h-5 w-5 object-contain" 
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">{politicalEvents.find(e => e.type === 'trump_speech')?.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      {isCurrentMonth && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddTrade(day);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {dayTrades.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {dayTrades.slice(0, 2).map(trade => (
                            <Badge
                              key={trade.id}
                              variant={trade.side === "long" ? "default" : "secondary"}
                              className="text-xs px-1"
                            >
                              {trade.symbol}
                            </Badge>
                          ))}
                          {dayTrades.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1">
                              +{dayTrades.length - 2}
                            </Badge>
                          )}
                        </div>
                        <div className={`text-xs font-semibold ${dayPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${dayPnL.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 space-y-6">
        {selectedDate && (
          <>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {format(selectedDate, 'PPP', { locale: getLocale() })}
                  </h3>
                  <Button size="sm" onClick={() => onAddTrade(selectedDate)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("trades.addTrade")}
                  </Button>
                </div>

                {getTradesForDate(selectedDate).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("trades.noTradesOnDate")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {getTradesForDate(selectedDate).map(trade => (
                      <div
                        key={trade.id}
                        className="flex items-center justify-between p-2 rounded border"
                      >
                        <div className="flex items-center gap-2">
                          <Badge variant={trade.side === "long" ? "default" : "secondary"}>
                            {trade.side}
                          </Badge>
                          <span className="text-sm font-medium">{trade.symbol}</span>
                        </div>
                        <span className={`text-sm font-semibold ${trade.pnl_net >= 0 ? 'text-success' : 'text-destructive'}`}>
                          ${trade.pnl_net.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t("dashboard.netPnL")}:</span>
                        <span className={`font-bold ${
                          getDayPnL(selectedDate) >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          ${getDayPnL(selectedDate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <FinancialNews
              date={selectedDate}
              symbols={getSymbolsForDate(selectedDate)}
            />
          </>
        )}
      </div>
    </div>
  );
}
