-- =========================================================================
-- 0029_player_statistics_event_link.sql
-- =========================================================================
alter table public.player_statistics add column source_event_id uuid references public.match_events(id) on delete cascade;

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
