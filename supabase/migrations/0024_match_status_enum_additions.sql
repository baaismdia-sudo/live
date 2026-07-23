-- =========================================================================
-- 0024_match_status_enum_additions.sql
-- Prompt 7 requires richer live-status states than Prompt 2 originally
-- modeled.
-- =========================================================================
alter type match_status add value if not exists 'warm_up';
alter type match_status add value if not exists 'half_time';
alter type match_status add value if not exists 'break';
alter type match_status add value if not exists 'extra_time';
alter type match_status add value if not exists 'penalty_shootout';
alter type match_status add value if not exists 'abandoned';
