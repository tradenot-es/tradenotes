// Announced, market-relevant appearances from two public calendars, fetched hourly:
// - federalreserve.gov/json/calendar.json: speeches and testimony of Fed officials, FOMC minutes
// - Roll Call Factba.se: the US President's public schedule (usually published the day before)
// Unannounced statements (social media, press gaggles) are not in either source.
import { createHash } from "node:crypto";
import { pool } from "./db.js";

const FED_URL = "https://www.federalreserve.gov/json/calendar.json";
const TRUMP_URL = "https://media-cdn.factba.se/rss/json/trump/calendar-full.json";
const USER_AGENT = "tradenot.es calendar (+https://tradenot.es)";

export interface MarketEvent {
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

const id = (...parts: (string | null | undefined)[]) =>
  createHash("sha1").update(parts.join("|")).digest("hex").slice(0, 20);

/** "10:00 a.m." / "2:30 p.m." → "10:00" / "14:30" */
export function to24h(time: string | undefined): string | null {
  const m = time?.trim().match(/^(\d{1,2}):(\d{2})\s*([ap])\.?m\.?$/i);
  if (!m) return null;
  let hour = Number(m[1]) % 12;
  if (m[3].toLowerCase() === "p") hour += 12;
  return `${String(hour).padStart(2, "0")}:${m[2]}`;
}

interface FedEntry {
  title?: string;
  description?: string;
  time?: string;
  month?: string; // "2026-10"
  days?: string; // "15", "14,15" or "14-15"
  type?: string;
  link?: string;
  live?: string;
}

export function parseFed(entries: FedEntry[]): MarketEvent[] {
  const events: MarketEvent[] = [];
  for (const e of entries) {
    if (!e.title || !e.month || !e.days) continue;
    const speech = e.type === "Speeches" || e.type === "Testimony";
    const minutes = e.type === "FOMC" && /minutes/i.test(e.title);
    if (!speech && !minutes) continue;
    const day = e.days.match(/\d+/)?.[0];
    if (!day) continue;
    const date = `${e.month}-${day.padStart(2, "0")}`;
    const time = to24h(e.time);
    events.push({
      id: id("fed", date, e.time, e.title),
      source: "fed",
      date,
      time,
      category: minutes ? "fomc" : "fed_speech",
      title: minutes ? e.title : `Fed: ${e.title}`,
      description: e.description?.trim() || null,
      // the Chair moves markets, the other members less so
      impact: minutes || /(?<!Vice )\bChair(man)?\b(?! for)/.test(e.title) ? "high" : "medium",
      url: e.link || e.live || null,
    });
  }
  return events;
}

interface ScheduleEntry {
  date?: string;
  time?: string | null; // "15:00:00"
  type?: string;
  details?: string;
  location?: string | null;
  url?: string | null;
}

// public appearances that can move markets; logistics, internal meetings and dinners stay out
const RELEVANT =
  /deliver(s)? (closing )?remarks|makes an announcement|announcement|signs? (an )?executive order|press conference|news conference|interview|bilateral meeting|multilateral meeting|trilateral|tele-rally|\brally\b|address to|summit/i;

const SCHEDULES = new Set(["President Schedule", "Pool Report Schedule"]);

export function parseSchedule(entries: ScheduleEntry[]): MarketEvent[] {
  const events: MarketEvent[] = [];
  const seen = new Set<string>();
  for (const e of entries) {
    // rallies and trips often only appear in the press pool's version of the schedule
    if (!SCHEDULES.has(e.type ?? "") || !e.date || !e.details) continue;
    const details = e.details.trim();
    if (!/^(TBD: )?The President\b/.test(details) || /^CANCELLED/i.test(details) || !RELEVANT.test(details)) continue;
    const time = e.time ? e.time.slice(0, 5) : null;
    const key = `${e.date}|${time}|${details.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      id: id("whitehouse", key),
      source: "whitehouse",
      date: e.date,
      time,
      category: "trump",
      title: `Trump: ${details.replace(/^(TBD: )?The President /, "")}`,
      description: e.location?.trim() || null,
      impact: "political",
      url: e.url || null,
    });
  }
  return events;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  // the Fed file starts with a byte order mark
  return JSON.parse((await res.text()).replace(/^﻿/, ""));
}

/** Replaces the stored events of one source with a fresh copy of its calendar. */
async function store(source: MarketEvent["source"], events: MarketEvent[]) {
  if (events.length === 0) return; // an empty feed is more likely an outage than an empty calendar
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("delete from market_events where source = $1", [source]);
    for (const e of events) {
      await client.query(
        `insert into market_events (id, source, date, time, category, title, description, impact, url)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9) on conflict (id) do nothing`,
        [e.id, e.source, e.date, e.time, e.category, e.title, e.description, e.impact, e.url],
      );
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function syncMarketEvents() {
  const results = await Promise.allSettled([
    fetchJson(FED_URL).then((data) => store("fed", parseFed(data.events ?? []))),
    fetchJson(TRUMP_URL).then((data) => store("whitehouse", parseSchedule(Array.isArray(data) ? data : []))),
  ]);
  for (const r of results) if (r.status === "rejected") console.error("market events sync failed:", r.reason);
}

export async function marketEventsBetween(from: string, to: string): Promise<MarketEvent[]> {
  const { rows } = await pool.query(
    `select id, source, to_char(date, 'YYYY-MM-DD') as date, time, category, title, description, impact, url
     from market_events where date between $1 and $2 order by date, time nulls first`,
    [from, to],
  );
  return rows;
}
