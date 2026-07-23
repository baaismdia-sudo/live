-- =========================================================================
-- 0028_match_events_value_and_stats_engine.sql
-- =========================================================================
alter table public.match_events add column value numeric not null default 1;

create table public.event_stat_mappings (
  event_type text primary key,
  stat_key   text not null,
  multiplier numeric not null default 1
);

alter table public.event_stat_mappings add column use_event_value boolean not null default false;

insert into public.event_stat_mappings (event_type, stat_key, use_event_value, multiplier) values
  ('goal', 'goals', false, 1),
  ('penalty_goal', 'goals', false, 1),
  ('assist', 'assists', false, 1),
  ('yellow_card', 'yellow_cards', false, 1),
  ('red_card', 'red_cards', false, 1),
  ('second_yellow', 'yellow_cards', false, 1),
  ('save', 'saves', false, 1),
  ('shot', 'shots', false, 1),
  ('shot_on_target', 'shots_on_target', false, 1),
  ('tackle', 'tackles', false, 1),
  ('interception', 'interceptions', false, 1),
  ('runs', 'runs', true, 1),
  ('wicket', 'wickets_taken', false, 1),
  ('four', 'fours', false, 1),
  ('six', 'sixes', false, 1),
  ('catch', 'catches', false, 1),
  ('run_out', 'run_outs', false, 1),
  ('stumping', 'stumpings', false, 1);

create or replace function public.apply_event_statistics()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mapping record;
  delta numeric;
begin
  if new.player_id is null then
    return new;
  end if;

  select * into mapping from event_stat_mappings where event_type = new.event_type;
  if not found then
    return new;
  end if;

  delta := case when mapping.use_event_value then new.value * mapping.multiplier else mapping.multiplier end;

  insert into player_statistics (player_id, match_id, stat_key, stat_value, source_event_id)
  values (new.player_id, new.match_id, mapping.stat_key, delta, new.id);

  return new;
end;
$$;

create trigger trg_apply_event_statistics
  after insert on public.match_events
  for each row execute function public.apply_event_statistics();

create or replace function public.undo_match_event(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  ev record;
begin
  select * into ev from match_events where id = p_event_id;
  if not found then
    raise exception 'Event not found';
  end if;
  if not exists (select 1 from matches m where m.id = ev.match_id and public.is_tournament_scorekeeper(m.tournament_id)) then
    raise exception 'Only an assigned scorekeeper may undo this event';
  end if;

  update match_events set undone = true, undone_at = now(), undone_by = auth.uid() where id = p_event_id;
end;
$$;
