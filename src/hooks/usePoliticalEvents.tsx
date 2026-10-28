import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfWeek, endOfWeek, addDays, subDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { eventTimeZone, getEconomicEventsInRange, type EconomicEvent } from "@/lib/economicCalendar";
import { apiFetch } from "@/lib/api";
import { utcToZoned, zonedToUtc, zoneAbbreviation } from "@/lib/timezone";
import { useTimeZone } from "@/hooks/useTimeZone";

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
  /** HH:MM in the viewer's time zone (date is converted too) */
  time?: string;
  /** short name of the viewer's zone at that moment, e.g. "MEZ" or "EDT" */
  zoneLabel?: string;
  /** UTC milliseconds, for sorting; undefined for all-day events */
  instant?: number;
}

/** Moves an event given in its source zone to the viewer's zone (date and time). */
function toViewerZone(event: PoliticalEvent, sourceZone: string, viewerZone: string, language: string): PoliticalEvent {
  if (!event.time) return event;
  const instant = zonedToUtc(event.date, event.time, sourceZone);
  const local = utcToZoned(instant, viewerZone);
  return { ...event, date: local.date, time: local.time, instant, zoneLabel: zoneAbbreviation(instant, viewerZone, language) };
}

export function usePoliticalEvents(startDate: Date, endDate: Date) {
  const timeZone = useTimeZone();
  const { i18n } = useTranslation();
  // Memoize date range to prevent unnecessary re-fetches
  const dateRange = useMemo(() => {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(endDate, { weekStartsOn: 0 });
    // a day extra on both sides: converted to the viewer's zone, events can move across midnight
    const from = subDays(weekStart, 1);
    const to = addDays(weekEnd, 1);
    return {
      start: format(from, 'yyyy-MM-dd'),
      end: format(to, 'yyyy-MM-dd'),
      startDate: from,
      endDate: to
    };
  }, [startDate.getTime(), endDate.getTime()]);

  // Get static economic events for the date range
  const scheduledEvents = useMemo((): PoliticalEvent[] => {
    const economicEvents = getEconomicEventsInRange(dateRange.startDate, dateRange.endDate);
    return economicEvents.map(event => toViewerZone({
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
    }, eventTimeZone(event), timeZone, i18n.language));
  }, [dateRange.startDate, dateRange.endDate, timeZone, i18n.language]);

  const { data: marketEventsRaw = [], isLoading } = useQuery({
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

  // Fed and White House publish in New York time
  const marketEvents = useMemo(
    () => marketEventsRaw.map((event) => toViewerZone(event, 'America/New_York', timeZone, i18n.language)),
    [marketEventsRaw, timeZone, i18n.language],
  );

  // all-day events first, then by the actual moment
  const allEvents = useMemo(
    () => [...scheduledEvents, ...marketEvents].sort((a, b) => (a.instant ?? 0) - (b.instant ?? 0)),
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
    timeZone,
    hasEventsOnDate, 
    getEventsForDate,
    hasScheduledEventsOnDate
  };
}
