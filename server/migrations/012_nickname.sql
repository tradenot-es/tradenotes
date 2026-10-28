-- First and last name are replaced by an optional nickname: the app only uses a name to greet
-- the user and to show who shares a trade, a real name is not needed (data minimisation).
-- Not launched yet, so existing first names simply become nicknames.
alter table profiles add column nickname text check (nickname is null or char_length(trim(nickname)) between 1 and 40);
update profiles set nickname = left(nullif(trim(first_name), 'Trader'), 40);
alter table profiles drop column first_name, drop column last_name;
update "user" u set name = coalesce(p.nickname, '') from profiles p where p.id = u.id;
alter table "user" drop column if exists "firstName", drop column if exists "lastName";
