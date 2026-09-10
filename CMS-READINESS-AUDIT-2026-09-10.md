# JAECOO Palembang — CMS Readiness Audit
## Finalization after Step 8.4 / 8.4A
Date: 2026-09-10

## A. Architecture Overview

```text
Supabase
  ├─ models / model_variants / model_content / model_specifications / model_colors
  ├─ media_assets
  └─ content_media
        ↓
lib/supabase/queries.ts
lib/supabase/media.ts
        ↓
Public pages + shared components
        ↓
Public Website
```

### Final data-flow decisions

- **Models:** Supabase is PRIMARY. `lib/data/models.ts` remains a reliability fallback only.
- **Model media:** `media_assets` is the asset registry; `content_media` maps semantic slots to assets. No second media registry was introduced.
- **Homepage media:** resolved through `getHomeMedia()`.
- **Promo/news media:** resolved through `getEntityMedia()`. Their current text/content source remains the existing static data because no approved promo/news content schema exists yet.
- **Brand logo:** `getSiteBrandAssets()` resolves one shared brand object in the public layout and passes it to Header + Footer.
- **Global contact/dealer settings:** centralized in `lib/data/site.ts` as an interim configuration layer. No new database schema was created.
- **Model ordering:** public model listing and homepage slider now use `ModelData.sort_order`, sourced from `models.sort_order`, instead of slug-order maps.

## B. CMS Readiness Table

| Area | Data Source | Image Source | Primary | Fallback | CMS Ready |
|---|---|---|---|---|---|
| Homepage Hero | Page composition + model/site data | `content_media` home/hero | Supabase media | Gradient placeholder | Image: Yes / Copy: Partial |
| Model Slider | `models` via `getModels()` | Model hero media | Supabase | Static model data | Yes |
| Model Listing | `models` via `getModels()` | Model hero media | Supabase | Static model data | Yes |
| J5 Detail | `models` + related model tables | 12-section `content_media` slots | Supabase | Static model data + placeholders | Yes |
| J7 Detail | `models` + related model tables | 12-section `content_media` slots | Supabase | Static model data + placeholders | Yes |
| J8 Detail | `models` + related model tables | 12-section `content_media` slots | Supabase | Static model data + placeholders | Yes |
| Colors | `model_colors` | `media_asset_id` → `media_assets` | Supabase | Legacy HTTPS image path / placeholder | Yes |
| Journal | Existing `NEWS` data layer | `content_media` news/cover | Static content | Empty state | Image: Yes / Content: Pending schema |
| Promo | Existing `PROMOS` data layer | `content_media` promo/cover | Static content | Empty state | Image: Yes / Content: Pending schema |
| Dealer Location | `SITE_SETTINGS` + home media | `content_media` home/dealer_location | Config + Supabase media | Gradient | Image: Yes / Copy: Config |
| Header Logo | `getSiteBrandAssets()` | `content_media` global/site/logo* | Supabase | Existing text brand fallback | Yes |
| Footer Logo | Same `getSiteBrandAssets()` object | Same global logo source | Supabase | Existing text brand fallback | Yes |

## C. Model Data Audit

### Canonical model identifiers

- `jaecoo-j5-ev` → JAECOO J5 EV
- `jaecoo-j7-shs` → JAECOO J7 SHS
- `jaecoo-j8-shs` → JAECOO J8 Ardis SHS

The existing route slug format is retained. No URL rename was performed.

### Model field source

The existing schema already provides the required model structure:

- `models.id`
- `models.slug`
- `models.name`
- `models.short_name`
- `models.tagline`
- `models.description`
- `models.published`
- `models.sort_order`
- `model_variants` for price/variant data
- `model_colors` for colors
- `model_specifications` for specifications
- `model_content` for flexible section content
- `media_assets` + `content_media` for media

`name` is the full display name; `short_name` is the compact UI identifier. These are intentionally different and are not duplicate fields.

### Source hierarchy

```text
PRIMARY
Supabase model tables
       ↓
lib/supabase/queries.ts
       ↓
ModelData
       ↓
Homepage / Listing / Detail / Specifications / Technology

FALLBACK
lib/data/models.ts
```

A direct static-model import was found in the shared `/model/[slug]` layout and was corrected to use `lib/supabase/queries.ts`. This was the main model-source inconsistency found in the audit.

## D. Price Audit

The current official OTR Palembang fallback values are:

- J5 EV — Rp354.900.000
- J7 SHS — Rp534.900.000
- J8 Ardis SHS — Rp865.000.000

Runtime public model pricing is sourced from `model_variants.price_idr` / `price_display` through the Supabase model query.

The static `MODEL_PRICES` / `lib/data/models.ts` values remain only as the reliability fallback.

