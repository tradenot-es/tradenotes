import { useState, useEffect } from "react";
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

  useEffect(() => {
    loadWeeklyEvents();
  }, [startDate, endDate]);

  const loadWeeklyEvents = async () => {
    setLoading(true);
    
    try {
      // Calculate week boundaries for efficient batching
      const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(endDate, { weekStartsOn: 0 });
      
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');

      const { data, error } = await supabase.functions.invoke('marketaux-news', {
        body: { 
          action: 'get-political-events',
          startDate: startStr,
          endDate: endStr,
          keywords: 'Trump,Fed,Powell,Biden,election,policy',
          limit: 50
        }
      });

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
        
        setEventsByDate(grouped);
      }
    } catch (err) {
      console.error('Error loading political events:', err);
    } finally {
      setLoading(false);
    }
  };

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
