-- =========================================================================
-- 0013_rls_policies.sql
-- Row Level Security policies for every table.
--
-- Convention used throughout:
--   - A "<table>_super_admin_all" policy grants super_admin unrestricted
--     access, so it is written once per table instead of OR-ed into every
--     other policy.
--   - Public/anon read policies are scoped to `is_publicly_visible_tournament`
--     so archived tournaments remain viewable (read-only) after expiry.
--   - Organizer/staff write policies are scoped to `is_tournament_staff`.
-- =========================================================================

-- ---------------------------------------------------------------------
-- roles / permissions / role_permissions — reference data, readable by
-- any authenticated user (needed client-side for role-aware UI), only
-- super_admin may write.
-- ---------------------------------------------------------------------
create policy roles_read_authenticated on public.roles
  for select using (auth.role() = 'authenticated');
create policy roles_super_admin_all on public.roles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy permissions_read_authenticated on public.permissions
  for select using (auth.role() = 'authenticated');
create policy permissions_super_admin_all on public.permissions
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy role_permissions_read_authenticated on public.role_permissions
  for select using (auth.role() = 'authenticated');
create policy role_permissions_super_admin_all on public.role_permissions
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_select_staff_of_organizer on public.profiles
  for select using (organizer_id = auth.uid());          -- organizer can see their staff
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role_id = (select role_id from public.profiles where id = auth.uid()));
  -- users can edit their own profile fields but cannot self-promote their role
create policy profiles_super_admin_all on public.profiles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- api_keys — owner only
-- ---------------------------------------------------------------------
create policy api_keys_owner_all on public.api_keys
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy api_keys_super_admin_all on public.api_keys
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- rental_plans — public can read active plans (pricing page), only
-- super_admin manages them.
-- ---------------------------------------------------------------------
create policy rental_plans_public_read on public.rental_plans
  for select using (is_active = true);
create policy rental_plans_super_admin_all on public.rental_plans
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- coupons — organizers can validate a coupon code they were given, but
-- only super_admin lists/manages them.
-- ---------------------------------------------------------------------
create policy coupons_validate_active on public.coupons
  for select using (is_active = true and auth.role() = 'authenticated');
create policy coupons_super_admin_all on public.coupons
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- subscriptions / payments / transactions — organizer sees & creates
-- their own; updates restricted to system (service role / edge functions)
-- and super_admin, since payment state must not be client-writable.
-- ---------------------------------------------------------------------
create policy subscriptions_select_own on public.subscriptions
  for select using (organizer_id = auth.uid());
create policy subscriptions_insert_own on public.subscriptions
  for insert with check (organizer_id = auth.uid());
create policy subscriptions_super_admin_all on public.subscriptions
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy payments_select_own on public.payments
  for select using (organizer_id = auth.uid());
create policy payments_insert_own on public.payments
  for insert with check (organizer_id = auth.uid());
create policy payments_super_admin_all on public.payments
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy transactions_select_own on public.transactions
  for select using (
    exists (select 1 from public.payments pay where pay.id = payment_id and pay.organizer_id = auth.uid())
  );
create policy transactions_super_admin_all on public.transactions
  for all using (public.is_super_admin()) with check (public.is_super_admin());
-- NOTE: transaction inserts/updates come only from edge functions using the
-- service_role key (webhook handlers), which bypasses RLS by design.

-- ---------------------------------------------------------------------
-- tournaments
-- ---------------------------------------------------------------------
create policy tournaments_public_read on public.tournaments
  for select using (is_public = true and deleted_at is null and status <> 'draft');
create policy tournaments_staff_read on public.tournaments
  for select using (organizer_id = public.effective_organizer_id());
create policy tournaments_organizer_insert on public.tournaments
  for insert with check (organizer_id = auth.uid() and public.current_role_name() = 'organizer');
create policy tournaments_staff_update on public.tournaments
  for update using (public.is_tournament_staff(id) and status <> 'archived')
  with check (public.is_tournament_staff(id));
create policy tournaments_super_admin_all on public.tournaments
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- Generic pattern applied to all 1:1 tournament configuration tables:
-- tournament_settings, website_themes, site_settings, seo_settings,
-- domains, custom_domains.
-- Public may read (site rendering needs theme/seo/site settings even for
-- anonymous visitors); only tournament staff may write; writes blocked
-- once the tournament is archived.
-- ---------------------------------------------------------------------
create policy tournament_settings_public_read on public.tournament_settings
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy tournament_settings_staff_write on public.tournament_settings
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy tournament_settings_super_admin_all on public.tournament_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy website_themes_public_read on public.website_themes
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy website_themes_staff_write on public.website_themes
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy website_themes_super_admin_all on public.website_themes
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy site_settings_public_read on public.site_settings
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy site_settings_staff_write on public.site_settings
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy site_settings_super_admin_all on public.site_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy seo_settings_public_read on public.seo_settings
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy seo_settings_staff_write on public.seo_settings
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy seo_settings_super_admin_all on public.seo_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy domains_public_read on public.domains
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy domains_staff_write on public.domains
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy domains_super_admin_all on public.domains
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy custom_domains_staff_all on public.custom_domains
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy custom_domains_super_admin_all on public.custom_domains
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- groups / teams / players / player_statistics
-- ---------------------------------------------------------------------
create policy groups_public_read on public.groups
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy groups_staff_write on public.groups
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy groups_super_admin_all on public.groups
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy teams_public_read on public.teams
  for select using (public.is_publicly_visible_tournament(tournament_id) and deleted_at is null);
