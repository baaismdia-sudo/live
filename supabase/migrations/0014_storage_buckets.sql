-- =========================================================================
-- 0014_storage_buckets.sql
-- Storage buckets + object-level access policies
-- =========================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',           'avatars',           true,  5242880,   array['image/png','image/jpeg','image/webp']),
  ('tournament-logos',  'tournament-logos',  true,  5242880,   array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('team-logos',        'team-logos',        true,  5242880,   array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('player-photos',     'player-photos',     true,  5242880,   array['image/png','image/jpeg','image/webp']),
  ('gallery-images',    'gallery-images',    true,  10485760,  array['image/png','image/jpeg','image/webp']),
  ('videos',            'videos',            true,  524288000, array['video/mp4','video/webm']),
  ('sponsor-logos',     'sponsor-logos',     true,  5242880,   array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('documents',         'documents',         false, 20971520,  array['application/pdf']),
  ('website-banners',   'website-banners',   true,  10485760,  array['image/png','image/jpeg','image/webp']),
  ('favicons',          'favicons',          true,  1048576,   array['image/png','image/x-icon','image/svg+xml']),
  ('news-images',       'news-images',       true,  10485760,  array['image/png','image/jpeg','image/webp']),
  ('public-files',      'public-files',      true,  20971520,  null),
  ('private-files',     'private-files',     false, 20971520,  null)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Convention: object paths are always prefixed with the owning
-- organizer's profile id, e.g. avatars/{profile_id}/photo.jpg or
-- tournament-logos/{organizer_id}/{tournament_id}/logo.png
-- This lets a single policy expression scope writes without a table join.
-- ---------------------------------------------------------------------

-- Public buckets: anyone can read (site visitors need to see logos/photos).
create policy storage_public_buckets_read on storage.objects
  for select using (
    bucket_id in (
      'avatars','tournament-logos','team-logos','player-photos','gallery-images',
      'videos','sponsor-logos','website-banners','favicons','news-images','public-files'
    )
  );

-- Authenticated users may upload/update/delete only inside their own
-- organizer-id-prefixed folder.
create policy storage_owner_write on storage.objects
  for insert with check (
    bucket_id in (
      'avatars','tournament-logos','team-logos','player-photos','gallery-images',
      'videos','sponsor-logos','website-banners','favicons','news-images',
      'public-files','private-files','documents'
    )
    and (storage.foldername(name))[1] = public.effective_organizer_id()::text
  );

create policy storage_owner_update on storage.objects
  for update using ((storage.foldername(name))[1] = public.effective_organizer_id()::text)
  with check ((storage.foldername(name))[1] = public.effective_organizer_id()::text);

create policy storage_owner_delete on storage.objects
  for delete using ((storage.foldername(name))[1] = public.effective_organizer_id()::text);

-- Private buckets: owner-only read.
create policy storage_private_owner_read on storage.objects
  for select using (
    bucket_id in ('private-files','documents')
    and (storage.foldername(name))[1] = public.effective_organizer_id()::text
  );

-- Super admin: full access to every bucket, every object.
create policy storage_super_admin_all on storage.objects
  for all using (public.is_super_admin()) with check (public.is_super_admin());
