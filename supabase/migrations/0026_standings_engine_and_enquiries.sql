-- =========================================================================
-- 0026_standings_engine_and_enquiries.sql
-- Points Table auto-calculation engine + WhatsApp Rental Enquiry System.
-- =========================================================================

create or replace function public.recalculate_standings(p_tournament_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  pts_win int;
  pts_draw int;
  pts_loss int;
begin
  select points_win, points_draw, points_loss
    into pts_win, pts_draw, pts_loss
  from tournament_settings where tournament_id = p_tournament_id;

  pts_win := coalesce(pts_win, 3);
  pts_draw := coalesce(pts_draw, 1);
  pts_loss := coalesce(pts_loss, 0);

  with team_matches as (
    select home_team_id as team_id, group_id, home_score as gf, away_score as ga,
           case when home_score > away_score then 'W' when home_score < away_score then 'L' else 'D' end as result
    from matches where tournament_id = p_tournament_id and status = 'completed' and home_team_id is not null
    union all
    select away_team_id as team_id, group_id, away_score as gf, home_score as ga,
           case when away_score > home_score then 'W' when away_score < home_score then 'L' else 'D' end as result
    from matches where tournament_id = p_tournament_id and status = 'completed' and away_team_id is not null
  ),
  aggregated as (
    select
      team_id,
      max(group_id) as group_id,
      count(*) as played,
      count(*) filter (where result = 'W') as won,
      count(*) filter (where result = 'D') as drawn,
      count(*) filter (where result = 'L') as lost,
      coalesce(sum(gf), 0) as goals_for,
      coalesce(sum(ga), 0) as goals_against,
      count(*) filter (where result = 'W') * pts_win
        + count(*) filter (where result = 'D') * pts_draw
        + count(*) filter (where result = 'L') * pts_loss as points
    from team_matches
    group by team_id
  )
  insert into standings (tournament_id, group_id, team_id, played, won, drawn, lost, goals_for, goals_against, points, updated_at)
  select p_tournament_id, a.group_id, a.team_id, a.played, a.won, a.drawn, a.lost, a.goals_for, a.goals_against, a.points, now()
  from aggregated a
  on conflict (tournament_id, team_id) do update set
    group_id = excluded.group_id,
    played = excluded.played,
    won = excluded.won,
    drawn = excluded.drawn,
    lost = excluded.lost,
    goals_for = excluded.goals_for,
    goals_against = excluded.goals_against,
    points = excluded.points,
    updated_at = now();

  with ranked as (
    select id, row_number() over (
      partition by tournament_id, group_id
      order by points desc, (goals_for - goals_against) desc, goals_for desc
    ) as rnk
    from standings where tournament_id = p_tournament_id
  )
  update standings s set rank = ranked.rnk
  from ranked where ranked.id = s.id;
end;
$$;

create or replace function public.trg_recalculate_standings_on_match_complete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (tg_op = 'UPDATE' and new.status = 'completed' and (old.status is distinct from 'completed' or old.home_score is distinct from new.home_score or old.away_score is distinct from new.away_score))
     or (tg_op = 'INSERT' and new.status = 'completed') then
    perform public.recalculate_standings(new.tournament_id);
  end if;
  return new;
end;
$$;

create trigger trg_matches_recalculate_standings
  after insert or update on public.matches
  for each row execute function public.trg_recalculate_standings_on_match_complete();

create type enquiry_status as enum ('pending', 'contacted', 'activated', 'declined');

create table public.rental_enquiries (
  id             uuid primary key default gen_random_uuid(),
  organizer_id   uuid not null references public.profiles(id) on delete cascade,
  rental_plan_id uuid not null references public.rental_plans(id),
  tournament_id  uuid references public.tournaments(id) on delete set null,
  organization_name text not null,
  contact_name   text not null,
  contact_phone  text not null,
  contact_email  citext not null,
  message        text,
  status         enquiry_status not null default 'pending',
  reviewed_by    uuid references public.profiles(id),
  reviewed_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index idx_rental_enquiries_organizer on public.rental_enquiries(organizer_id);
create index idx_rental_enquiries_status on public.rental_enquiries(status);

create trigger trg_rental_enquiries_updated_at
  before update on public.rental_enquiries
  for each row execute function public.set_updated_at();

alter table public.rental_enquiries enable row level security;

create policy rental_enquiries_owner_read on public.rental_enquiries
  for select using (organizer_id = auth.uid());
create policy rental_enquiries_owner_insert on public.rental_enquiries
  for insert with check (organizer_id = auth.uid());
create policy rental_enquiries_super_admin_all on public.rental_enquiries
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create or replace function public.admin_activate_rental_enquiry(p_enquiry_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  enquiry record;
  plan record;
  new_subscription_id uuid;
  duration_interval interval;
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins may activate rentals';
  end if;

  select * into enquiry from rental_enquiries where id = p_enquiry_id;
  if not found then
    raise exception 'Enquiry not found';
  end if;

  select * into plan from rental_plans where id = enquiry.rental_plan_id;

  duration_interval := case plan.duration
    when '1_day' then interval '1 day'
    when '3_day' then interval '3 days'
    when '1_week' then interval '7 days'
    when '2_week' then interval '14 days'
    when '1_month' then interval '30 days'
    else interval '100 years'
  end;

  insert into subscriptions (organizer_id, plan_id, status, starts_at, ends_at)
  values (enquiry.organizer_id, enquiry.rental_plan_id, 'active', now(), now() + duration_interval)
  returning id into new_subscription_id;

  if enquiry.tournament_id is not null then
    update tournaments
    set status = 'active',
        subscription_id = new_subscription_id,
        rental_starts_at = now(),
        rental_ends_at = now() + duration_interval
    where id = enquiry.tournament_id;
  end if;

  update rental_enquiries
  set status = 'activated', reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_enquiry_id;

  insert into notifications (profile_id, type, title, body, link_url)
  values (
    enquiry.organizer_id, 'success', 'Your rental is now active',
    format('Your %s rental has been activated and your tournament is now live.', plan.name),
    '/dashboard/subscription'
  );

  return new_subscription_id;
end;
$$;
