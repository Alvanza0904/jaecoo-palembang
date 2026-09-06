-- JAECOO Palembang — Supabase Storage Setup
-- STEP 5C: Media System
--
-- Creates the storage bucket and RLS policies.
-- Run AFTER migration 20250906000002.
--
-- NOTE: If the bucket already exists, the INSERT is skipped (ON CONFLICT DO NOTHING).

-- ─── Create storage bucket ────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'jaecoo-media',
  'jaecoo-media',
  true,               -- public bucket so URLs are directly readable
  10485760,           -- 10 MB per file
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id) do nothing;

-- ─── Storage RLS Policies ─────────────────────────────────────────────────

-- Public: read any file in the bucket
create policy "storage_public_read"
  on storage.objects for select
  using ( bucket_id = 'jaecoo-media' );

-- Authenticated admin: upload (INSERT)
create policy "storage_auth_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'jaecoo-media'
    and auth.role() = 'authenticated'
  );

-- Authenticated admin: delete
create policy "storage_auth_delete"
  on storage.objects for delete
  using (
    bucket_id = 'jaecoo-media'
    and auth.role() = 'authenticated'
  );
