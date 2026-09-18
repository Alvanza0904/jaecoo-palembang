# JAECOO Palembang

Website resmi dealer OMODA JAECOO Palembang.

**Domain:** https://jaecoopalembang.web.id  
**Stack:** Next.js 15 + Supabase + CSS Modules

---

## Quick Start

```bash
npm install
cp .env.local.example .env.local  # fill in your values
npm run dev
```

## Deploy

```bash
npm run lint
npm run build
git add -A
git commit -m "chore: production release"
git push
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Base Supabase URL (no `/rest/v1/` suffix) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Same as anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin only, never expose) |

## Routes

### Public
| Route | Page |
|---|---|
| `/` | Homepage |
| `/model/jaecoo-j5-ev` | JAECOO J5 EV |
| `/model/jaecoo-j7-shs` | JAECOO J7 SHS |
| `/model/jaecoo-j8-shs` | JAECOO J8 ARDIS SHS |
| `/model/[slug]/technology` | Technology page |
| `/model/[slug]/specifications` | Specifications |
| `/berita` | News listing |
| `/berita/[slug]` | Article detail |
| `/promo` | Promotions |
| `/promo/[slug]` | Promo detail |
| `/gallery` | Gallery |
| `/sales-jaecoo-palembang` | Sales Alvan |
| `/privacy-policy` | Privacy Policy |
| `/terms` | Terms |

### Admin
| Route | Page |
|---|---|
| `/admin/login` | Login |
| `/admin` | Dashboard |
| `/admin/homepage` | Homepage editor |
| `/admin/homepage-content` | Content editor |
| `/admin/models` | Model management |
| `/admin/news` | News management |
| `/admin/promo` | Promo management |
| `/admin/media` | Media library |
| `/admin/gallery` | Gallery management |
| `/admin/brand-assets` | Logo & brand |
| `/admin/settings` | Settings |
| `/admin/leads` | Leads |

## Key Changes (Handover Notes)

1. **CRITICAL BUG FIXED**: `NEXT_PUBLIC_SUPABASE_URL` had `/rest/v1/` appended — now corrected to base URL only
2. **Root layout conflict fixed**: `app/page.tsx` and `app/sales/` (outdated duplicates) removed; all routes live in `app/(public)/`
3. **Dead files removed**: `PremiumHeader.tsx`, `PremiumFooter.tsx` (not used, had broken links)
4. **Design system unified**: Single `styles/tokens.css` → `styles/globals.css` flow
5. **@imgly/background-removal removed** from package.json (was blocking `npm install`; still works via dynamic import if installed separately)
6. **Footer links fixed**: `/privacy` → `/privacy-policy`, `/terms` → `/terms` (correct)

## Contact

Sales: **Alvan** — WhatsApp: 0851-8314-5926  
Dealer: Komp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506–509, Palembang
