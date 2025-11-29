import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";

interface PoliticalEvent {
  uuid: string;
  date: string;
  title: string;
  snippet: string;
  url: string;
  published_at: string;
  source: string;
}

export function usePoliticalEvents(startDate: Date, endDate: Date) {
  const [events, setEvents] = useState<PoliticalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventsByDate, setEventsByDate] = useState<Map<string, PoliticalEvent[]>>(new Map());

  // Memoize date range to prevent unnecessary re-fetches
  const dateRange = useMemo(() => {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(endDate, { weekStartsOn: 0 });
    return {
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd')
    };
  }, [startDate.getTime(), endDate.getTime()]);

  useEffect(() => {
    let isMounted = true;

    const loadWeeklyEvents = async () => {
      if (loading) return; // Prevent concurrent calls
      
      setLoading(true);
      
      try {
        console.log('usePoliticalEvents: Loading events from', dateRange.start, 'to', dateRange.end);

        const { data, error } = await supabase.functions.invoke('marketaux-news', {
          body: { 
            action: 'get-political-events',
            startDate: dateRange.start,
            endDate: dateRange.end,
            keywords: 'Trump,Fed,Powell,Biden,election,policy',
            limit: 50
          }
        });

        if (!isMounted) return;

        console.log('usePoliticalEvents: Response', { success: data?.success, articleCount: data?.articles?.length, error });

        if (!error && data?.success && data.articles) {
          const fetchedEvents: PoliticalEvent[] = data.articles;
          setEvents(fetchedEvents);
          
          // Group events by date for O(1) lookup
          const grouped = new Map<string, PoliticalEvent[]>();
          fetchedEvents.forEach(event => {
            const dateKey = event.date;
            if (!grouped.has(dateKey)) {
              grouped.set(dateKey, []);
            }
            grouped.get(dateKey)!.push(event);
          });
          
          console.log('usePoliticalEvents: Grouped events by date', Array.from(grouped.keys()));
          
          setEventsByDate(grouped);
        }
      } catch (err) {
        console.error('Error loading political events:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadWeeklyEvents();

    return () => {
      isMounted = false;
    };
  }, [dateRange.start, dateRange.end]); // Only re-fetch when date range actually changes

  const hasEventsOnDate = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate.has(dateStr) && eventsByDate.get(dateStr)!.length > 0;
  };

  const getEventsForDate = (date: Date): PoliticalEvent[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateStr) || [];
  };

  return { 
    events, 
    loading, 
    hasEventsOnDate, 
    getEventsForDate 
  };
}
