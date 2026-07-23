-- =========================================================================
-- 0022_players_extra_fields.sql
-- Prompt 6 (Player Management) requires gender, awards, and medical notes,
-- which weren't in the original Prompt 2 player schema — necessary
-- compatibility addition.
-- =========================================================================

alter table public.players
  add column gender text check (gender in ('male', 'female', 'other', 'prefer_not_to_say')),
  add column awards text[] not null default '{}',
  add column medical_notes text;
