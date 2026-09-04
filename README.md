# JAECOO Palembang

Website resmi dealer JAECOO Palembang — premium, cinematic, mobile-first.

**Live:** [jaecoopalembang.web.id](https://jaecoopalembang.web.id)

---

## Tech Stack

| Layer       | Technology                  |
|-------------|-----------------------------|
| Framework   | Next.js 15 (App Router)     |
| Language    | TypeScript                  |
| Styling     | CSS Modules + Design Tokens |
| Font        | Manrope (Google Fonts)      |
| Hosting     | Vercel (planned)            |
| Database    | Supabase (planned)          |
| Auth        | Supabase Auth (planned)     |
| AI          | Claude API via server route (planned) |

---

## Folder Structure

```
jaecoo-palembang/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (Header + Footer + Manrope)
│   ├── page.tsx            # Homepage
│   ├── model/[slug]/       # Model pages (overview, technology, specs)
│   ├── promo/              # Promo listing + detail
│   ├── berita/             # News listing + detail
│   ├── gallery/            # Gallery
│   ├── sales-jaecoo-palembang/  # Sales Alvan page
│   ├── admin/              # CMS (noindex, auth coming)
│   ├── sitemap.ts          # Auto-generated sitemap
│   └── robots.ts           # Robots.txt
│
├── components/
│   ├── layout/             # Header, Footer, MobileMenuToggle
│   ├── ui/                 # Button, Container, SectionHeading, Divider
│   ├── model/              # ModelNavigation (+ more coming)
│   ├── media/              # ResponsiveImage (+ more coming)
│   ├── motion/             # Reveal, Stagger
│   └── finance/            # FinanceCalculator (scaffold)
│
├── lib/
│   ├── data/               # Mock data (models, promos, news)
│   ├── types/              # TypeScript interfaces
│   └── utils/              # whatsapp, format, seo helpers
│
├── styles/
│   ├── tokens.css          # Design tokens (colors, type, spacing, motion)
│   └── globals.css         # Reset + global styles
│
└── public/
    └── images/             # Static assets placeholder
```

---

## Models

| Model             | Slug           | Harga OTR Palembang |
|-------------------|----------------|---------------------|
| JAECOO J5 EV      | `j5-ev`        | Rp354.900.000       |
| JAECOO J7 SHS     | `j7-shs`       | Rp534.900.000       |
| JAECOO J8 Ardis SHS | `j8-ardis-shs` | Rp865.000.000     |

> J7 SIVP diperlakukan sebagai **variant** dari J7 SHS, bukan halaman terpisah.

---

## Design System

- **Background:** off-white `#f5f4f2`
- **CTA:** charcoal `#111111` / white text
- **Gold:** accent only — `#c8a96e`
- **Font:** Manrope 400/500/600/700

---

## WhatsApp

Semua WhatsApp URL di-generate melalui `lib/utils/whatsapp.ts`.
Nomor tidak pernah ditulis langsung di komponen.

**Sales Alvan:** 0851-8314-5926

---

## Phase Status

| Phase | Status |
|-------|--------|
| Phase 1 — Foundation | ✅ Done |
| Phase 2 — Homepage Visual | ⏳ Pending |
| Phase 3 — Model Pages Visual | ⏳ Pending |
| Phase 4 — Promo & News | ⏳ Pending |
| Phase 5 — Calculator | ⏳ Pending |
| Phase 6 — Gallery | ⏳ Pending |
| Phase 7 — CMS Admin | ⏳ Pending |
| Phase 8 — Supabase Integration | ⏳ Pending |
| Phase 9 — AI Content Assistant | ⏳ Pending |

---

## Development

> Project ini dikerjakan dari iPhone via GitHub + Vercel.
> Tidak memerlukan local Node.js / terminal.

Push ke `main` → auto-deploy via Vercel.

---

## Commit ke GitHub

```bash
git init
git add .
git commit -m "Phase 1 — Next.js Foundation"
git remote add origin https://github.com/[username]/jaecoo-palembang.git
git push -u origin main
```
