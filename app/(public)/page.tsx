/**
 * JAECOO Palembang — Homepage
 * Route: /
 * Premium automotive editorial experience.
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

  return (
    <>
      <TransparentHeader />

      {/* ── HERO ────────────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="hero"
        mode="live"
        data={{
          desktop_image: homeMedia[contentMediaKey("home", "home", "hero")]?.desktop,
          mobile_image: homeMedia[contentMediaKey("home", "home", "hero")]?.mobile,
          eyebrow: cms.hero.eyebrow,
          headline: cms.hero.headline,
          description: cms.hero.description,
          ctaText: cms.hero.ctaText,
          ctaUrl: cms.hero.ctaUrl,
        }}
      />

      {/* ── MODEL SHOWCASE (J5 → J7 → J8) ──────────── */}
      <HomeModelSlider models={models} />

      {/* ── EXPERIENCE ──────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="experience"
        mode="live"
        data={{
          desktop_image: homeMedia[contentMediaKey("home", "home", "experience")]?.desktop,
          mobile_image: homeMedia[contentMediaKey("home", "home", "experience")]?.mobile,
          title: cms.experience.title,
          description: cms.experience.description,
        }}
      />

      {/* ── TECHNOLOGY ──────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="technology"
        mode="live"
        data={{
          desktop_image: homeMedia[contentMediaKey("home", "home", "technology")]?.desktop,
          mobile_image: homeMedia[contentMediaKey("home", "home", "technology")]?.mobile,
          title: cms.technology.title,
          description: cms.technology.description,
        }}
      />

      {/* ── PROMO ───────────────────────────────────── */}
      <HomePromoSection promos={promos} />

      {/* ── ABOUT ───────────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="about"
        mode="live"
        data={{
          desktop_image: homeMedia[contentMediaKey("home", "home", "about")]?.desktop,
          mobile_image: homeMedia[contentMediaKey("home", "home", "about")]?.mobile,
          title: cms.about.title,
          description: cms.about.description,
        }}
      />

      {/* ── JOURNAL ─────────────────────────────────── */}
      <HomeJournalSection news={news} />

      {/* ── FINAL CTA ───────────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="final_cta"
        mode="live"
        data={{
          desktop_image: homeMedia[contentMediaKey("home", "home", "final_cta")]?.desktop,
          mobile_image: homeMedia[contentMediaKey("home", "home", "final_cta")]?.mobile,
          title: cms.final_cta.title,
          description: cms.final_cta.description,
          ctaText: cms.final_cta.ctaText,
          ctaUrl: cms.final_cta.ctaUrl,
        }}
      />

      {/* ── DEALER LOCATION ─────────────────────────── */}
      <HomepageSectionRenderer
        sectionId="dealer_location"
        mode="live"
        data={{
          desktop_image: homeMedia[contentMediaKey("home", "home", "dealer_location")]?.desktop,
          mobile_image: homeMedia[contentMediaKey("home", "home", "dealer_location")]?.mobile,
          title: cms.dealer_location.title,
          description: cms.dealer_location.description,
          address: cms.dealer_location.address,
        }}
      />
    </>
  );
}
