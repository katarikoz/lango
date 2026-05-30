-- LanGo — progress sync schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- It's safe to run again later; it won't wipe existing data.

-- One row per profile. The whole progress object lives in `data` (jsonb):
-- wordStatus, learnedPowerWords, streak, subjects, etc.
create table if not exists public.progress (
  profile     text primary key,            -- 'max' (Cat) | 'alex' (Fox)
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- Lock the table down: nobody touches it unless logged in.
alter table public.progress enable row level security;

-- Logged-in (invited) family members can read and write both profiles.
-- Outsiders (the anonymous/publishable key on its own) get nothing.
drop policy if exists "family read"   on public.progress;
drop policy if exists "family insert" on public.progress;
drop policy if exists "family update" on public.progress;

create policy "family read"   on public.progress
  for select to authenticated using (true);
create policy "family insert" on public.progress
  for insert to authenticated with check (true);
create policy "family update" on public.progress
  for update to authenticated using (true) with check (true);

-- Keep updated_at fresh on every write.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists progress_touch on public.progress;
create trigger progress_touch
  before update on public.progress
  for each row execute function public.touch_updated_at();

-- Seed the two profiles (no-op if they already exist).
insert into public.progress (profile, data) values
  ('max',  '{}'::jsonb),
  ('alex', '{}'::jsonb)
on conflict (profile) do nothing;
