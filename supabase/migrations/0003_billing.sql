-- =========================================================================
-- 0003_billing.sql
-- Rental plans, coupons, subscriptions, payments, transactions
-- =========================================================================

create table public.rental_plans (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  duration    rental_duration not null,
  price_cents bigint not null check (price_cents >= 0),
  currency    text not null default 'INR',
  features    jsonb not null default '[]',   -- ["custom_domain","unlimited_teams",...]
  max_teams   int,                            -- null = unlimited
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger trg_rental_plans_updated_at
  before update on public.rental_plans
  for each row execute function public.set_updated_at();

create table public.coupons (
  id               uuid primary key default gen_random_uuid(),
  code             text not null unique,
  discount_type    coupon_discount_type not null,
  discount_value   numeric not null check (discount_value > 0),
  max_redemptions  int,
  times_redeemed   int not null default 0,
  valid_from       timestamptz not null default now(),
  valid_until      timestamptz,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

create table public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  organizer_id  uuid not null references public.profiles(id) on delete cascade,
  plan_id       uuid not null references public.rental_plans(id),
  coupon_id     uuid references public.coupons(id),
  status        subscription_status not null default 'trialing',
  starts_at     timestamptz not null default now(),
  ends_at       timestamptz not null,
  auto_renew    boolean not null default false,
  cancelled_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_subscriptions_organizer_id on public.subscriptions(organizer_id);
create index idx_subscriptions_status       on public.subscriptions(status);

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- tournament_id FK is added in 0004 once the tournaments table exists.
create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  organizer_id    uuid not null references public.profiles(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  tournament_id   uuid,                        -- FK added later
  amount_cents    bigint not null check (amount_cents >= 0),
  currency        text not null default 'INR',
  status          payment_status not null default 'pending',
  gateway         text not null,                -- razorpay, stripe, etc.
  gateway_ref     text,
  coupon_id       uuid references public.coupons(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_payments_organizer_id on public.payments(organizer_id);
create index idx_payments_status       on public.payments(status);

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create table public.transactions (
  id               uuid primary key default gen_random_uuid(),
  payment_id       uuid not null references public.payments(id) on delete cascade,
  type             text not null check (type in ('charge','refund','payout')),
  amount_cents     bigint not null,
  currency         text not null default 'INR',
  status           payment_status not null default 'pending',
  gateway          text not null,
  gateway_ref      text,
  raw_response     jsonb,
  created_at       timestamptz not null default now()
);

create index idx_transactions_payment_id on public.transactions(payment_id);