create policy teams_staff_write on public.teams
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy teams_super_admin_all on public.teams
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy players_public_read on public.players
  for select using (
    deleted_at is null and exists (
      select 1 from public.teams t where t.id = team_id and public.is_publicly_visible_tournament(t.tournament_id)
    )
  );
create policy players_staff_write on public.players
  for all using (
    exists (select 1 from public.teams t where t.id = team_id and public.is_tournament_staff(t.tournament_id))
  )
  with check (
    exists (select 1 from public.teams t where t.id = team_id and public.is_tournament_staff(t.tournament_id))
  );
create policy players_super_admin_all on public.players
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy player_statistics_public_read on public.player_statistics
  for select using (
    exists (
      select 1 from public.players pl
      join public.teams t on t.id = pl.team_id
      where pl.id = player_id and public.is_publicly_visible_tournament(t.tournament_id)
    )
  );
create policy player_statistics_staff_write on public.player_statistics
  for all using (
    exists (
      select 1 from public.players pl
      join public.teams t on t.id = pl.team_id
      where pl.id = player_id and public.is_tournament_staff(t.tournament_id)
    )
  )
  with check (
    exists (
      select 1 from public.players pl
      join public.teams t on t.id = pl.team_id
      where pl.id = player_id and public.is_tournament_staff(t.tournament_id)
    )
  );
create policy player_statistics_super_admin_all on public.player_statistics
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- fixtures / matches / match_events / live_scores / commentary / standings
-- Scorekeepers get a narrower write policy: they may update live_scores
-- and insert match_events/commentary for tournaments they staff, but full
-- match CRUD (creating/deleting matches) is limited to manager/organizer.
-- ---------------------------------------------------------------------
create policy fixtures_public_read on public.fixtures
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy fixtures_staff_write on public.fixtures
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy fixtures_super_admin_all on public.fixtures
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy matches_public_read on public.matches
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy matches_staff_write on public.matches
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy matches_scorekeeper_update_score on public.matches
  for update using (public.is_tournament_scorekeeper(tournament_id))
  with check (public.is_tournament_scorekeeper(tournament_id));
create policy matches_super_admin_all on public.matches
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy match_events_public_read on public.match_events
  for select using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_publicly_visible_tournament(m.tournament_id))
  );
create policy match_events_scorekeeper_insert on public.match_events
  for insert with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_scorekeeper(m.tournament_id))
  );
create policy match_events_staff_write on public.match_events
  for all using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  )
  with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  );
create policy match_events_super_admin_all on public.match_events
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy live_scores_public_read on public.live_scores
  for select using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_publicly_visible_tournament(m.tournament_id))
  );
create policy live_scores_scorekeeper_write on public.live_scores
  for all using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_scorekeeper(m.tournament_id))
  )
  with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_scorekeeper(m.tournament_id))
  );
create policy live_scores_super_admin_all on public.live_scores
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy commentary_public_read on public.commentary
  for select using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_publicly_visible_tournament(m.tournament_id))
  );
create policy commentary_commentator_insert on public.commentary
  for insert with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_commentator(m.tournament_id))
    and author_id = auth.uid()
  );
create policy commentary_staff_write on public.commentary
  for all using (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  )
  with check (
    exists (select 1 from public.matches m where m.id = match_id and public.is_tournament_staff(m.tournament_id))
  );
create policy commentary_super_admin_all on public.commentary
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy standings_public_read on public.standings
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy standings_staff_write on public.standings
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy standings_super_admin_all on public.standings
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- media_library — private to the organizer who owns it (not public;
-- public exposure happens through gallery/news/sponsors which reference
-- the resulting URL).
-- ---------------------------------------------------------------------
create policy media_library_owner_all on public.media_library
  for all using (organizer_id = public.effective_organizer_id())
  with check (organizer_id = public.effective_organizer_id());
create policy media_library_super_admin_all on public.media_library
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- sponsors / gallery
-- ---------------------------------------------------------------------
create policy sponsors_public_read on public.sponsors
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy sponsors_staff_write on public.sponsors
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy sponsors_super_admin_all on public.sponsors
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy gallery_public_read on public.gallery
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy gallery_staff_write on public.gallery
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy gallery_super_admin_all on public.gallery
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- categories — shared reference data, public read, staff/admin write
-- ---------------------------------------------------------------------
create policy categories_public_read on public.categories
  for select using (true);
