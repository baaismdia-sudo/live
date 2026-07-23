-- =========================================================================
-- 0025_teams_players_venues_officials_extensions.sql
-- Prompt 7: extended Team/Player fields, Venues, Officials, match official
-- assignments, extended Match scheduling fields, season tracking, custom
-- point systems.
-- =========================================================================

alter table public.tournaments add column season text;
alter table public.tournaments add column parent_season_id uuid references public.tournaments(id) on delete set null;
create index idx_tournaments_season on public.tournaments(season);

alter table public.tournament_settings add column points_win int not null default 3;
alter table public.tournament_settings add column points_draw int not null default 1;
alter table public.tournament_settings add column points_loss int not null default 0;

alter table public.teams add column short_name text;
alter table public.teams add column banner_url text;
alter table public.teams add column captain_player_id uuid;
alter table public.teams add column vice_captain_player_id uuid;
alter table public.teams add column coach_name text;
alter table public.teams add column primary_color text;
alter table public.teams add column secondary_color text;
alter table public.teams add column description text;
alter table public.teams add column home_ground text;
alter table public.teams add column founded_year int;
alter table public.teams add column website_url text;
alter table public.teams add column social_links jsonb not null default '{}';

alter table public.players add column nickname text;
alter table public.players add column city text;
alter table public.players add column role text;
alter table public.players add column height_cm numeric;
alter table public.players add column weight_kg numeric;
alter table public.players add column email citext;
alter table public.players add column phone text;
alter table public.players add column is_vice_captain boolean not null default false;
alter table public.players add column emergency_contact_name text;
alter table public.players add column emergency_contact_phone text;

alter table public.teams
  add constraint fk_teams_captain foreign key (captain_player_id) references public.players(id) on delete set null,
  add constraint fk_teams_vice_captain foreign key (vice_captain_player_id) references public.players(id) on delete set null;

create table public.venues (
  id              uuid primary key default gen_random_uuid(),
  organizer_id    uuid not null references public.profiles(id) on delete cascade,
  name            text not null,
  country         text,
  state           text,
  city            text,
  address         text,
  google_maps_url text,
  capacity        int,
  surface         text,
  parking         boolean not null default false,
  facilities      text[] not null default '{}',
  officials_room  boolean not null default false,
  media_room      boolean not null default false,
  photos          text[] not null default '{}',
  qr_code_url     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_venues_organizer_id on public.venues(organizer_id);

create trigger trg_venues_updated_at
  before update on public.venues
  for each row execute function public.set_updated_at();

alter table public.venues enable row level security;

create policy venues_owner_all on public.venues
  for all using (organizer_id = public.effective_organizer_id())
  with check (organizer_id = public.effective_organizer_id());
create policy venues_public_read on public.venues
  for select using (true);
create policy venues_super_admin_all on public.venues
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create table public.officials (
  id              uuid primary key default gen_random_uuid(),
  organizer_id    uuid not null references public.profiles(id) on delete cascade,
  full_name       text not null,
  photo_url       text,
  email           citext,
  phone           text,
  role            text not null check (role in ('referee','commentator','manager','scorekeeper','volunteer')),
  certification   text,
  experience_years int,
  availability_notes text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_officials_organizer_id on public.officials(organizer_id);

create trigger trg_officials_updated_at
  before update on public.officials
  for each row execute function public.set_updated_at();

alter table public.officials enable row level security;

create policy officials_owner_all on public.officials
  for all using (organizer_id = public.effective_organizer_id())
  with check (organizer_id = public.effective_organizer_id());
create policy officials_super_admin_all on public.officials
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create table public.match_official_assignments (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid not null references public.matches(id) on delete cascade,
  official_id   uuid not null references public.officials(id) on delete cascade,
  role_in_match text not null check (role_in_match in ('referee','assistant_referee','third_official','commissioner','scorekeeper','commentator')),
  created_at    timestamptz not null default now(),
  unique (match_id, official_id, role_in_match)
);

create index idx_match_official_assignments_match on public.match_official_assignments(match_id);

alter table public.match_official_assignments enable row level security;

create policy match_official_assignments_public_read on public.match_official_assignments
  for select using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_publicly_visible_tournament(m.tournament_id))
  );
create policy match_official_assignments_staff_write on public.match_official_assignments
  for all using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  )
  with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  );
create policy match_official_assignments_super_admin_all on public.match_official_assignments
  for all using (public.is_super_admin()) with check (public.is_super_admin());

alter table public.matches add column round text;
alter table public.matches add column group_id uuid references public.groups(id) on delete set null;
alter table public.matches add column weather text;
alter table public.matches add column attendance int;
alter table public.matches add column ticket_link text;
alter table public.matches add column venue_id uuid references public.venues(id) on delete set null;

create index idx_matches_venue_id on public.matches(venue_id);
create index idx_matches_group_id on public.matches(group_id);
