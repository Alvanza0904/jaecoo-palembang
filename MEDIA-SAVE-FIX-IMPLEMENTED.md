# Media Save Fix — Implemented

Perbaikan dibuat berdasarkan struktur repository yang diberikan, bukan snippet generik.

## Alur
Admin → authenticated server request → Supabase Storage (`jaecoo-media`) → `media_assets` → `content_media` → existing data layer → frontend.

## Important corrections
- Existing bucket: `jaecoo-media`.
- Existing `media_assets` columns: `storage_path`, `storage_bucket`, `public_url`, `size_bytes`, etc.
- Existing `content_media` key: `content_type + content_key + slot_key + breakpoint`.
- Existing data layer already uses `getContentMedia()` and Supabase-first model hydration.
- Tidak membuat `fallbackSiteData` fiktif atau mengganti arsitektur `lib/data/models.ts`/`lib/data/site.ts`.
- Server mutations use the existing Supabase server client; no service-role key added.
- Upload limit is aligned with the actual storage bucket limit of 10 MB.

## Added
- `app/actions/media.ts`
- `app/api/admin/media/upload/route.ts`
- `app/api/admin/media/route.ts`
- `app/api/admin/media/[id]/route.ts`
- `app/api/admin/media/presentation/route.ts`

## Note
The supplied archive has no `node_modules`, so dependency installation/build must be performed in the normal project environment.
