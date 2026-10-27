import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { de, enUS, fr, es, nl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrency } from "@/hooks/useCurrency";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  pnl_net: number;
  exit_time: string;
}

interface DashboardCalendarProps {
  trades: Trade[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onEditTrade?: (trade: Trade) => void;
  onDeleteTrade?: (tradeId: string) => void;
}

export function DashboardCalendar({ trades, currentMonth, onMonthChange, onEditTrade, onDeleteTrade }: DashboardCalendarProps) {
  const { t, i18n } = useTranslation();
  const { formatCurrency } = useCurrency();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

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

  const getDayPnL = (date: Date) => {
    const dayTrades = getTradesForDate(date);
    return dayTrades.reduce((sum, trade) => sum + trade.pnl_net, 0);
  };

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  // 7 Jan 2024 is a Sunday; the grid starts on Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => format(new Date(2024, 0, 7 + i), 'EEE', { locale: getLocale() }));
  const today = format(new Date(), 'yyyy-MM-dd');
  
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
    onMonthChange(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(parseInt(year));
    onMonthChange(newDate);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
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
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
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
              const isToday = format(day, 'yyyy-MM-dd') === today;

              return (
                <div
                  key={idx}
                  className={`
                    relative border rounded-lg p-3 min-h-[100px] transition-all group
                    ${isCurrentMonth ? 'bg-card' : 'bg-muted/20'}
                    ${isToday ? 'ring-2 ring-primary bg-primary/5' : ''}
                    ${dayTrades.length > 0 ? 'border-primary/50 cursor-pointer hover:border-primary' : 'border-border'}
                  `}
                  onClick={() => {
                    if (dayTrades.length === 1 && onEditTrade) {
                      onEditTrade(dayTrades[0]);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-sm font-medium ${isToday ? 'text-primary font-bold' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {format(day, 'd')}
                    </span>
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
                        {formatCurrency(dayPnL)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {dayTrades.length} {dayTrades.length === 1 ? 'trade' : 'trades'}
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
  );
}
