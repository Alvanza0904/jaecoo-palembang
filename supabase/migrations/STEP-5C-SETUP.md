# STEP 5C — Media System Setup

## Urutan Migrasi

Jalankan migrations berikut di Supabase SQL Editor, **berurutan**:

1. `20250906000002_create_media_assets.sql`
   - Membuat tabel `media_assets`
   - Menambah kolom `media_asset_id` ke `model_colors`
   - Mengaktifkan RLS dengan policy yang aman
   - Membuat trigger `updated_at`

2. `20250906000003_storage_setup.sql`
   - Membuat bucket `jaecoo-media` (public, 10 MB limit)
   - Folder/path otomatis: `models/`, `promos/`, `news/`, `gallery/`, `about/`, `og/`, `system/`
   - RLS Storage: public read, authenticated upload/delete

## Catatan Penting

- **Tidak ada service_role di browser** — semua upload menggunakan anon key + RLS
- **Bucket public** — URL gambar bisa dibaca tanpa auth
- **Original file tetap ada** — tidak ada auto-delete original
- Jika bucket sudah ada, `storage_setup.sql` aman dijalankan ulang (ON CONFLICT DO NOTHING)

## Verifikasi

Setelah migration:
1. Buka Supabase Dashboard → Storage → pastikan bucket `jaecoo-media` ada
2. Buka Supabase Dashboard → Table Editor → pastikan tabel `media_assets` ada
3. Login Admin → `/admin/media` → coba upload gambar
4. Pastikan gambar muncul di Media Library
5. Buka Model Editor → Tab Basic Info → scroll ke Hero Image → pilih dari Media Library
