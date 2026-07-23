-- =========================================================================
-- 0006_matches_scoring.sql
-- Fixtures, matches, match events, live scores, commentary, standings
-- =========================================================================

create table public.fixtures (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  group_id      uuid references public.groups(id) on delete set null,
  round_name    text not null,              -- "Round 1", "Quarter Final"...
  scheduled_at  timestamptz,
  venue         text,
  created_at    timestamptz not null default now()
);

create index idx_fixtures_tournament_id on public.fixtures(tournament_id);

create table public.matches (
  id              uuid primary key default gen_random_uuid(),
  tournament_id   uuid not null references public.tournaments(id) on delete cascade,
  fixture_id      uuid references public.fixtures(id) on delete set null,
  home_team_id    uuid references public.teams(id) on delete set null,
  away_team_id    uuid references public.teams(id) on delete set null,
  winner_team_id  uuid references public.teams(id) on delete set null,
  status          match_status not null default 'scheduled',
  venue           text,
  scheduled_at    timestamptz,
  started_at      timestamptz,
  ended_at        timestamptz,
  home_score      int not null default 0,
  away_score      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (home_team_id is null or away_team_id is null or home_team_id <> away_team_id)
);

create index idx_matches_tournament_id on public.matches(tournament_id);
create index idx_matches_status        on public.matches(status);
create index idx_matches_home_team     on public.matches(home_team_id);
create index idx_matches_away_team     on public.matches(away_team_id);

create trigger trg_matches_updated_at
  before update on public.matches
  for each row execute function public.set_updated_at();

alter table public.player_statistics
  add constraint fk_player_statistics_match
  foreign key (match_id) references public.matches(id) on delete cascade;

create index idx_player_statistics_match_id on public.player_statistics(match_id);

create table public.match_events (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references public.matches(id) on delete cascade,
  team_id     uuid references public.teams(id) on delete set null,
  player_id   uuid references public.players(id) on delete set null,
  event_type  text not null,                -- goal, card, substitution, point, foul, timeout...
  minute      int,
  description text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

create index idx_match_events_match_id on public.match_events(match_id);

create table public.live_scores (
  id              uuid primary key default gen_random_uuid(),
  match_id        uuid not null unique references public.matches(id) on delete cascade,
  home_score      int not null default 0,
  away_score      int not null default 0,
  period          text,                       -- "2nd Half", "Set 2"...
  time_elapsed    text,
  is_live         boolean not null default false,
  last_updated_by uuid references public.profiles(id),
  updated_at      timestamptz not null default now()
);

create trigger trg_live_scores_updated_at
  before update on public.live_scores
  for each row execute function public.set_updated_at();

create table public.commentary (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches(id) on delete cascade,
  author_id  uuid references public.profiles(id),
  message    text not null,
  minute     int,
  created_at timestamptz not null default now()
);

create index idx_commentary_match_id on public.commentary(match_id);

create table public.standings (
  id               uuid primary key default gen_random_uuid(),
  tournament_id    uuid not null references public.tournaments(id) on delete cascade,
  group_id         uuid references public.groups(id) on delete set null,
  team_id          uuid not null references public.teams(id) on delete cascade,
  played           int not null default 0,
  won              int not null default 0,
  drawn            int not null default 0,
  lost             int not null default 0,
  points           int not null default 0,
  goals_for        int not null default 0,
  goals_against    int not null default 0,
  goal_difference  int generated always as (goals_for - goals_against) stored,
  rank             int,
  updated_at       timestamptz not null default now(),
  unique (tournament_id, team_id)
);

create index idx_standings_tournament_id on public.standings(tournament_id);

create trigger trg_standings_updated_at
  before update on public.standings
  for each row execute function public.set_updated_at();
