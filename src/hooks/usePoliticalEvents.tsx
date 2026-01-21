import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { getEconomicEventsInRange, type EconomicEvent } from "@/lib/economicCalendar";

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

// Impact-Level Keywords - expanded to include geopolitical events, global summits, and central banks
const HIGH_IMPACT_KEYWORDS = [
  'FOMC', 'CPI', 'NFP', 'jobs report', 'interest rate', 'rate hike', 'rate cut', 
  'Federal Reserve', 'Fed rate', 'war', 'invasion', 'military', 'sanctions', 
  'crash', 'default', 'debt ceiling', 'shutdown', 'recession',
  'Davos', 'WEF', 'World Economic Forum', 'G7', 'G20', 'Jackson Hole',
  'UN General Assembly', 'BRICS Summit', 'EU Summit',
  'ECB', 'Lagarde', 'European Central Bank', 'OPEC', 'oil production',
  'Bank of England', 'BoE', 'Bailey', 'Bank of Japan', 'BoJ', 'Ueda',
  'midterm', 'election', 'congress', 'senate'
];
const MEDIUM_IMPACT_KEYWORDS = [
  'GDP', 'unemployment', 'inflation', 'earnings', 'ISM', 'PPI', 'retail sales', 
  'housing', 'oil', 'China trade', 'tariff', 'stimulus', 'volatility',
  'VIX', 'selloff', 'rally', 'carry trade', 'yen', 'euro', 'pound'
];
const POLITICAL_KEYWORDS = [
  'Trump', 'Biden', 'policy', 'White House',
  'geopolitical', 'NATO', 'Europe', 'Russia', 'China', 'conflict', 'nuclear'
];

function categorizeEvent(title: string): 'high' | 'medium' | 'political' {
  const lowerTitle = title.toLowerCase();
  if (HIGH_IMPACT_KEYWORDS.some(kw => lowerTitle.includes(kw.toLowerCase()))) return 'high';
  if (MEDIUM_IMPACT_KEYWORDS.some(kw => lowerTitle.includes(kw.toLowerCase()))) return 'medium';
  return 'political';
}

export function usePoliticalEvents(startDate: Date, endDate: Date) {
  const [newsEvents, setNewsEvents] = useState<PoliticalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventsByDate, setEventsByDate] = useState<Map<string, PoliticalEvent[]>>(new Map());

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

  // Combine scheduled + news events
  const allEvents = useMemo(() => {
    // Merge scheduled events with news events
    const combined = [...scheduledEvents, ...newsEvents];
    
    // Sort by date, then scheduled events first
    combined.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // Scheduled events come first
      if (a.isScheduled && !b.isScheduled) return -1;
      if (!a.isScheduled && b.isScheduled) return 1;
      return 0;
    });
    
    return combined;
  }, [scheduledEvents, newsEvents]);

  // Group all events by date
  useEffect(() => {
    const grouped = new Map<string, PoliticalEvent[]>();
    
    allEvents.forEach(event => {
      const dateKey = event.date;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(event);
    });
    
    setEventsByDate(grouped);
  }, [allEvents]);

  // Fetch news events from API
  useEffect(() => {
    let isMounted = true;

    const loadWeeklyEvents = async () => {
      if (loading) return; // Prevent concurrent calls
      
      setLoading(true);
      
      try {
        console.log('usePoliticalEvents: Loading news from', dateRange.start, 'to', dateRange.end);

        const { data, error } = await supabase.functions.invoke('marketaux-news', {
          body: { 
            action: 'get-political-events',
            startDate: dateRange.start,
            endDate: dateRange.end,
            keywords: 'Trump,Fed,Powell,Biden,FOMC,CPI,inflation,NFP,jobs report,interest rate,GDP,earnings,tariff,rate hike,rate cut,war,invasion,sanctions,military,China,Russia,OPEC,oil,recession,crash,stimulus,Davos,WEF,World Economic Forum,G7,G20,BRICS,EU Summit,UN General Assembly,Jackson Hole,ECB,Lagarde,European Central Bank,Bank of England,BoE,Bailey,Bank of Japan,BoJ,Ueda,midterm,election,oil production,carry trade',
            limit: 50
          }
        });

        if (!isMounted) return;

        console.log('usePoliticalEvents: Response', { success: data?.success, articleCount: data?.articles?.length, error });

        if (!error && data?.success && data.articles) {
          // Add impact level categorization to each news event
          const fetchedEvents: PoliticalEvent[] = data.articles.map((article: any) => ({
            ...article,
            impact_level: categorizeEvent(article.title),
            isScheduled: false
          }));
          setNewsEvents(fetchedEvents);
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

  const hasScheduledEventsOnDate = (date: Date): boolean => {
    const events = getEventsForDate(date);
    return events.some(e => e.isScheduled);
  };

  return { 
    events: allEvents, 
    loading, 
    hasEventsOnDate, 
    getEventsForDate,
    hasScheduledEventsOnDate
  };
}
