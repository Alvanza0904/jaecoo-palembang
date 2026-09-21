# JAECOO Palembang — Homepage & Visual Editor Preview Sync Fix
## v3 — 2026-09-21

---

## Masalah yang diperbaiki

### 1. Visual Media Editor — canvas terlalu kecil (maxW: 320 → 390px mobile)

**Sebelum:** Canvas preview selalu max 320px untuk semua breakpoint.
**Sesudah:** Mobile = 390px (iPhone 14 Pro viewport), Desktop = 480px.

**Dampak:** Ketika canvas 320px tapi live render di 390px, posisi
`object-fit: cover` + `object-position` berbeda karena aspect ratio canvas
tidak sama dengan live. Gambar yang terlihat centered di editor bisa
terpotong berbeda di live.

**File yang diubah:**
- `components/admin/visual-editor/VisualMediaEditor.tsx` — baris `maxW`
- `components/admin/visual-editor/VisualMediaEditor.module.css` — `canvasArea` tambah `overflow-x: auto`

---

### 2. Homepage Editor Preview — route /admin-preview/homepage belum ada

**Sebelum:** `HomepagePreviewFrame` mencoba load `/admin-preview/homepage`
via iframe tapi route belum dibuat → iframe 404 → preview kosong/hitam.

**Sesudah:** Route dibuat dengan layout minimal (tanpa sidebar admin) +
page yang menerima postMessage dan render `HomepageSectionRenderer`.

**File yang dibuat (BARU):**
- `app/admin-preview/homepage/page.tsx` — route target iframe preview
- `app/admin-preview/homepage/layout.tsx` — layout minimal, no admin nav

---

### 3. HomepagePreviewFrame — tambah error state + retry

**Sebelum:** Jika iframe gagal load, tidak ada feedback ke user.
**Sesudah:** Tampil pesan error + tombol "Coba lagi" yang force-remount iframe.

**File yang diubah:**
- `components/admin/homepage/HomepagePreviewFrame.tsx`

---

### 4. Preview dan live pakai komponen yang sama (dari v2, dipertahankan)

- `HomepageSectionRenderer` dipakai oleh editor preview DAN live website
- Tidak ada custom preview renderer yang bisa drift dari live
- Mobile preview iframe = 390px viewport sebenarnya (bukan scale/transform)
- Save invalidate public homepage cache via `revalidatePath('/')`

---

## File yang perlu dipush ke repo

```
components/
  admin/
    homepage/
      HomepageEditor.tsx          ← updated
      HomepagePreviewFrame.tsx    ← updated (v3: error state)
      homepage.module.css         ← updated
    visual-editor/
      VisualMediaEditor.tsx       ← updated (v3: canvas width fix)
      VisualMediaEditor.module.css ← updated (v3: overflow-x)
      index.ts
    ai/
      AIAssistant.tsx
      AIReadyField.tsx
      ai.module.css
    brand-assets/
      BrandAssetsEditor.tsx
      brand-assets.module.css
    content/
      ContentImageField.tsx
      content.module.css
    media/
      MediaDetail.tsx, MediaDetail.module.css
      MediaLibrary.tsx, MediaLibrary.module.css
      MediaPicker.tsx, MediaPicker.module.css
      BackgroundRemoval.tsx, BackgroundRemoval.module.css
      index.ts
  hero/
    LayeredHero.tsx, LayeredHero.module.css
    HeroPlaceholder.tsx, HeroPlaceholder.module.css
    index.ts
  sections/
    HomepageSectionRenderer.tsx
    HomeExperience.tsx, HomeExperience.module.css
    HomeDealerLocation.tsx, HomeDealerLocation.module.css
    HomeModelSlider.tsx, HomeModelSlider.module.css
  model/
    ColorCarousel.tsx, ColorCarousel.module.css
    ModelNavigation.tsx, ModelNavigation.module.css
    index.ts
  ui/  (semua file)
  media/  (semua file)
  layout/  (semua file)
  finance/  (semua file)
  price/  (semua file)

app/
  admin-preview/
    homepage/
      page.tsx     ← BARU (wajib ada)
      layout.tsx   ← BARU (wajib ada)

types/
  homepage-content.ts
```

## Catatan

- Tidak ada perubahan pada database schema atau Supabase
- Tidak ada perubahan pada API routes yang ada
- `presentation.ts` (di `/lib/types/`) tidak termasuk karena tidak ada perubahan
