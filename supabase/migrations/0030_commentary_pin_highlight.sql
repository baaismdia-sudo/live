-- =========================================================================
-- 0030_commentary_pin_highlight.sql
-- =========================================================================
alter table public.commentary add column is_pinned boolean not null default false;
alter table public.commentary add column is_highlight boolean not null default false;