create policy categories_staff_write on public.categories
  for insert with check (auth.role() = 'authenticated');
create policy categories_super_admin_all on public.categories
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- news
-- ---------------------------------------------------------------------
create policy news_public_read on public.news
  for select using (
    is_published = true and deleted_at is null and public.is_publicly_visible_tournament(tournament_id)
  );
create policy news_staff_write on public.news
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy news_super_admin_all on public.news
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- testimonials / faq — tournament-scoped rows follow tournament
-- visibility; platform-level rows (tournament_id is null) are public.
-- ---------------------------------------------------------------------
create policy testimonials_public_read on public.testimonials
  for select using (
    is_published = true and (
      tournament_id is null or public.is_publicly_visible_tournament(tournament_id)
    )
  );
create policy testimonials_staff_write on public.testimonials
  for all using (tournament_id is not null and public.is_tournament_staff(tournament_id))
  with check (tournament_id is not null and public.is_tournament_staff(tournament_id));
create policy testimonials_super_admin_all on public.testimonials
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy faq_public_read on public.faq
  for select using (tournament_id is null or public.is_publicly_visible_tournament(tournament_id));
create policy faq_staff_write on public.faq
  for all using (tournament_id is not null and public.is_tournament_staff(tournament_id))
  with check (tournament_id is not null and public.is_tournament_staff(tournament_id));
create policy faq_super_admin_all on public.faq
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- contact_messages — anyone can insert (contact form), only staff/admin
-- can read/manage the resulting messages.
-- ---------------------------------------------------------------------
create policy contact_messages_public_insert on public.contact_messages
  for insert with check (true);
create policy contact_messages_staff_read on public.contact_messages
  for select using (tournament_id is not null and public.is_tournament_staff(tournament_id));
create policy contact_messages_staff_update on public.contact_messages
  for update using (tournament_id is not null and public.is_tournament_staff(tournament_id))
  with check (tournament_id is not null and public.is_tournament_staff(tournament_id));
create policy contact_messages_super_admin_all on public.contact_messages
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- notifications — strictly private to the recipient
-- ---------------------------------------------------------------------
create policy notifications_owner_all on public.notifications
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy notifications_super_admin_all on public.notifications
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- feature_flags — readable by authenticated app (client feature gating),
-- writable only by super_admin.
-- ---------------------------------------------------------------------
create policy feature_flags_read_authenticated on public.feature_flags
  for select using (auth.role() in ('authenticated','anon'));
create policy feature_flags_super_admin_all on public.feature_flags
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- email_templates — internal only
-- ---------------------------------------------------------------------
create policy email_templates_super_admin_all on public.email_templates
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- support_tickets
-- ---------------------------------------------------------------------
create policy support_tickets_owner_all on public.support_tickets
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy support_tickets_assignee_read on public.support_tickets
  for select using (assigned_to = auth.uid());
create policy support_tickets_super_admin_all on public.support_tickets
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- live_streams / advertisements
-- ---------------------------------------------------------------------
create policy live_streams_public_read on public.live_streams
  for select using (public.is_publicly_visible_tournament(tournament_id));
create policy live_streams_staff_write on public.live_streams
  for all using (public.is_tournament_staff(tournament_id))
  with check (public.is_tournament_staff(tournament_id));
create policy live_streams_super_admin_all on public.live_streams
  for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy advertisements_public_read on public.advertisements
  for select using (
    is_active = true and (tournament_id is null or public.is_publicly_visible_tournament(tournament_id))
  );
create policy advertisements_staff_write on public.advertisements
  for all using (tournament_id is not null and public.is_tournament_staff(tournament_id))
  with check (tournament_id is not null and public.is_tournament_staff(tournament_id));
create policy advertisements_super_admin_all on public.advertisements
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ---------------------------------------------------------------------
-- Platform-internal tables — super_admin (and service_role, which
-- bypasses RLS entirely) only. No end-user access.
-- ---------------------------------------------------------------------
create policy webhook_logs_super_admin_all on public.webhook_logs
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy backups_super_admin_all on public.backups
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy analytics_super_admin_all on public.analytics
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy analytics_organizer_read_own on public.analytics
  for select using (tournament_id is not null and public.is_tournament_staff(tournament_id));
create policy activity_logs_super_admin_all on public.activity_logs
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy activity_logs_owner_read on public.activity_logs
  for select using (profile_id = auth.uid());
create policy audit_logs_super_admin_all on public.audit_logs
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy system_settings_super_admin_all on public.system_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());
create policy system_settings_public_read_maintenance on public.system_settings
  for select using (key = 'maintenance_mode');
