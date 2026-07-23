-- =========================================================================
-- 0005_teams_players.sql
-- Teams, players, player statistics, groups
-- =========================================================================

create table public.groups (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name          text not null,           -- "Group A"
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  unique (tournament_id, name)
);

create table public.teams (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  group_id      uuid references public.groups(id) on delete set null,
  name          text not null,
  slug          text not null,
  logo_url      text,
  manager_name  text,
  contact_email citext,
  contact_phone text,
  seed          int,
  status        team_status not null default 'pending',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  unique (tournament_id, slug)
);

create index idx_teams_tournament_id on public.teams(tournament_id);
create index idx_teams_group_id      on public.teams(group_id);
create index idx_teams_status        on public.teams(status);

create trigger trg_teams_updated_at
  before update on public.teams
  for each row execute function public.set_updated_at();

create table public.players (
  id              uuid primary key default gen_random_uuid(),
  team_id         uuid not null references public.teams(id) on delete cascade,
  full_name       text not null,
  jersey_number   int,
  position        text,
  photo_url       text,
  date_of_birth   date,
  nationality     text,
  is_captain      boolean not null default false,
  status          player_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  unique (team_id, jersey_number)
);

create index idx_players_team_id on public.players(team_id);

create trigger trg_players_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();

-- Per-match statistical lines for a player (aggregated views are built
-- on top of this in the reporting layer, not duplicated here).
create table public.player_statistics (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.players(id) on delete cascade,
  match_id    uuid,                       -- FK added in 0006 once matches exists
  stat_key    text not null,              -- goals, assists, points, cards, minutes_played...
  stat_value  numeric not null default 0,
  recorded_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index idx_player_statistics_player_id on public.player_statistics(player_id);
