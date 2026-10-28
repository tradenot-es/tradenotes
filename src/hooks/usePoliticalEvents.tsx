import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { getEconomicEventsInRange, type EconomicEvent } from "@/lib/economicCalendar";
import { apiFetch } from "@/lib/api";

// announced Fed speeches, FOMC minutes and presidential appearances (server/src/marketEvents.ts)
interface MarketEvent {
  id: string;
  source: "fed" | "whitehouse";
  date: string;
  time: string | null;
  category: "fed_speech" | "fomc" | "trump";
  title: string;
  description: string | null;
  impact: "high" | "medium" | "political";
  url: string | null;
}

export interface PoliticalEvent {
  uuid: string;
  date: string;
  title: string;
  snippet: string;
  url: string;
  published_at: string;
  source: string;
  impact_level?: 'high' | 'medium' | 'low' | 'political';
  isScheduled?: boolean;
  category?: EconomicEvent['category'];
  time?: string;
}

export function usePoliticalEvents(startDate: Date, endDate: Date) {
  // Memoize date range to prevent unnecessary re-fetches
  const dateRange = useMemo(() => {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(endDate, { weekStartsOn: 0 });
    return {
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd'),
      startDate: weekStart,
      endDate: weekEnd
    };
  }, [startDate.getTime(), endDate.getTime()]);

  // Get static economic events for the date range
  const scheduledEvents = useMemo((): PoliticalEvent[] => {
    const economicEvents = getEconomicEventsInRange(dateRange.startDate, dateRange.endDate);
    return economicEvents.map(event => ({
      uuid: event.id,
      date: event.date,
      title: event.title,
      snippet: event.description,
      url: '', // No external link for scheduled events
      published_at: event.date,
      source: 'Economic Calendar',
      impact_level: event.impact as 'high' | 'medium' | 'low' | 'political',
      isScheduled: true,
      category: event.category,
      time: event.time
    }));
  }, [dateRange.startDate, dateRange.endDate]);

  const { data: marketEvents = [], isLoading } = useQuery({
    queryKey: ["market-events", dateRange.start, dateRange.end],
    queryFn: async () => {
      const { data, error } = await apiFetch<{ events: MarketEvent[] }>(
        `/api/market-events?from=${dateRange.start}&to=${dateRange.end}`,
      );
      if (error) throw error;
      return data.events.map((event): PoliticalEvent => ({
        uuid: event.id,
        date: event.date,
        title: event.title,
        snippet: event.description ?? "",
        url: event.url ?? "",
        published_at: event.date,
        source: event.source,
        impact_level: event.impact,
        isScheduled: true,
        category: event.category,
        time: event.time ?? undefined,
      }));
    },
    // the server refreshes its copy hourly
    staleTime: 15 * 60 * 1000,
  });

  const allEvents = useMemo(
    () => [...scheduledEvents, ...marketEvents].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),
    [scheduledEvents, marketEvents],
  );

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, PoliticalEvent[]>();
    for (const event of allEvents) {
      if (!grouped.has(event.date)) grouped.set(event.date, []);
      grouped.get(event.date)!.push(event);
    }
    return grouped;
  }, [allEvents]);

  const hasEventsOnDate = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate.has(dateStr) && eventsByDate.get(dateStr)!.length > 0;
  };

  const getEventsForDate = (date: Date): PoliticalEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateStr) || [];
  };

  const hasScheduledEventsOnDate = (date: Date): boolean => {
    const events = getEventsForDate(date);
    return events.some(e => e.isScheduled);
  };

  return {
    events: allEvents,
    loading: isLoading,
    hasEventsOnDate, 
    getEventsForDate,
    hasScheduledEventsOnDate
  };
}
