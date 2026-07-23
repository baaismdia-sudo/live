-- =========================================================================
-- 0001_extensions_and_enums.sql
-- Extensions + platform-wide enum types
-- =========================================================================

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";      -- for fast slug/name search
create extension if not exists "citext";       -- case-insensitive emails

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type rental_duration            as enum ('1_day','3_day','1_week','2_week','1_month','unlimited');
create type tournament_status          as enum ('draft','pending_payment','active','expiring','archived','suspended');
create type subscription_status        as enum ('trialing','active','past_due','cancelled','expired');
create type payment_status             as enum ('pending','succeeded','failed','refunded','partially_refunded');
create type match_status               as enum ('scheduled','live','completed','postponed','cancelled');
create type ticket_status              as enum ('open','in_progress','resolved','closed');
create type ticket_priority            as enum ('low','medium','high','urgent');
create type notification_type          as enum ('info','warning','success','error','system');
create type domain_verification_status as enum ('pending','verified','failed');
create type team_status                as enum ('pending','approved','rejected');
create type player_status              as enum ('active','injured','suspended');
create type ad_placement               as enum ('header','sidebar','footer','in_feed');
create type backup_type                as enum ('database','storage');
create type backup_status              as enum ('pending','in_progress','completed','failed');
create type audit_action               as enum ('insert','update','delete');
create type coupon_discount_type       as enum ('percentage','fixed');
create type message_status             as enum ('new','read','archived');
create type webhook_status             as enum ('received','processed','failed');

-- Generic helper: auto-update updated_at columns
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
