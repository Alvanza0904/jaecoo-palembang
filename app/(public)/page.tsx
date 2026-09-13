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
  HomeTechnologySection,
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

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className={styles.heroWrap}>
        <HeroPlaceholder
          tagline={cms.hero.eyebrow || "JAECOO PALEMBANG"}
          heading={
            <>
              <span className={styles.heroKicker}>JAECOO</span>
              <span className={styles.heroModel}>J5</span>
              <span className={styles.heroElectric}>ELECTRIC SUV</span>
            </>
          }
          subheading={cms.hero.description || "THIS IS THE REAL SUV."}
          cta={
            <div className={styles.heroCtas}>
              <Button as="link" href="/model/jaecoo-j5-ev" variant="primary" size="lg">
                EXPLORE J5
              </Button>
              <Button as="a" href={heroUrl} variant="secondary" size="lg" target="_blank" rel="noopener noreferrer">
                TALK TO ALVAN →
              </Button>
            </div>
          }
          backgroundImage={homeMedia[contentMediaKey("home", "home", "hero")]?.desktop}
          backgroundImageMobile={homeMedia[contentMediaKey("home", "home", "hero")]?.mobile}
          accent="default"
        />
      </section>

      {/* ── MODEL SHOWCASE SLIDER (J5 → J7 → J8) ────────────────── */}
      <HomeModelSlider models={models} />

      {/* ── EXPERIENCE ───────────────────────────────────────────── */}
      <HomeExperienceSection
        image={homeMedia[contentMediaKey("home", "home", "experience")]}
        cms={cms.experience}
      />

      {/* ── TECHNOLOGY ───────────────────────────────────────────── */}
      <HomeTechnologySection
        image={homeMedia[contentMediaKey("home", "home", "technology")]}
        cms={cms.technology}
      />

      {/* ── PROMO ────────────────────────────────────────────────── */}
      <HomePromoSection promos={promos} />

      {/* ── ABOUT ────────────────────────────────────────────────── */}
      <HomeAboutSection
        image={homeMedia[contentMediaKey("home", "home", "about")]}
        cms={cms.about}
      />

      {/* ── JOURNAL ──────────────────────────────────────────────── */}
      <HomeJournalSection news={news} />

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <HomeFinalCTA
        image={homeMedia[contentMediaKey("home", "home", "final_cta")]}
        cms={cms.final_cta}
      />

      {/* ── DEALER LOCATION (Local SEO) ──────────────────────────── */}
      <HomeDealerLocation backgroundImage={homeMedia[contentMediaKey("home", "home", "dealer_location")]} />
    </>
  );
}
