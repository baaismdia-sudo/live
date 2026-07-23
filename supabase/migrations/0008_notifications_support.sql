-- =========================================================================
-- 0008_notifications_support.sql
-- Notifications, feature flags, email templates, support tickets
-- =========================================================================

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  type        notification_type not null default 'info',
  title       text not null,
  body        text,
  link_url    text,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_profile_id on public.notifications(profile_id);
create index idx_notifications_is_read    on public.notifications(profile_id, is_read);

create table public.feature_flags (
  id                  uuid primary key default gen_random_uuid(),
  key                 text not null unique,
  name                text not null,
  description         text,
  is_enabled          boolean not null default false,
  rollout_percentage  int not null default 100 check (rollout_percentage between 0 and 100),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger trg_feature_flags_updated_at
  before update on public.feature_flags
  for each row execute function public.set_updated_at();

create table public.email_templates (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,          -- welcome_email, payment_receipt, tournament_expiring...
  subject    text not null,
  html_body  text not null,
  variables  jsonb not null default '[]',    -- documents available {{tokens}}
  updated_at timestamptz not null default now()
);

create trigger trg_email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();

create table public.support_tickets (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  assigned_to  uuid references public.profiles(id) on delete set null,
  subject      text not null,
  message      text not null,
  status       ticket_status not null default 'open',
  priority     ticket_priority not null default 'medium',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  resolved_at  timestamptz
);

create index idx_support_tickets_profile_id on public.support_tickets(profile_id);
create index idx_support_tickets_status     on public.support_tickets(status);

create trigger trg_support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.set_updated_at();
