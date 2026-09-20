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
import { Button } from "@/components/ui/Button";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { HomeModelSlider } from "@/components/sections/HomeModelSlider";
import { HomeDealerLocation } from "@/components/sections/HomeDealerLocation";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import {
  HomeExperienceSection,
  HomeTeknologiSection,
  HomePromoSection,
  HomeJournalSection,
  HomeAboutSection,
  HomeFinalCTA,
} from "@/components/sections/HomeExperience";
import styles from "./page.module.css";

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

  const heroUrl = buildWhatsAppUrl({
    source: "homepage_hero",
    model: "J5 EV",
    source_cta: "hero_cta",
  });

  return (
    <>
      <TransparentHeader />

      {/* ── HERO ────────────────────────────────────── */}
      <section className={styles.heroWrap}>
        <HeroPlaceholder
          tagline={cms.hero.eyebrow || "DEALER RESMI JAECOO PALEMBANG"}
          heading={
            <>
              <span className={styles.heroModel}>{cms.hero.headline || "J5"}</span>
            </>
          }
          subheading={cms.hero.description || "THIS IS THE REAL SUV."}
          cta={
            <div className={styles.heroCtas}>
              <Button as="link" href={cms.hero.ctaUrl || "/model/jaecoo-j5-ev"} variant="primary" size="lg">
                {cms.hero.ctaText || "Jelajahi J5"}
              </Button>
              <Button
                as="a"
                href={heroUrl}
                variant="secondary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat dengan Alvan →
              </Button>
            </div>
          }
          backgroundImage={homeMedia[contentMediaKey("home", "home", "hero")]?.desktop}
          backgroundImageMobile={homeMedia[contentMediaKey("home", "home", "hero")]?.mobile}
        />
      </section>

      {/* ── MODEL SHOWCASE (J5 → J7 → J8) ──────────── */}
      <HomeModelSlider models={models} />

      {/* ── EXPERIENCE ──────────────────────────────── */}
      <HomeExperienceSection
        image={homeMedia[contentMediaKey("home", "home", "experience")]}
        cms={cms.experience}
      />

      {/* ── TECHNOLOGY ──────────────────────────────── */}
      <HomeTeknologiSection
        image={homeMedia[contentMediaKey("home", "home", "technology")]}
        cms={cms.technology}
      />

      {/* ── PROMO ───────────────────────────────────── */}
      <HomePromoSection promos={promos} />

      {/* ── ABOUT ───────────────────────────────────── */}
      <HomeAboutSection
        image={homeMedia[contentMediaKey("home", "home", "about")]}
        cms={cms.about}
      />

      {/* ── JOURNAL ─────────────────────────────────── */}
      <HomeJournalSection news={news} />

      {/* ── FINAL CTA ───────────────────────────────── */}
      <HomeFinalCTA
        image={homeMedia[contentMediaKey("home", "home", "final_cta")]}
        cms={cms.final_cta}
      />

      {/* ── DEALER LOCATION ─────────────────────────── */}
      <HomeDealerLocation
        backgroundImage={homeMedia[contentMediaKey("home", "home", "dealer_location")]}
        cms={cms.dealer_location}
      />
    </>
  );
}