Other occurrences found are:
- Supabase seed data — expected database seed values.
- Migration comments — documentation/examples.
- README — documentation.
- SEO fallback copy in static model data — fallback content.

No second runtime price constant was introduced.

## E. Model Images Audit

All cinematic model detail slots are represented by the existing `MODEL_MEDIA_SLOTS` architecture:

- exterior
- exterior_mobile
- design_detail_main
- design_detail_wheel
- design_detail_rear
- profile
- interior
- interior_mobile
- cockpit_main
- cockpit_detail
- performance
- technology
- adas
- specs_visual
- final_cta

Resolution path:

```text
content_media
    ↓
media_assets
    ↓
getContentMedia()
    ↓
ModelData.image_slots
    ↓
CmsModelImage / section components
```

No primary runtime `/images/...` model-content source remains.

`/images/placeholder.jpg` in `ResponsiveImage.tsx` is intentionally retained as a generic safety fallback, not a content source.

## F. Color Audit

`model_colors` is already the structured color source.

Each color has:
- `color_key`
- `name`
- `hex`
- `sort_order`
- `media_asset_id`

Image resolution uses `media_asset_id` first. A legacy HTTPS `image_path` can still be consumed as compatibility fallback. Local `/images/...` paths are not promoted to the primary public source.

No new color schema was created.

## G. Homepage Audit

### Hero
- Text: currently page composition/static copy.
- Image: `content_media` → home/hero.
- Primary image: Supabase.
- Fallback: existing HeroPlaceholder gradient.
- CMS: image-ready; copy requires future approved content/settings schema.

### Model Slider
- Data: `getModels()`.
- Image: model hero media.
- Primary: Supabase.
- Fallback: static model data.
- Order: `models.sort_order`.
- CMS: Yes.

### Experience
- Text: component composition.
- Image: `content_media` → home/experience.
- Fallback: existing visual fallback.
- CMS: image-ready; copy requires future content schema.

### Technology
- Text: component composition.
- Image: `content_media` → home/technology.
- CMS: image-ready; copy requires future content schema.

### Promo
- Content: existing `PROMOS` static data.
- Image: `content_media` → promo/cover.
- CMS: image-ready; content management requires an approved promo schema.

### About
- Content: existing component copy.
- Image: `content_media` → home/about.
- CMS: image-ready; copy requires future content schema.

### Journal
- Content: existing `NEWS` static data.
- Image: `content_media` → news/cover.
- CMS: image-ready; article management requires an approved article schema.

### Dealer Location
- Text/contact identity: `SITE_SETTINGS`.
- Background image: `content_media` → home/dealer_location.
- Fallback: gradient.
- Semantic `<address>` remains.
- No Maps iframe/button was introduced.
- CMS: image-ready; text currently centralized in config pending site-settings schema decision.

### Final CTA
- Text: component composition.
- Image: `content_media` → home/final_cta.
- CTA URL: centralized WhatsApp utility.
- CMS: image-ready; copy requires future content schema.

## H. Homepage / Model Ordering

The previous slug-based ordering maps were removed from the public model listing/slider data flow.

Current target:

```text
models.sort_order
      ↓
getModels()
      ↓
ModelData.sort_order
      ↓
Model Listing / HomeModelSlider
```

The visual per-model layout configuration remains separate because it controls presentation position, not model identity/order.

## I. Routing Audit

Canonical public model slugs remain:

- `/model/jaecoo-j5-ev`
- `/model/jaecoo-j7-shs`
- `/model/jaecoo-j8-shs`

No legacy alias route was found that requires a redirect implementation in this task.

`/model/[slug]/layout.tsx` and `sitemap.ts` now use the Supabase-backed model query path, including its static fallback.

## J. Global Site Settings

No existing `site_settings` database table was present.

Instead of creating a speculative schema, global public configuration was centralized in:

`lib/data/site.ts`

Current centralized values include:
- brand name
- dealer name
- sales name
- WhatsApp number
- Instagram
- TikTok
- Facebook
- dealer address

This is an interim data/config layer. A future Admin Content Management step can move these values to Supabase after the site-settings schema is explicitly agreed.

## K. Logo Audit

Current architecture:

```text
content_media: global / site / logo*
                    ↓
          getSiteBrandAssets()
                    ↓
              public layout
                ↙       ↘
             Header     Footer
```

Header and Footer receive the same resolved `SiteBrandAssets` object.

Local/text fallback remains safe because the supplied project archive contains no actual local logo binary.

No Header/Footer visual redesign was performed.

## L. Journal / Promo Content

There are currently no Supabase tables for `news` or `promo` in the supplied schema/migrations.

