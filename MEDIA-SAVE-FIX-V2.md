# Media Save Fix V2

The supplied build had `ContentImageField` calling `/api/admin/content-media`, but the route handler was missing from the archive. This is the direct API path behind the admin message `Gagal menyimpan media.`

Added `app/api/admin/content-media/route.ts` with authenticated server-side Supabase access and GET/PUT/DELETE operations.

The PUT handler matches the real `content_media` schema and handles the nullable `breakpoint` safely. PostgreSQL treats NULL values as distinct in a normal unique constraint, so the universal assignment is explicitly looked up and updated instead of relying on `upsert` to match it.

No new table, bucket, or duplicate media architecture was introduced.
