import { useQuery } from "@tanstack/react-query";
import { db } from "@/lib/api";
import { deviceTimeZone, isValidTimeZone } from "@/lib/timezone";

/**
 * Time zone for showing calendar times: the one chosen in the settings, otherwise ("automatic",
 * stored as null) the zone of this device. US users see New York or Chicago time, EU users
 * Berlin or Paris time and so on, each with their own daylight saving rules.
 */
export function useTimeZone(): string {
  const { data } = useQuery({
    queryKey: ["user-settings", "timezone"],
    queryFn: async () => {
      const { data } = await db.from("user_settings").select("timezone").maybeSingle();
      return (data?.timezone as string | null) ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
  return data && isValidTimeZone(data) ? data : deviceTimeZone();
}
