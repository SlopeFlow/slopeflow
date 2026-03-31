-- SlopeFlow Database Schema
-- Run this in Supabase → SQL Editor → New Query

-- ─── PROFILES ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid references auth.users on delete cascade primary key,
  name          text,
  age           int,
  experience    text check (experience in ('fresh','learning','riding')),
  interests     text[],  -- array: ['btc','stocks','futures','all']
  streak        int default 0,
  xp            int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ─── WATCHLIST ────────────────────────────────────────────────────────────────
create table if not exists watchlist (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid references profiles(id) on delete cascade,
  ticker     text not null,
  asset_type text check (asset_type in ('crypto','stock')) default 'stock',
  added_at   timestamptz default now(),
  unique(user_id, ticker)
);

-- ─── TRADE JOURNAL ───────────────────────────────────────────────────────────
create table if not exists journal_entries (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references profiles(id) on delete cascade,
  ticker      text,
  entry_price numeric,
  exit_price  numeric,
  direction   text check (direction in ('long','short')),
  outcome     text check (outcome in ('win','loss','open')),
  notes       text,
  created_at  timestamptz default now()
);

-- ─── CHALLENGE RESULTS ───────────────────────────────────────────────────────
create table if not exists challenge_results (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid references profiles(id) on delete cascade,
  challenge_id int,
  correct      boolean,
  answered_at  timestamptz default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
alter table profiles          enable row level security;
alter table watchlist         enable row level security;
alter table journal_entries   enable row level security;
alter table challenge_results enable row level security;

-- Users can only read/write their own data
create policy "Own profile" on profiles
  for all using (auth.uid() = id);

create policy "Own watchlist" on watchlist
  for all using (auth.uid() = user_id);

create policy "Own journal" on journal_entries
  for all using (auth.uid() = user_id);

create policy "Own challenges" on challenge_results
  for all using (auth.uid() = user_id);
