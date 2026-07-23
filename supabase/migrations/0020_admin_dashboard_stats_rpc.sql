-- =========================================================================
-- 0020_admin_dashboard_stats_rpc.sql
-- Aggregated RPCs backing the Super Admin Dashboard Home.
-- =========================================================================

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_super_admin() then
    raise exception 'Only super admins may view platform statistics';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from profiles where deleted_at is null),
    'total_organizers', (select count(*) from profiles p join roles r on r.id = p.role_id where r.name = 'organizer' and p.deleted_at is null),
    'active_tournaments', (select count(*) from tournaments where status = 'active' and deleted_at is null),
    'live_matches', (select count(*) from matches where status = 'live'),
    'revenue_today', (select coalesce(sum(amount_cents), 0) from payments where status = 'succeeded' and created_at >= date_trunc('day', now())),
    'revenue_this_month', (select coalesce(sum(amount_cents), 0) from payments where status = 'succeeded' and created_at >= date_trunc('month', now())),
    'revenue_this_year', (select coalesce(sum(amount_cents), 0) from payments where status = 'succeeded' and created_at >= date_trunc('year', now())),
    'active_rentals', (select count(*) from subscriptions where status = 'active'),
    'expired_rentals', (select count(*) from subscriptions where status = 'expired'),
    'new_users_7d', (select count(*) from profiles where created_at >= now() - interval '7 days' and deleted_at is null),
    'new_payments_7d', (select count(*) from payments where created_at >= now() - interval '7 days' and status = 'succeeded'),
    'open_support_tickets', (select count(*) from support_tickets where status in ('open','in_progress')),
    'pending_contact_messages', (select count(*) from contact_messages where status = 'new')
  ) into result;

  return result;
end;
$$;

create or replace function public.admin_revenue_series(p_days int default 30)
returns table(day date, revenue_cents bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    d::date as day,
    coalesce((
      select sum(p.amount_cents) from payments p
      where p.status = 'succeeded' and p.created_at::date = d::date
    ), 0) as revenue_cents
  from generate_series(current_date - (p_days - 1), current_date, interval '1 day') as d
  where public.is_super_admin();
$$;

create or replace function public.admin_user_growth_series(p_days int default 30)
returns table(day date, new_users bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    d::date as day,
    coalesce((
      select count(*) from profiles pr
      where pr.created_at::date = d::date and pr.deleted_at is null
    ), 0) as new_users
  from generate_series(current_date - (p_days - 1), current_date, interval '1 day') as d
  where public.is_super_admin();
$$;

create or replace function public.admin_popular_sports()
returns table(sport text, tournament_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select t.sport, count(*) as tournament_count
  from tournaments t
  where public.is_super_admin() and t.deleted_at is null
  group by t.sport
  order by tournament_count desc
  limit 8;
$$;
