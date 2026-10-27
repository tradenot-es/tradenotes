-- Self-imposed break after a losing streak (see cooldownStatus in src/lib/behavior.ts).
alter table user_settings
  add column cooldown_rule jsonb not null default '{"enabled": false, "after_losses": 2, "minutes": 30}';
