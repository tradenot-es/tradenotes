-- Behavioural tagging per trade: mistakes (e.g. revenge trade, moved stop) and
-- the emotional state, both as keys defined in src/lib/behavior.ts.
alter table trades
  add column mistakes text[] not null default '{}',
  add column emotions text[] not null default '{}';
