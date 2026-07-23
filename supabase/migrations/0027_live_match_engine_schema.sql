-- =========================================================================
-- 0027_live_match_engine_schema.sql
-- =========================================================================
alter table public.live_scores add column sport_state jsonb not null default '{}';
alter table public.live_scores add column clock_status text not null default 'stopped' check (clock_status in ('stopped','running','paused'));
alter table public.live_scores add column clock_started_at timestamptz;
alter table public.live_scores add column clock_elapsed_seconds int not null default 0;
alter table public.live_scores add column added_time_seconds int not null default 0;

create table public.match_lineups (
  id           uuid primary key default gen_random_uuid(),
  match_id     uuid not null references public.matches(id) on delete cascade,
  team_id      uuid not null references public.teams(id) on delete cascade,
  player_id    uuid not null references public.players(id) on delete cascade,
  is_starting  boolean not null default true,
  position     text,
  created_at   timestamptz not null default now(),
  unique (match_id, player_id)
);

create index idx_match_lineups_match on public.match_lineups(match_id);

alter table public.match_lineups enable row level security;

create policy match_lineups_public_read on public.match_lineups
  for select using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_publicly_visible_tournament(m.tournament_id))
  );
create policy match_lineups_staff_write on public.match_lineups
  for all using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  )
  with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  );
create policy match_lineups_super_admin_all on public.match_lineups
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter publication supabase_realtime add table public.match_lineups;
alter table public.match_lineups replica identity full;

alter table public.match_events add column undone boolean not null default false;
alter table public.match_events add column undone_at timestamptz;
alter table public.match_events add column undone_by uuid references public.profiles(id);