Therefore:
- their image architecture is CMS-ready through `content_media`;
- their text/content remains static in `lib/data/news.ts` and `lib/data/promos.ts`;
- no speculative database migration was created.

Recommended future schema discussion is required before building Content Management UI.

## M. SEO Audit

Current SEO sources are distributed between:
- `app/layout.tsx` for global metadata
- page-level `metadata` exports
- `generateMetadata()` for dynamic model/article/promo pages
- `lib/utils/seo.ts` for canonical/site constants
- `app/robots.ts`
- `app/sitemap.ts`

The audit did not redesign SEO metadata.

`app/layout.tsx` now reuses `SITE_NAME`, `SITE_URL`, and `SITE_DESCRIPTION` from the existing SEO utility instead of duplicating those core values.

OG/Twitter image remains the existing `/og-default.jpg`. It is treated as a static metadata asset and was not moved into the content-media system because doing so would require a deliberate metadata architecture change.

Favicon source was not present as a separate public binary in the supplied archive; no risky metadata change was made.

## N. Remaining Hardcoded Data

Intentionally retained:

1. **Static model fallback**
   - `lib/data/models.ts`
   - Purpose: reliability when Supabase is empty/unavailable.

2. **Static promo/news fallback content**
   - `lib/data/promos.ts`
   - `lib/data/news.ts`
   - Purpose: current existing content system until a real content schema is approved.

3. **Homepage/editorial copy**
   - Existing page/component JSX strings.
   - Purpose: current presentation content; moving these into a database requires a content schema decision.

4. **Global metadata defaults**
   - Existing page-level SEO strings.
   - Purpose: static defaults and route-specific metadata.

5. **OG image**
   - `/og-default.jpg`
   - Purpose: existing metadata asset.

6. **Generic placeholder**
   - `/images/placeholder.jpg`
   - Purpose: safety fallback only, not content primary.

7. **Presentation-only model labels/layout**
   - Per-slug visual positioning and display-label choices.
   - Purpose: preserves the approved cinematic composition; not a second model data source.

## O. Supabase Changes

**No database/schema changes were made in this audit.**

Existing `content_media` / `media_assets` architecture from Step 8.3/8.4A is reused.

### Schema decisions still required before Content Management

**Required:** `site_settings` schema  
**Reason:** dealer/contact/social/global copy should eventually be editable from CMS.  
**Current schema:** not present.  
**Recommended:** approve a minimal site-settings structure before implementation.

**Required:** promo content schema  
**Reason:** promo text, dates, CTA and publishing need database ownership.  
**Current schema:** not present.  
**Recommended:** define only the fields required by the existing `PromoData` contract.

**Required:** news/article schema  
**Reason:** title, slug, excerpt, body, category, publishing and SEO need database ownership.  
**Current schema:** not present.  
**Recommended:** define only the fields required by `NewsData` and the existing publishing workflow.

No migration was created because these schema choices should be agreed before Admin UI work.

## P. Admin Changes

**No Admin changes.**

No Admin page, CMS UI, upload form, media manager, image picker, dashboard, navigation, auth, permission, or styling was modified.

## Q. Files Changed

### Runtime/data-flow changes
- `lib/types/model.ts`
- `lib/supabase/queries.ts`
- `app/(public)/model/[slug]/layout.tsx`
- `app/(public)/model/page.tsx`
- `components/sections/HomeModelSlider.tsx`
- `lib/data/site.ts` — new centralized interim site configuration
- `components/layout/Footer.tsx`
- `components/layout/MobileMenuToggle.tsx`
- `components/sections/HomeDealerLocation.tsx`
- `lib/utils/whatsapp.ts`
- `app/layout.tsx`
- `app/sitemap.ts`

### Database
- None.

### Admin
- None.

## R. Build / Typecheck

Production build was attempted:

```text
npm run build
```

Result:

```text
sh: 1: next: not found
```

The supplied archive does not contain `node_modules`, so the Next.js build binary is unavailable in this environment.

This is an environment/dependency limitation, not a claim that the application build is successful.

## S. Final Verdict

### Ready
- Model source hierarchy
- Model listing/detail consistency
- Model ordering
- Model media architecture
- Color media architecture
- Header/Footer shared logo source
- Homepage media assignments
- Dealer background media
- WhatsApp centralization
- Core SEO constants
- Sitemap model source
- Safe Supabase/static fallback pattern

### Pending by design
- Admin Image & Media Management
- Admin Content Management
- Site Settings database schema
- Promo database schema
- News/Article database schema
- CMS editing of editorial copy

These are deliberately not implemented in this task.

## T. Next Recommended Step

**Step 8.6 — Admin Image & Media Management**

The frontend/data layer is now sufficiently prepared for that stage without requiring a parallel Admin redesign.
