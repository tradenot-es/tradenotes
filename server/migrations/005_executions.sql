-- Broker executions (fills) from the NinjaTrader add-on and other sources. They are
-- matched into round-trip trades by src/matching.ts; open ones form the current
-- position. Replaces ninjatrader_executions, which paired one entry with one exit.
create table executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  source text not null,
  -- the broker's execution id; the remainder of a reversing fill gets a "#r" suffix
  external_id text not null,
  account text not null,
  instrument text not null,
  symbol text not null,
  market text not null,
  side text not null check (side in ('buy', 'sell')),
  qty numeric not null check (qty > 0),
  price numeric not null check (price > 0),
  commission numeric not null default 0,
  point_value numeric,
  time timestamptz not null,
  high numeric,
  low numeric,
  -- true once the execution belongs to a finished trade (stays true if that trade is deleted)
  matched boolean not null default false,
  trade_id uuid references trades (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, source, external_id)
);
create index executions_open_idx on executions (user_id, account, symbol, time) where not matched;

drop table ninjatrader_executions;
