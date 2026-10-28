-- The time zone setting now defaults to "automatic" (null = the zone of the viewer's device).
-- Before, every account got America/New_York without choosing it; nobody has picked a zone yet
-- (not launched), so those defaults become automatic as well.
alter table user_settings alter column timezone drop default;
update user_settings set timezone = null where timezone = 'America/New_York';
