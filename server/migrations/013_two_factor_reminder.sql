-- Two-factor login is recommended, not required: 'new' shows a dialog after the first login,
-- 'later' a hint on the dashboard, 'dismissed' nothing (src/components/TwoFactorReminder.tsx).
alter table user_settings add column two_factor_reminder text not null default 'new'
  check (two_factor_reminder in ('new', 'later', 'dismissed'));
