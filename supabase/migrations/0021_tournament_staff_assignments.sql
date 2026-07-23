-- =========================================================================
-- 0021_tournament_staff_assignments.sql
-- Per-tournament staff directory + organizer dashboard stats RPC.
-- NOTE: this table is record-keeping/UI only — the existing
-- is_tournament_staff() model (any staff member with organizer_id = this
-- tournament's organizer can access it) remains the actual RLS boundary.
-- Narrowing RLS to per-tournament assignment would touch ~15 existing
-- policies and is flagged as a follow-up rather than done as a side effect
-- of adding this table.
-- =========================================================================

create table public.tournament_staff_assignments (
  id             uuid primary key default gen_random_uuid(),
  tournament_id  uuid not null references public.tournaments(id) on delete cascade,
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  role_in_tournament text not null check (role_in_tournament in ('manager','scorekeeper','commentator')),
  assigned_by    uuid references public.profiles(id),
  created_at     timestamptz not null default now(),
  unique (tournament_id, profile_id, role_in_tournament)
);

create index idx_tournament_staff_assignments_tournament on public.tournament_staff_assignments(tournament_id);

alter table public.tournament_staff_assignments enable row level security;

create policy tournament_staff_assignments_staff_read on public.tournament_staff_assignments
  for select using (public.is_tournament_staff(tournament_id));
create policy tournament_staff_assignments_organizer_write on public.tournament_staff_assignments
  for all using (
    exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
  )
  with check (
    exists (select 1 from public.tournaments t where t.id = tournament_id and t.organizer_id = auth.uid())
  );
create policy tournament_staff_assignments_super_admin_all on public.tournament_staff_assignments
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create or replace function public.organizer_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
  org_id uuid;
begin
  org_id := public.effective_organizer_id();

  select jsonb_build_object(
    'active_tournaments', (select count(*) from tournaments where organizer_id = org_id and status = 'active' and deleted_at is null),
    'total_tournaments', (select count(*) from tournaments where organizer_id = org_id and deleted_at is null),
    'upcoming_matches', (select count(*) from matches m join tournaments t on t.id = m.tournament_id where t.organizer_id = org_id and m.status = 'scheduled'),
    'live_matches', (select count(*) from matches m join tournaments t on t.id = m.tournament_id where t.organizer_id = org_id and m.status = 'live'),
    'completed_matches', (select count(*) from matches m join tournaments t on t.id = m.tournament_id where t.organizer_id = org_id and m.status = 'completed'),
    'total_teams', (select count(*) from teams tm join tournaments t on t.id = tm.tournament_id where t.organizer_id = org_id and tm.deleted_at is null),
    'total_players', (select count(*) from players p join teams tm on tm.id = p.team_id join tournaments t on t.id = tm.tournament_id where t.organizer_id = org_id and p.deleted_at is null),
    'active_subscription_status', (select status from subscriptions where organizer_id = org_id order by created_at desc limit 1),
    'nearest_rental_expiry', (select min(rental_ends_at) from tournaments where organizer_id = org_id and status = 'active' and rental_ends_at is not null)
  ) into result;

  return result;
end;
$$;
