-- Broker connections that tradenot.es pulls from, currently Interactive Brokers
-- (Flex Web Service: a read-only report token and the id of the user's Flex Query).
create table broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  broker text not null check (broker in ('ibkr')),
  token text not null,
  query_id text not null,
  last_sync_at timestamptz,
  last_status text,
  last_error text,
  created_at timestamptz not null default now(),
  unique (user_id, broker)
);
