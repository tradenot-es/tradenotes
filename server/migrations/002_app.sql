-- App tables. Access is scoped per user in src/data.ts; user ids reference Better Auth's
-- "user" table.
-- Dropped: assistant_conversations, daily_summaries, news_translations (AI features),
-- waitlist (pre-launch page), rate_limits, email_change_tracking (handled by Better Auth).

create extension if not exists pgcrypto;

create function update_updated_at_column() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table profiles (
  id uuid primary key references "user" (id) on delete cascade,
  first_name text not null default 'Trader' check (char_length(trim(first_name)) between 1 and 100),
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references "user" (id) on delete cascade,
  base_currency text default 'USD',
  timezone text default 'America/New_York',
  default_fees numeric default 2.00 check (default_fees >= 0),
  default_slippage numeric default 0.5 check (default_slippage >= 0 and default_slippage <= 100),
  setups text[] default array['Breakout', 'Failed Rally', 'Gap Fill', 'Trend Follow'],
  tags text[] default array['momentum', 'reversal', 'tech', 'index'],
  setup_definitions jsonb default '[]',
  daily_goal_amount numeric default 500.00,
  daily_goal_max_trades integer default 10,
  subscription_tier text default 'free',
  webhook_api_key text unique default encode(gen_random_bytes(24), 'hex'),
  notifications_enabled boolean default true,
  notification_sound boolean default false,
  drawdown_warning_threshold integer default 50,
  trading_goals jsonb default '{"daily_pnl": {"target": 500, "enabled": true, "operator": ">="}, "min_avg_r": {"target": 1.0, "enabled": false, "operator": ">="}, "max_trades": {"target": 10, "enabled": true, "operator": "<="}, "max_drawdown": {"target": 200, "enabled": false, "operator": "<="}, "min_win_rate": {"target": 50, "enabled": false, "operator": ">="}, "max_commissions": {"target": 50, "enabled": false, "operator": "<="}, "max_losing_streak": {"target": 3, "enabled": false, "operator": "<="}, "min_profit_factor": {"target": 1.5, "enabled": false, "operator": ">="}}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  symbol text not null,
  side text not null check (side in ('long', 'short')),
  qty numeric not null check (qty > 0),
  entry_price numeric not null check (entry_price > 0),
  exit_price numeric not null check (exit_price > 0),
  entry_time timestamptz not null,
  exit_time timestamptz not null,
  fees numeric default 0 check (fees >= 0),
  pnl_net numeric not null,
  r numeric,
  tags text[] default '{}',
  setup text,
  note text,
  screenshot_url text,
  market text default 'Stock' check (market in ('Stock', 'Futures', 'Crypto', 'Option', 'Forex', 'Index')),
  setup_checklist_completed boolean[] default '{}',
  initial_risk numeric,
  stop_loss_price numeric,
  rating integer check (rating between 1 and 5),
  news_context jsonb default '{}',
  account_type text default 'live' check (account_type in ('sim', 'evaluation', 'performance', 'live')),
  account_name text,
  mfe_price numeric,
  mae_price numeric,
  account_size_at_trade numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index trades_user_exit_idx on trades (user_id, exit_time);
create index trades_user_symbol_idx on trades (user_id, symbol);

create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  date date not null,
  content text not null,
  linked_trade_ids uuid[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index journal_entries_user_date_idx on journal_entries (user_id, date);

create table daily_prep (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  date date not null,
  market_outlook text,
  key_levels text,
  trading_plan text,
  mindset text,
  checklist jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

create table user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  achievement_type text not null,
  achieved_at timestamptz default now(),
  metadata jsonb default '{}',
  notified boolean default false,
  unique (user_id, achievement_type)
);

create table news_source_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  source_id text not null,
  source_name text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_id)
);

-- open NinjaTrader entries waiting for their exit (see src/routes/import.ts)
create table ninjatrader_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references "user" (id) on delete cascade,
  account text not null,
  instrument text not null,
  symbol text not null,
  market text not null,
  action text not null,
  quantity numeric not null,
  price numeric not null,
  timestamp timestamptz not null,
  execution_id text not null unique,
  order_id text,
  market_position text,
  account_type text default 'live',
  created_at timestamptz default now()
);
create index ninjatrader_executions_pairing_idx on ninjatrader_executions (user_id, symbol, account, action, timestamp);

-- shared caches for the optional Marketaux news integration
create table news_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  articles jsonb not null,
  symbols text[] not null,
  sentiment_data jsonb default '{}',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index news_cache_expires_idx on news_cache (expires_at);

create table sector_sentiments (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  sector text not null,
  avg_sentiment numeric,
  article_count integer,
  articles jsonb default '[]',
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  unique (date, sector)
);

create trigger profiles_updated_at before update on profiles for each row execute function update_updated_at_column();
create trigger user_settings_updated_at before update on user_settings for each row execute function update_updated_at_column();
create trigger trades_updated_at before update on trades for each row execute function update_updated_at_column();
create trigger journal_entries_updated_at before update on journal_entries for each row execute function update_updated_at_column();
create trigger daily_prep_updated_at before update on daily_prep for each row execute function update_updated_at_column();
create trigger news_source_preferences_updated_at before update on news_source_preferences for each row execute function update_updated_at_column();
