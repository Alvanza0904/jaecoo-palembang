/**
 * JAECOO Palembang — Homepage
 * Route: /
 *
 * FIX 2026-09-21: Visual Editor → Live Website data flow
 *
 * SEBELUM (BROKEN):
 *   homeMedia[key]?.desktop  ← hanya URL string, presentation_settings hilang
 *   homeMedia[key]?.mobile   ← hanya URL string
 *   → HomepageSectionRenderer tidak punya presentation_settings
 *   → Hero: fallback ke HeroPlaceholder (no LayeredHero, no custom layout)
 *   → Sections: object-position hardcoded CSS, bukan dari Visual Editor
 *
 * SESUDAH (FIXED):
 *   homeMedia[key]  ← full ResponsiveImage dengan presentation_settings, focal_x/y, cutout
 *   → HomepageSectionRenderer.image = full object
 *   → resolveImage() langsung pakai object lengkap (tidak membangun ulang dari URL)
 *   → resolveHeroMedia() membaca presentation_settings → LayeredHero dengan layout benar
 *   → Semua section membaca presentation_settings → visualMediaStyle() + visualTypographyStyles()
 *
 * DATA FLOW LENGKAP:
 *   Visual Editor → save → Supabase (media_assets.presentation_settings)
 *     → getHomeMedia() → ResponsiveImage (dengan presentation_settings)
 *     → page.tsx passes as `image` prop
 *     → HomepageSectionRenderer → resolveImage() → HomeExperienceSection / LayeredHero
 *     → presentation.ts helpers → CSS styles applied
 */

import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/queries";
import { getHomeMedia, contentMediaKey } from "@/lib/supabase/media";
import { getActivePromos } from "@/lib/data/promos";
import { getPublishedNews } from "@/lib/data/news";
import { getHomepageContent } from "@/lib/data/homepage-content";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { HomeModelSlider } from "@/components/sections/HomeModelSlider";
import { HomePromoSection, HomeJournalSection } from "@/components/sections/HomeExperience";
import { HomepageSectionRenderer } from "@/components/sections/HomepageSectionRenderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "JAECOO Palembang — Dealer Resmi JAECOO",
  description:
    "Jelajahi JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS di Palembang. Konsultasi, test drive, simulasi kredit, promo dan informasi terbaru bersama Alvan — Dealer Resmi Omoda Jaecoo Palembang.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "JAECOO Palembang — Dealer Resmi JAECOO",
    description: "JAECOO J5 EV, J7 SHS, J8 Ardis SHS di Palembang. Test drive & promo eksklusif bersama Alvan.",
    url: "https://jaecoopalembang.web.id/",
    siteName: "JAECOO Palembang",
    locale: "id_ID",
    type: "website",
  },
};

export default async function HomePage() {
  const [models, promos, news, homeMedia, cms] = await Promise.all([
    getModels(),
    getActivePromos(),
    getPublishedNews(4),
    getHomeMedia(),
    getHomepageContent(),
  ]);

  // Helper — ambil full ResponsiveImage (membawa presentation_settings, focal_x/y, cutout)
  // KRITIS: jangan extract hanya .desktop atau .mobile — itu membuang presentation_settings
  const media = (slot: string) => homeMedia[contentMediaKey("home", "home", slot)]

  return (
    <>
      <TransparentHeader />

      {/* ── HERO ────────────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="hero"
        mode="live"
        data={{
          // image = full ResponsiveImage: membawa presentation_settings, focal, cutout
          image: media("hero"),
          // Legacy URL fields sebagai fallback (jika image undefined)
          desktop_image: media("hero")?.desktop,
          mobile_image:  media("hero")?.mobile,
          eyebrow:     cms.hero.eyebrow,
          headline:    cms.hero.headline,
          description: cms.hero.description,
          ctaText:     cms.hero.ctaText,
          ctaUrl:      cms.hero.ctaUrl,
        }}
      />

      {/* ── MODEL SHOWCASE (J5 → J7 → J8) ──────────── */}
      <HomeModelSlider models={models} />

      {/* ── EXPERIENCE ──────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="experience"
        mode="live"
        data={{
          image:         media("experience"),
          desktop_image: media("experience")?.desktop,
          mobile_image:  media("experience")?.mobile,
          title:         cms.experience.title,
          description:   cms.experience.description,
        }}
      />

      {/* ── TECHNOLOGY ──────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="technology"
        mode="live"
        data={{
          image:         media("technology"),
          desktop_image: media("technology")?.desktop,
          mobile_image:  media("technology")?.mobile,
          title:         cms.technology.title,
          description:   cms.technology.description,
        }}
      />

      {/* ── PROMO ───────────────────────────────────── */}
      <HomePromoSection promos={promos} />

      {/* ── ABOUT ───────────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="about"
        mode="live"
        data={{
          image:         media("about"),
          desktop_image: media("about")?.desktop,
          mobile_image:  media("about")?.mobile,
          title:         cms.about.title,
          description:   cms.about.description,
        }}
      />

      {/* ── JOURNAL ─────────────────────────────────── */}
      <HomeJournalSection news={news} />

      {/* ── FINAL CTA ───────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="final_cta"
        mode="live"
        data={{
          image:         media("final_cta"),
          desktop_image: media("final_cta")?.desktop,
          mobile_image:  media("final_cta")?.mobile,
          title:         cms.final_cta.title,
          description:   cms.final_cta.description,
          ctaText:       cms.final_cta.ctaText,
          ctaUrl:        cms.final_cta.ctaUrl,
        }}
      />

      {/* ── DEALER LOCATION ─────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="dealer_location"
        mode="live"
        data={{
          image:         media("dealer_location"),
          desktop_image: media("dealer_location")?.desktop,
          mobile_image:  media("dealer_location")?.mobile,
          title:         cms.dealer_location.title,
          description:   cms.dealer_location.description,
          address:       cms.dealer_location.address,
        }}
      />
    </>
  );
}
