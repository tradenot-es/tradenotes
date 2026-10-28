-- Announced appearances fetched from public calendars (src/marketEvents.ts): Fed speeches,
-- testimony and FOMC minutes from federalreserve.gov, the US President's public schedule from
-- Roll Call Factba.se. Shown in the calendar next to the fixed dates in src/lib/economicCalendar.ts.
create table market_events (
  id text primary key,
  source text not null,
  date date not null,
  time text, -- HH:MM, US Eastern
  category text not null,
  title text not null,
  description text,
  impact text not null default 'medium',
  url text,
  updated_at timestamptz not null default now()
);
create index market_events_date_idx on market_events (date);
