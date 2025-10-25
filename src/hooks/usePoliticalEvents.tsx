import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PoliticalEvent {
  date: string;
  type: 'trump_speech' | 'biden_speech' | 'fed_meeting';
  title: string;
}

export function usePoliticalEvents(startDate: Date, endDate: Date) {
  const [events, setEvents] = useState<PoliticalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [startDate, endDate]);

  const loadEvents = async () => {
    setLoading(true);
    const eventsMap = new Map<string, PoliticalEvent>();

    try {
      // Only check every 3rd day to reduce API calls (approximately 10-14 requests per month instead of 30-42)
      const currentDate = new Date(startDate);
      const end = new Date(endDate);
      let dayCount = 0;

      while (currentDate <= end) {
        // Only make request every 3rd day
        if (dayCount % 3 === 0) {
          const dateStr = format(currentDate, 'yyyy-MM-dd');
          
          try {
            const { data, error } = await supabase.functions.invoke('financial-news', {
              body: { 
                action: 'get-articles',
                date: dateStr,
                symbols: []
              }
            });

            if (!error && data?.success && data.articles) {
              // Check for Trump speeches
              const trumpArticles = data.articles.filter((article: any) => {
                const text = `${article.title} ${article.description}`.toLowerCase();
                return (
                  text.includes('trump') && 
                  (text.includes('speech') || text.includes('rally') || text.includes('address') || text.includes('statement'))
                );
              });

              if (trumpArticles.length > 0) {
                eventsMap.set(dateStr, {
                  date: dateStr,
                  type: 'trump_speech',
                  title: trumpArticles[0].title
                });
              }
            }
          } catch (err) {
            // Silently ignore individual request errors to not break the entire flow
            console.log('Skipping date due to API limit:', dateStr);
          }

          // Add a small delay between requests to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        currentDate.setDate(currentDate.getDate() + 1);
        dayCount++;
      }

      setEvents(Array.from(eventsMap.values()));
    } catch (err) {
      console.error('Error loading political events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.filter(e => e.date === dateStr);
  };

  return { events, loading, getEventsForDate };
}