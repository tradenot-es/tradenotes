import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { de, enUS, fr, es, nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PoliticalEvents } from "./PoliticalEvents";
import { usePoliticalEvents } from "@/hooks/usePoliticalEvents";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import trumpEmoji from "@/assets/trump-emoji.png";
import { db } from "@/lib/api";
import { useEffect } from "react";
import { getCurrencySymbol } from "@/lib/utils";
import { getCategoryIcon } from "@/lib/economicCalendar";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  market?: string;
  pnl_net: number;
  entry_time: string;
  exit_time: string;
}

interface TradeCalendarProps {
  trades: Trade[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  onAddTrade: (date: Date) => void;
  onEditTrade?: (trade: Trade) => void;
  onMonthChange?: (date: Date) => void;
}

export function TradeCalendar({ trades, onDateSelect, selectedDate, onAddTrade, onEditTrade, onMonthChange }: TradeCalendarProps) {
  const { t, i18n } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currency, setCurrency] = useState("USD");
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  // Load currency from settings
  useEffect(() => {
    const loadCurrency = async () => {
      const { data } = await db
        .from("user_settings")
        .select("base_currency")
        .maybeSingle();
      
      if (data?.base_currency) {
        setCurrency(getCurrencySymbol(data.base_currency));
      }
    };
    loadCurrency();
  }, []);
  
  // Weekly batch fetching of political events
  // Weekly batch fetching of political events + scheduled economic events
  const { hasEventsOnDate, getEventsForDate, loading: politicalEventsLoading, events: allPoliticalEvents, hasScheduledEventsOnDate } = usePoliticalEvents(calendarStart, calendarEnd);

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


  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = format(new Date(), 'yyyy-MM-dd');

  // 7 Jan 2024 is a Sunday; the grid starts on Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => format(new Date(2024, 0, 7 + i), 'EEE', { locale: getLocale() }));
  
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
    onMonthChange?.(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    setCurrentMonth(newDate);
    onMonthChange?.(newDate);
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
              onClick={() => {
                const newMonth = subMonths(currentMonth, 1);
                setCurrentMonth(newMonth);
                onMonthChange?.(newMonth);
              }}
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
              onClick={() => {
                const newMonth = addMonths(currentMonth, 1);
                setCurrentMonth(newMonth);
                onMonthChange?.(newMonth);
              }}
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
                const isToday = format(day, 'yyyy-MM-dd') === today;
                const hasPoliticalEvents = hasEventsOnDate(day);
                const politicalEvents = getEventsForDate(day);
                const hasScheduledEvent = politicalEvents.some(e => e.isScheduled);
                const hasTrumpEvent = politicalEvents.some(e => 
                  e.title.toLowerCase().includes('trump') && 
                  (e.title.toLowerCase().includes('speech') || 
                   e.title.toLowerCase().includes('rally') || 
                   e.title.toLowerCase().includes('address'))
                );
                const hasHighImpact = politicalEvents.some(e => e.impact_level === 'high');
                const hasMediumImpact = politicalEvents.some(e => e.impact_level === 'medium');
                
                // Get category for scheduled events (for icon display)
                const scheduledEvent = politicalEvents.find(e => e.isScheduled);
                const scheduledCategory = scheduledEvent?.category;

                return (
                  <div
                    key={idx}
                    onClick={() => onDateSelect(day)}
                    className={`
                      relative border rounded-lg p-3 min-h-[120px] cursor-pointer transition-all
                      ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                      ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}
                      ${isSelected ? 'ring-2 ring-primary' : 'hover:bg-accent'}
                      ${dayTrades.length > 0 ? 'border-primary/50' : 'border-border'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-medium ${isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {format(day, 'd')}
                        </span>
                        {hasPoliticalEvents && isCurrentMonth && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {hasTrumpEvent ? (
                                  <img 
                                    src={trumpEmoji} 
                                    alt="Political event" 
                                    className="h-5 w-5 object-contain cursor-help" 
                                  />
                                ) : hasScheduledEvent && scheduledCategory ? (
                                  <span className="text-base cursor-help">{getCategoryIcon(scheduledCategory)}</span>
                                ) : hasHighImpact ? (
                                  <span className="text-base cursor-help">🔴</span>
                                ) : hasMediumImpact ? (
                                  <span className="text-base cursor-help">🟡</span>
                                ) : (
                                  <span className="text-base cursor-help">🔔</span>
                                )}
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-semibold text-xs mb-1">{t("calendar.politicalEventsToday")}</p>
                                {politicalEvents.slice(0, 2).map((event, idx) => (
                                  <p key={idx} className="text-xs opacity-90">• {event.title}</p>
                                ))}
                                {politicalEvents.length > 2 && (
                                  <p className="text-xs opacity-70 mt-1">+{politicalEvents.length - 2} {t("calendar.moreEvents")}</p>
                                )}
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
                      <div className="flex items-center justify-center h-full">
                        <div className={`text-lg font-bold ${dayPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {dayPnL >= 0 ? '+' : '-'}{currency}{Math.abs(dayPnL).toFixed(0)}
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
                        className="flex items-center justify-between p-2 rounded border group hover:border-primary transition-colors"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Badge variant={trade.side === "long" ? "default" : "secondary"}>
                            {trade.side}
                          </Badge>
                          <span className="text-sm font-medium">{trade.symbol}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${trade.pnl_net >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {currency}{trade.pnl_net.toFixed(2)}
                          </span>
                          {onEditTrade && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={() => onEditTrade(trade)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{t("dashboard.netPnL")}:</span>
                        <span className={`font-bold ${
                          getDayPnL(selectedDate) >= 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {currency}{getDayPnL(selectedDate).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <PoliticalEvents
              date={selectedDate} 
              events={getEventsForDate(selectedDate)}
              loading={politicalEventsLoading}
              hasAnyEventsInPeriod={allPoliticalEvents.length > 0}
            />
          </>
        )}
      </div>
    </div>
  );
}
