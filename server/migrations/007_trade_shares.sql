-- Mentor mode: a read-only link to one trade (src/pages/SharedTrade.tsx). The token
-- is the only key; deleting the share or the trade ends access.
create table trade_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  trade_id uuid not null unique references trades (id) on delete cascade,
  token text not null unique,
  show_note boolean not null default true,
  view_count integer not null default 0,
  last_viewed_at timestamptz,
  created_at timestamptz not null default now()
);
