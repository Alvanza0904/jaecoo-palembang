# STEP 8.6 — Source of Truth Audit (2026-09-10)

| Section | Current Source | Target/Admin Source | Supabase Existing? | Schema Baru? |
|---|---|---|---|---|
| Hero | `app/(public)/page.tsx` hardcoded text + `getHomeMedia()` for image | Existing frontend source + `content_media` for image | Yes, `content_media`/`media_assets` | No |
| Model Slider | `getModels()` → `models.sort_order` | `models.sort_order` | Yes | No |
| Experience | `HomeExperience.tsx` hardcoded text + `getHomeMedia()` image | Existing source + `content_media` image | Yes for image | No |
| Technology | `HomeExperience.tsx` hardcoded text + `getHomeMedia()` image | Existing source + `content_media` image | Yes for image | No |
| Promo | `lib/data/promos.ts` + `getEntityMedia('promo', promo.id, 'cover')` | Same promo source + shared media assignment | Yes for image | No |
| About | `HomeExperience.tsx` hardcoded text + `getHomeMedia()` image | Existing source + `content_media` image | Yes for image | No |
| Journal | `lib/data/news.ts` + `getEntityMedia('news', news.id, 'cover')` | Same news source + shared media assignment | Yes for image | No |
| Dealer Location | `lib/data/site.ts` for identity/address + `getHomeMedia()` image | Same site source + `content_media` image | Yes for image | No |
| Final CTA | `HomeExperience.tsx` hardcoded text/CTA + `getHomeMedia()` image | Existing source + `content_media` image | Yes for image | No |
| Logo | `getSiteBrandAssets()` → `content_media` → `media_assets` | Same | Yes | No |
| Models | `models` + `model_variants` + `model_colors` + `model_content` | Same | Yes | No |
| Model Colors | `model_colors.media_asset_id`, `sort_order` | Same | Yes | No |
| Prices | `model_variants.price_idr`, `price_display` | Same | Yes | No |

## Important audit findings

1. There is **no persistent homepage text/content table** in the supplied repository. Creating one in Step 8.6 would violate the no-duplicate-source rule, so homepage copy remains explicitly marked as a Step 8.7 dependency.
2. `lib/data/site.ts` is still the consolidated source for dealer/global contact data. No duplicate dealer fields were introduced.
3. `content_media` is the only assignment layer; `media_assets` remains the only media registry and `jaecoo-media` remains the only Storage bucket.
4. `media_assets` currently has `alt_text` and focal-point fields, but **no description column**. Step 8.6 does not invent a second metadata store; image description remains a schema dependency.
5. Favicon and OG image are intentionally left on the existing Next.js metadata implementation per the existing Step 8.4 audit.
6. Existing admin authentication is session-based, but the supplied repository does not contain an enforceable admin-role table/claim policy. Step 8.6 therefore preserves the existing authenticated-admin foundation rather than guessing an allowlist or breaking existing accounts. A strict role/RLS hardening step remains recommended.

## Implemented CMS boundary

Admin image editing follows:

`Admin UI → /api/admin/content-media → content_media → media_assets → Supabase Storage → existing data layer → frontend`

No second homepage/model/media/article system was introduced.
