-- =========================================================================
-- 0010_system_logs.sql
-- Webhook logs, backups, analytics, activity logs, audit logs, system settings
-- =========================================================================

create table public.webhook_logs (
  id            uuid primary key default gen_random_uuid(),
  source        text not null,             -- razorpay, stripe, resend, custom...
  event_type    text not null,
  payload       jsonb not null,
  status        webhook_status not null default 'received',
  error_message text,
  created_at    timestamptz not null default now()
);

create index idx_webhook_logs_source on public.webhook_logs(source);
create index idx_webhook_logs_status on public.webhook_logs(status);

create table public.backups (
  id            uuid primary key default gen_random_uuid(),
  backup_type   backup_type not null,
  file_url      text,
  size_bytes    bigint,
  status        backup_status not null default 'pending',
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

create table public.analytics (
  id            uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete cascade,  -- null = platform-wide metric
  metric_key    text not null,             -- page_views, unique_visitors, signups...
  metric_value  numeric not null default 0,
  recorded_date date not null default current_date,
  created_at    timestamptz not null default now(),
  unique (tournament_id, metric_key, recorded_date)
);

create index idx_analytics_tournament_id on public.analytics(tournament_id);
create index idx_analytics_recorded_date on public.analytics(recorded_date);

create table public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles(id) on delete set null,
  action      text not null,               -- "created_tournament", "invited_scorekeeper"...
  entity_type text,
  entity_id   uuid,
  metadata    jsonb not null default '{}',
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index idx_activity_logs_profile_id on public.activity_logs(profile_id);
create index idx_activity_logs_entity     on public.activity_logs(entity_type, entity_id);

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid references public.profiles(id) on delete set null,
  table_name  text not null,
  record_id   uuid not null,
  action      audit_action not null,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz not null default now()
);

create index idx_audit_logs_table_record on public.audit_logs(table_name, record_id);

create table public.system_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,        -- maintenance_mode, platform_name, support_email...
  value       jsonb not null,
  description text,
  updated_at  timestamptz not null default now()
);

create trigger trg_system_settings_updated_at
  before update on public.system_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Generic audit trigger — attach to any sensitive table as needed.
-- Demonstrated here on tournaments, payments, and subscriptions.
-- ---------------------------------------------------------------------
create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (profile_id, table_name, record_id, action, old_data, new_data)
  values (
    auth.uid(),
    tg_table_name,
    coalesce(new.id, old.id),
    lower(tg_op)::audit_action,
    case when tg_op in ('update','delete') then to_jsonb(old) else null end,
    case when tg_op in ('update','insert') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_audit_tournaments
  after insert or update or delete on public.tournaments
  for each row execute function public.log_audit_event();

create trigger trg_audit_payments
  after insert or update or delete on public.payments
  for each row execute function public.log_audit_event();

create trigger trg_audit_subscriptions
  after insert or update or delete on public.subscriptions
  for each row execute function public.log_audit_event();
