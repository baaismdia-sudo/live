-- =========================================================================
-- 0023_player_medical_notes_privacy_fix.sql
-- players.medical_notes (added in 0022) would be exposed by the existing
-- players_public_read policy, since RLS is row-level, not column-level —
-- there's no way to make one column private on an otherwise-public row.
-- Splitting medical data into its own staff-only table is the correct fix.
-- =========================================================================

alter table public.players drop column medical_notes;

create table public.player_medical_notes (
  player_id  uuid primary key references public.players(id) on delete cascade,
  notes      text not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

alter table public.player_medical_notes enable row level security;

create policy player_medical_notes_staff_only on public.player_medical_notes
  for all using (
    exists (
      select 1 from public.players pl
      join public.teams t on t.id = pl.team_id
      where pl.id = player_id and public.is_tournament_staff(t.tournament_id)
    )
  )
  with check (
    exists (
      select 1 from public.players pl
      join public.teams t on t.id = pl.team_id
      where pl.id = player_id and public.is_tournament_staff(t.tournament_id)
    )
  );

create policy player_medical_notes_super_admin_all on public.player_medical_notes
  for all using (public.is_super_admin()) with check (public.is_super_admin());
