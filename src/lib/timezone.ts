// Time zone conversion with the platform's Intl data (no library): calendar events are stored
// in the wall-clock time of the institution that publishes them and shown in the viewer's zone,
// so daylight saving time on both sides (US, EU, UK switch on different dates) is handled.

/** The time zone of this device, e.g. "Europe/Berlin". */
export function deviceTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function wallClock(utcMs: number, zone: string) {
  let fmt = partsFormatters.get(zone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsFormatters.set(zone, fmt);
  }
  const p = Object.fromEntries(fmt.formatToParts(new Date(utcMs)).map((x) => [x.type, x.value]));
  return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour, minute: +p.minute, second: +p.second };
}

/** Offset of the zone from UTC at that instant, in milliseconds (e.g. +2h for Berlin in summer). */
function offsetAt(utcMs: number, zone: string): number {
  const w = wallClock(utcMs, zone);
  return Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second) - Math.floor(utcMs / 1000) * 1000;
}

/** "2026-10-28" + "14:00" in "America/New_York" → UTC milliseconds. */
export function zonedToUtc(date: string, time: string, zone: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const asUtc = Date.UTC(y, m - 1, d, hh, mm);
  // two passes: the offset can differ between the guess and the result around a DST switch
  let utc = asUtc - offsetAt(asUtc, zone);
  utc = asUtc - offsetAt(utc, zone);
  return utc;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Local date ("YYYY-MM-DD") and time ("HH:MM") of an instant in a zone. */
export function utcToZoned(utcMs: number, zone: string): { date: string; time: string } {
  const w = wallClock(utcMs, zone);
  return { date: `${w.year}-${pad(w.month)}-${pad(w.day)}`, time: `${pad(w.hour)}:${pad(w.minute)}` };
}

/** Short zone name at that instant in the given language, e.g. "MEZ", "EDT", "GMT+9". */
export function zoneAbbreviation(utcMs: number, zone: string, language: string): string {
  const part = new Intl.DateTimeFormat(language, { timeZone: zone, timeZoneName: "short" })
    .formatToParts(new Date(utcMs))
    .find((x) => x.type === "timeZoneName");
  return part?.value ?? zone;
}
