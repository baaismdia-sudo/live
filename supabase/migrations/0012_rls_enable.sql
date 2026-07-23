-- =========================================================================
-- 0012_rls_enable.sql
-- Enable Row Level Security on every application table.
-- (Policies themselves live in 0013_rls_policies.sql — with RLS enabled
-- and zero policies, a table is fully locked down by default, which is
-- the safe intermediate state between these two migrations.)
-- =========================================================================

alter table public.roles               enable row level security;
alter table public.permissions          enable row level security;
alter table public.role_permissions     enable row level security;
alter table public.profiles             enable row level security;
alter table public.api_keys             enable row level security;

alter table public.rental_plans         enable row level security;
alter table public.coupons              enable row level security;
alter table public.subscriptions        enable row level security;
alter table public.payments             enable row level security;
alter table public.transactions         enable row level security;

alter table public.tournaments          enable row level security;
alter table public.tournament_settings  enable row level security;
alter table public.website_themes       enable row level security;
alter table public.site_settings        enable row level security;
alter table public.seo_settings         enable row level security;
alter table public.domains              enable row level security;
alter table public.custom_domains       enable row level security;

alter table public.groups               enable row level security;
alter table public.teams                enable row level security;
alter table public.players              enable row level security;
alter table public.player_statistics    enable row level security;

alter table public.fixtures             enable row level security;
alter table public.matches              enable row level security;
alter table public.match_events         enable row level security;
alter table public.live_scores          enable row level security;
alter table public.commentary           enable row level security;
alter table public.standings            enable row level security;

alter table public.media_library        enable row level security;
alter table public.sponsors             enable row level security;
alter table public.categories           enable row level security;
alter table public.news                 enable row level security;
alter table public.gallery              enable row level security;
alter table public.testimonials         enable row level security;
alter table public.faq                  enable row level security;
alter table public.contact_messages     enable row level security;

alter table public.notifications        enable row level security;
alter table public.feature_flags        enable row level security;
alter table public.email_templates      enable row level security;
alter table public.support_tickets      enable row level security;

alter table public.live_streams         enable row level security;
alter table public.advertisements       enable row level security;

alter table public.webhook_logs         enable row level security;
alter table public.backups              enable row level security;
alter table public.analytics            enable row level security;
alter table public.activity_logs        enable row level security;
alter table public.audit_logs           enable row level security;
alter table public.system_settings      enable row level security;
