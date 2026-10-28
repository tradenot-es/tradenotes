// Parsing of the two public calendars behind the market events (db.ts needs env values, but no
// connection is made):
//   DATABASE_URL=postgres://x@localhost/x BASE_URL=http://x BETTER_AUTH_SECRET=<32 chars> npx tsx test/marketEvents.ts
import { parseFed, parseSchedule, to24h } from "../src/marketEvents.js";

let failures = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok || detail === undefined ? "" : ` → ${JSON.stringify(detail)}`}`);
  if (!ok) failures++;
}

check("12h → 24h", to24h("10:00 a.m.") === "10:00" && to24h("2:30 p.m.") === "14:30" && to24h("12:15 p.m.") === "12:15" && to24h("12:05 a.m.") === "00:05");
check("unknown time", to24h("TBA") === null && to24h(undefined) === null);

const fed = parseFed([
  { title: "Speech - Governor Christopher J. Waller", description: "Economic Outlook", time: "10:00 a.m.", month: "2026-11", days: "5", type: "Speeches", live: "https://example.org/live" },
  { title: "Discussion - Chairman Kevin Warsh", time: "11:30 p.m.", month: "2026-10", days: "15", type: "Speeches" },
  { title: "Speech - Vice Chair Philip N. Jefferson", time: "1:30 p.m.", month: "2026-10", days: "1", type: "Speeches" },
  { title: "Speech - Vice Chair for Supervision Michelle W. Bowman", time: "3:00 p.m.", month: "2026-10", days: "1", type: "Speeches" },
  { title: "Semiannual Monetary Policy Report - Chairman Kevin Warsh", time: "10:00 a.m.", month: "2027-02", days: "10,11", type: "Testimony" },
  { title: "FOMC Minutes", time: "2:00 p.m.", month: "2026-11", days: "18", type: "FOMC" },
  { title: "FOMC Meeting", time: "2:00 p.m.", month: "2026-12", days: "9", type: "FOMC" },
  { title: "Industrial Production", time: "9:15 a.m.", month: "2026-11", days: "17", type: "Stat" },
]);
check("fed: speeches, testimony and minutes only", fed.length === 6, fed.map((e) => e.title));
check("fed: governor speech", fed[0].date === "2026-11-05" && fed[0].time === "10:00" && fed[0].category === "fed_speech" && fed[0].impact === "medium" && fed[0].url === "https://example.org/live", fed[0]);
check("fed: chair is high impact", fed[1].impact === "high" && fed[4].impact === "high");
check("fed: vice chairs are medium", fed[2].impact === "medium" && fed[3].impact === "medium");
check("fed: multi-day uses first day", fed[4].date === "2027-02-10");
check("fed: minutes", fed[5].category === "fomc" && fed[5].title === "FOMC Minutes");

const schedule = parseSchedule([
  { date: "2026-10-27", time: "15:00:00", type: "President Schedule", details: "The President holds a political rally in Corpus Christi, Texas [2:00 PM Local]", location: "Port of Corpus Christi, Texas" },
  { date: "2026-10-27", time: "11:10:00", type: "President Schedule", details: "The President departs The White House en route to Joint Base Andrews" },
  { date: "2026-10-28", time: "12:30:00", type: "President Schedule", details: "The President participates in a Policy Meeting" },
  { date: "2026-10-18", time: "14:00:00", type: "President Schedule", details: "The President delivers Remarks" },
  { date: "2026-10-18", time: "14:00:00", type: "Pool Report Schedule", details: "The President delivers remarks" },
  { date: "2026-10-27", time: "19:00:00", type: "Pool Report Schedule", details: "The President holds a political rally in Lubbock, Texas [6:00 PM Local]" },
  { date: "2026-10-27", time: null, type: "Briefing Schedule", details: "The President delivers Remarks" },
  { date: "2026-09-29", time: "17:00:00", type: "President Schedule", details: "The President signs Executive Orders" },
  { date: "2026-09-22", time: "13:15:00", type: "President Schedule", details: "The President participates in a Bilateral Meeting with the President of Ukraine" },
  { date: "2026-09-15", time: "11:40:00", type: "President Schedule", details: "The First Lady delivers Remarks to Mountain View Elementary School" },
  { date: "2026-10-10", time: "20:00:00", type: "President Schedule", details: "CANCELLED: The President delivers Remarks at a football game" },
  { date: "2026-09-02", time: "16:00:00", type: "President Schedule", details: "The President participates in a Pre-Tape Interview [Note: Interview with GBNews (UK)]" },
  { date: "2026-10-07", time: "13:00:00", type: "President Schedule", details: "The President makes an Announcement" },
]);
const titles = schedule.map((e) => e.title);
check("trump: rally, remarks, EO, bilateral, interview, announcement (pool schedule included, duplicates once)", schedule.length === 7, titles);
check("trump: logistics and policy meetings left out", !titles.some((t) => /departs|Policy Meeting/.test(t)));
check("trump: first lady and cancelled left out", !titles.some((t) => /First Lady|football/.test(t)));
check("trump: fields", schedule[0].date === "2026-10-27" && schedule[0].time === "15:00" && schedule[0].category === "trump" && schedule[0].title.startsWith("Trump: holds a political rally") && schedule[0].description === "Port of Corpus Christi, Texas", schedule[0]);

console.log(failures ? `\n${failures} check(s) failed` : "\nall market event tests passed");
process.exit(failures ? 1 : 0);
