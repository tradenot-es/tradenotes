// Checks for src/lib/timezone.ts around the DST switches: npx tsx src/lib/timezone.check.ts
import { utcToZoned, zonedToUtc, zoneAbbreviation } from "./timezone";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : ` → ${JSON.stringify(actual)} (expected ${JSON.stringify(expected)})`}`);
  if (!ok) failures++;
}
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 16);

// FOMC 28.10.2026 14:00 New York: US still on summer time (EDT, until 1.11.), EU already on winter time (since 25.10.)
const fomc = zonedToUtc("2026-10-28", "14:00", "America/New_York");
check("FOMC in UTC", iso(fomc), "2026-10-28T18:00");
check("FOMC in Berlin", utcToZoned(fomc, "Europe/Berlin"), { date: "2026-10-28", time: "19:00" });
check("FOMC in Tokyo is the next day", utcToZoned(fomc, "Asia/Tokyo"), { date: "2026-10-29", time: "03:00" });
check("FOMC in Los Angeles", utcToZoned(fomc, "America/Los_Angeles"), { date: "2026-10-28", time: "11:00" });
// one week later both sides are on winter time: the gap is 6 hours again
const fomcDec = zonedToUtc("2026-12-09", "14:00", "America/New_York");
check("FOMC December in Berlin", utcToZoned(fomcDec, "Europe/Berlin"), { date: "2026-12-09", time: "20:00" });

// ECB 18.03.2027 14:15 Frankfurt: US already on summer time (since 14.3.), EU not yet (28.3.)
const ecb = zonedToUtc("2027-03-18", "14:15", "Europe/Berlin");
check("ECB in New York during the gap", utcToZoned(ecb, "America/New_York"), { date: "2027-03-18", time: "09:15" });
const ecbApril = zonedToUtc("2027-04-29", "14:15", "Europe/Berlin");
check("ECB in New York in April", utcToZoned(ecbApril, "America/New_York"), { date: "2027-04-29", time: "08:15" });

// BoE 12:00 London in summer (BST) and winter (GMT)
check("BoE June in UTC", iso(zonedToUtc("2027-06-17", "12:00", "Europe/London")), "2027-06-17T11:00");
check("BoE December in UTC", iso(zonedToUtc("2027-12-16", "12:00", "Europe/London")), "2027-12-16T12:00");

// southern hemisphere: Sydney is on summer time in December
check("NFP December in Sydney", utcToZoned(zonedToUtc("2026-12-04", "08:30", "America/New_York"), "Australia/Sydney"), { date: "2026-12-05", time: "00:30" });

// wall-clock times on the switch days themselves
check("New York 08:30 on switch day (spring)", iso(zonedToUtc("2027-03-14", "08:30", "America/New_York")), "2027-03-14T12:30");
check("New York 08:30 on switch day (autumn)", iso(zonedToUtc("2026-11-01", "08:30", "America/New_York")), "2026-11-01T13:30");
check("India (no DST, half-hour offset)", utcToZoned(fomc, "Asia/Kolkata"), { date: "2026-10-28", time: "23:30" });

// zone names: German has no name for US zones, the English one is used then
check("German name for Berlin in winter", zoneAbbreviation(fomcDec, "Europe/Berlin", "de"), "MEZ");
check("US zone in German falls back to English", zoneAbbreviation(fomc, "America/New_York", "de"), "EDT");
check("US zone in winter", zoneAbbreviation(fomcDec, "America/New_York", "de"), "EST");

console.log(failures ? `\n${failures} check(s) failed` : "\nall time zone checks passed");
process.exit(failures ? 1 : 0);
