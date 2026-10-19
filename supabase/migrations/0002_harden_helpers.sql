-- Clears the Supabase security advisor warnings on the RLS helper functions.
-- current_curator_id() runs as the caller (a person can always read their own
-- curator row, so it still returns the right id), and both helpers get a fixed
-- empty search_path with fully qualified names.

create or replace function public.current_curator_id() returns uuid
language sql stable security invoker set search_path = '' as $$
  select id from public.curators where user_id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;
