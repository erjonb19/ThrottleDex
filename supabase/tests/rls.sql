-- Row-level security checks. Runs inside a transaction and rolls back, so it leaves no data.
-- Run in the Supabase SQL editor, or: psql "$DATABASE_URL" -f supabase/tests/rls.sql
-- Every row of the final result should say PASS.
begin;
create temp table rls_results (n serial, test text, expected text, got text);
grant all on rls_results to public;
grant usage on sequence rls_results_n_seq to public;
do $$
declare
  ua uuid := gen_random_uuid(); ub uuid := gen_random_uuid();
  ca uuid; cb uuid; v uuid; l uuid; k int; t text;
  claims_a text := json_build_object('sub', ua, 'role', 'authenticated')::text;
  claims_b text := json_build_object('sub', ub, 'role', 'authenticated')::text;
  claims_anon text := json_build_object('role', 'anon')::text;
begin
  insert into auth.users (id, email) values (ua, 'a@rls-test.local'), (ub, 'b@rls-test.local');
  perform set_config('request.jwt.claims', claims_anon, true); execute 'set local role anon';
  select count(*) into k from categories;
  insert into rls_results(test, expected, got) values ('anon reads categories', '27', k::text);
  begin insert into categories values ('x','x','x','x',1); t := 'inserted'; exception when others then t := 'blocked'; end;
  insert into rls_results(test, expected, got) values ('anon writes categories', 'blocked', t);
  execute 'reset role';
  perform set_config('request.jwt.claims', claims_a, true); execute 'set local role authenticated';
  insert into curators (user_id, handle, metro, display_name) values (ua, 'rls-alice', 'nyc', 'Alice') returning id into ca;
  insert into rls_results(test, expected, got) values ('A creates own profile', 'ok', 'ok');
  begin insert into curators (user_id, handle, metro, display_name, approved_at) values (ua, 'rls-alice2', 'nyc', 'A2', now()); t := 'inserted'; exception when others then t := 'blocked'; end;
  insert into rls_results(test, expected, got) values ('A self-approves on insert', 'blocked', t);
  begin insert into vendors (metro, category, name, website, created_by) values ('nyc','pdr','RLS Test Dent Co','https://example.com', ca) returning id into v; t := 'ok'; exception when others then t := 'blocked: ' || sqlerrm; end;
  insert into rls_results(test, expected, got) values ('unapproved A adds vendor', 'ok', t);
  insert into listings (curator_id, vendor_id, note) values (ca, v, 'test') returning id into l;
  insert into rls_results(test, expected, got) values ('A adds own listing', 'ok', 'ok');
  begin update curators set approved_at = now() where id = ca; get diagnostics k = row_count; t := k || ' row(s) updated'; exception when others then t := 'blocked'; end;
  insert into rls_results(test, expected, got) values ('A self-approves via update', 'blocked', t);
  execute 'reset role';
  perform set_config('request.jwt.claims', claims_anon, true); execute 'set local role anon';
  select count(*) into k from listings where id = l;
  insert into rls_results(test, expected, got) values ('anon sees unapproved listing', '0', k::text);
  execute 'reset role';
  update curators set approved_at = now() where id = ca;
  perform set_config('request.jwt.claims', claims_anon, true); execute 'set local role anon';
  select count(*) into k from listings where id = l;
  insert into rls_results(test, expected, got) values ('anon sees approved listing', '1', k::text);
  insert into referrals (listing_id, visitor_hash) values (l, 'test');
  insert into rls_results(test, expected, got) values ('anon records a click', 'ok', 'ok');
  select count(*) into k from listing_click_counts where listing_id = l;
  insert into rls_results(test, expected, got) values ('anon reads click counts', '0', k::text);
  execute 'reset role';
  perform set_config('request.jwt.claims', claims_a, true); execute 'set local role authenticated';
  select coalesce(max(clicks),0) into k from listing_click_counts where listing_id = l;
  insert into rls_results(test, expected, got) values ('A reads own click count', '1', k::text);
  execute 'reset role';
  perform set_config('request.jwt.claims', claims_b, true); execute 'set local role authenticated';
  insert into curators (user_id, handle, metro, display_name) values (ub, 'rls-bob', 'nyc', 'Bob') returning id into cb;
  select count(*) into k from listing_click_counts where listing_id = l;
  insert into rls_results(test, expected, got) values ('B reads A click count', '0', k::text);
  update listings set note = 'hacked' where id = l; get diagnostics k = row_count;
  insert into rls_results(test, expected, got) values ('B edits A listing', '0 row(s) updated', k || ' row(s) updated');
  begin insert into listings (curator_id, vendor_id) values (ca, v); t := 'inserted'; exception when others then t := 'blocked'; end;
  insert into rls_results(test, expected, got) values ('B adds listing to A list', 'blocked', t);
  begin insert into vendors (metro, category, name, created_by) values ('nyc','pdr','Spoof', ca); t := 'inserted'; exception when others then t := 'blocked'; end;
  insert into rls_results(test, expected, got) values ('B creates vendor as A', 'blocked', t);
  update vendors set status = 'closed' where id = v; get diagnostics k = row_count;
  insert into rls_results(test, expected, got) values ('B closes A vendor', '0 row(s) updated', k || ' row(s) updated');
  execute 'reset role';
end $$;
select n, test, expected, got, case when got = expected then 'PASS' else 'FAIL' end as result from rls_results order by n;
rollback;
