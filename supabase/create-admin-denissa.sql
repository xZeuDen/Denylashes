insert into public.admin_users (email)
values ('denissa7@yahoo.es')
on conflict (email) do nothing;
