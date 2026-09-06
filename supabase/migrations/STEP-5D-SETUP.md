# JAECOO Palembang — STEP 5D Setup Guide

## Smart Media Processing

### 1. Install dependencies

```bash
npm install sharp @imgly/background-removal
npm install -D @types/sharp
```

**sharp** — server-side image resize (generates responsive variants)
**@imgly/background-removal** — client-side WebAssembly background removal (no API key needed)

### 2. Run database migration

Di Supabase SQL Editor, jalankan:
```
supabase/migrations/20250907000001_media_processing.sql
```

Migration ini menambahkan:
- `processing_status` enum ke `media_assets`
- `cutout_url`, `cutout_storage_path`, `variants` JSONB columns
- `alt_text`, `processing_error` columns
- `cutout_media_id` ke `models` dan `model_variants` tables

### 3. Architecture

```
UPLOAD (POST /api/admin/media/upload)
├── Store original → category/originals/filename-timestamp.ext
├── Save DB record with processing_status: 'uploaded'
└── Fire-and-forget → /api/admin/media/process

PROCESS (POST /api/admin/media/process) [Node.js, up to 60s]
├── Download original from Supabase Storage
├── Sharp resize to: 1920, 1440, 1024, 768, 480px + thumbnail
├── Upload variants as WebP → category/originals/filename__1920w.webp etc.
└── Update DB: variants JSONB + processing_status: 'ready'

BACKGROUND REMOVAL (Client-side, no server)
├── Admin clicks "Hapus Background" in MediaDetail panel
├── @imgly/background-removal loads WASM model (~40MB, cached)
├── Runs in browser → returns transparent WebP Blob
├── POST /api/admin/media/cutout → saves cutout to Storage
└── Update DB: cutout_url + cutout_storage_path

MODEL EDITOR
├── Hero Background → pick any media (uses original or variant)
└── Hero Cutout → pick media that has cutout_url
```

### 4. Background removal notes

**Working:** Browser-side WASM, no API key, free
**Limitation:** ~40MB model download on first use (cached by browser after that)
**Suitable for:** Vehicles, products with clear subject
**Not suitable for:** Complex scenes, multiple subjects

If you need higher quality or batch processing, consider:
- remove.bg API (commercial)
- Clipdrop API (Stability AI)
- PhotoRoom API

These can be integrated in `/api/admin/media/cutout` as server-side providers in a future step.

### 5. Vercel deployment notes

- `sharp` works on Vercel (same runtime as Next.js Image Optimization)
- Processing runs as a separate serverless function (60s max on Pro plan)
- If processing times out on large images, reduce VARIANT_WIDTHS in media-asset.ts
- Background removal runs CLIENT-SIDE — no Vercel timeout concerns

### 6. Testing checklist

1. Upload image → check status shows "Menunggu" then "Ready"
2. Click media card → MediaDetail opens
3. Check variants grid shows ✓ for processed sizes
4. Click "Hapus Background" → model downloads (first time ~40MB)
5. Processing runs → cutout preview shows on checkerboard
6. Cutout saved → Media Library card shows "✂ Cutout" indicator
7. In Model Editor → Cutout picker → select media with cutout
8. Save → cutout_url stored in model_content.hero.cutout_url
