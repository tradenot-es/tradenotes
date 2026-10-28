-- Admin dashboard and mail to all users (src/admin.ts, src/campaigns.ts).

-- last activity, for "active users in the last 7/30 days" (set at most once an hour per user)
alter table user_settings add column last_active_at timestamptz;

-- newsletter only with consent: off by default, the moment of consent is kept as proof
alter table user_settings add column newsletter boolean not null default false;
alter table user_settings add column newsletter_consent_at timestamptz;

-- one mail to many: a service notice (all confirmed users) or a newsletter (subscribers only)
create table mail_campaigns (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('service', 'newsletter')),
  subject text not null check (char_length(subject) between 1 and 200),
  body text not null check (char_length(body) between 1 and 20000),
  created_by text not null,
  created_at timestamptz not null default now()
);

-- one row per recipient; the worker sends pending rows in small batches within the daily limit
create table mail_queue (
  id bigserial primary key,
  campaign_id uuid not null references mail_campaigns (id) on delete cascade,
  user_id uuid not null references "user" (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'skipped')),
  error text,
  sent_at timestamptz,
  unique (campaign_id, user_id)
);
create index mail_queue_pending_idx on mail_queue (id) where status = 'pending';
create index mail_queue_sent_idx on mail_queue (sent_at) where status = 'sent';
