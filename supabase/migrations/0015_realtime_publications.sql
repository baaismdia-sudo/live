-- =========================================================================
-- 0015_realtime_publications.sql
-- Enable Supabase Realtime on tables that power live UI updates.
-- =========================================================================

alter publication supabase_realtime add table public.live_scores;
alter publication supabase_realtime add table public.commentary;
alter publication supabase_realtime add table public.match_events;
alter publication supabase_realtime add table public.standings;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.matches;

-- Full row images on UPDATE/DELETE so clients receive complete before/after
-- payloads (needed for optimistic-update reconciliation in React Query).
alter table public.live_scores  replica identity full;
alter table public.commentary   replica identity full;
alter table public.match_events replica identity full;
alter table public.standings    replica identity full;
alter table public.notifications replica identity full;
alter table public.matches      replica identity full;
