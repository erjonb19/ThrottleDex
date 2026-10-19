-- Trusted list: initial schema
-- Run in the Supabase SQL editor, or `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type tier as enum ('commuter', 'enthusiast', 'luxury', 'collector', 'working');
create type vendor_status as enum ('active', 'paused', 'closed');
create type confirm_answer as enum ('still_good', 'dropped', 'no_reply');
create type followup_outcome as enum ('used_good', 'used_bad', 'did_not_use', 'no_reply');

-- ---------- reference ----------
create table categories (
  slug text primary key,
  group_name text not null,
  name text not null,
  purpose text not null,
  position int not null
);

create table metros (
  slug text primary key,
  name text not null,
  areas text[] not null default '{}'
);

-- ---------- core ----------
create table curators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  handle text not null,
  metro text not null references metros(slug),
  display_name text not null,
  bio text not null default '',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (metro, handle),
  constraint handle_shape check (handle ~ '^[a-z0-9][a-z0-9-]{1,30}$')
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  metro text not null references metros(slug),
  category text not null references categories(slug),
  name text not null,
  area text not null default '',
  website text not null default '',
  instagram text not null default '',
  phone text not null default '',
  google_place_id text not null default '',
  tiers tier[] not null default '{enthusiast}',
  status vendor_status not null default 'active',
  created_by uuid references curators(id),
  created_at timestamptz not null default now()
);
create index vendors_metro_category on vendors (metro, category);

create table listings (
  id uuid primary key default gen_random_uuid(),
  curator_id uuid not null references curators(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  note text not null default '',
  confirmed_at date not null default current_date,
  position int not null default 0,
  created_at timestamptz not null default now(),
  unique (curator_id, vendor_id)
);
create index listings_curator on listings (curator_id);

-- One row per click through /go/{listing_id}. No personal data.
create table referrals (
  id bigint generated always as identity primary key,
  listing_id uuid not null references listings(id) on delete cascade,
  clicked_at timestamptz not null default now(),
  visitor_hash text not null default ''
);
create index referrals_listing on referrals (listing_id, clicked_at desc);

-- The six-month "still your pick?" prompt log (phase 3 writes here).
create table confirmations (
  id bigint generated always as identity primary key,
  listing_id uuid not null references listings(id) on delete cascade,
  asked_at timestamptz not null default now(),
  answered_at timestamptz,
  answer confirm_answer
);

-- The 30-day "did you use them?" follow-up (phase 3).
create table followups (
  id bigint generated always as identity primary key,
  referral_id bigint not null references referrals(id) on delete cascade,
  asked_at timestamptz not null default now(),
  answered_at timestamptz,
  outcome followup_outcome
);

-- ---------- helpers ----------
create or replace function current_curator_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from curators where user_id = auth.uid()
$$;

create or replace function is_admin() returns boolean
language sql stable as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

-- Click counts per listing, readable by anyone (no per-click rows exposed).
create or replace view listing_click_counts as
  select listing_id, count(*)::int as clicks, max(clicked_at) as last_click
  from referrals group by listing_id;

-- ---------- row level security ----------
alter table categories enable row level security;
alter table metros enable row level security;
alter table curators enable row level security;
alter table vendors enable row level security;
alter table listings enable row level security;
alter table referrals enable row level security;
alter table confirmations enable row level security;
alter table followups enable row level security;

-- Reference tables: everyone reads, nobody writes through the API.
create policy "categories read" on categories for select using (true);
create policy "metros read" on metros for select using (true);

-- Curators: approved profiles are public; a person sees and edits their own.
create policy "curators public read" on curators for select
  using (approved_at is not null or user_id = auth.uid() or is_admin());
create policy "curators self insert" on curators for insert
  with check (user_id = auth.uid() and approved_at is null);
create policy "curators self update" on curators for update
  using (user_id = auth.uid() or is_admin())
  with check (
    is_admin()
    or (user_id = auth.uid() and approved_at is not distinct from (select approved_at from curators c where c.id = curators.id))
  );

-- Vendors: everyone reads; any approved curator may add one; only admins change status.
create policy "vendors read" on vendors for select using (true);
create policy "vendors curator insert" on vendors for insert
  with check (created_by = current_curator_id()
              and exists (select 1 from curators where id = current_curator_id() and approved_at is not null));
create policy "vendors creator update" on vendors for update
  using (created_by = current_curator_id() or is_admin())
  with check (is_admin() or status = (select status from vendors v where v.id = vendors.id));

-- Listings: public when the curator is approved; a curator writes only their own.
create policy "listings public read" on listings for select
  using (exists (select 1 from curators c where c.id = listings.curator_id
                 and (c.approved_at is not null or c.user_id = auth.uid())) or is_admin());
create policy "listings own write" on listings for all
  using (curator_id = current_curator_id())
  with check (curator_id = current_curator_id());

-- Referrals: insert-only from the redirect route (anon or signed in); only the listing's curator reads rows.
create policy "referrals insert" on referrals for insert with check (true);
create policy "referrals own read" on referrals for select
  using (exists (select 1 from listings l where l.id = referrals.listing_id and l.curator_id = current_curator_id()) or is_admin());

-- Confirmations and follow-ups: the curator reads their own; jobs write with the service role.
create policy "confirmations own read" on confirmations for select
  using (exists (select 1 from listings l where l.id = confirmations.listing_id and l.curator_id = current_curator_id()) or is_admin());
create policy "followups own read" on followups for select
  using (exists (select 1 from referrals r join listings l on l.id = r.listing_id
                 where r.id = followups.referral_id and l.curator_id = current_curator_id()) or is_admin());
