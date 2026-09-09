import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/queries";
import { getActivePromos } from "@/lib/data/promos";
import { getPublishedNews } from "@/lib/data/news";
import { Button } from "@/components/ui/Button";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import {
  HomeRange,
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
    "Jelajahi JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS di Palembang. Konsultasi, test drive, simulasi kredit, promo dan informasi terbaru bersama Alvan.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const models = await getModels();
  const promos = getActivePromos();
  const news = getPublishedNews(4);

  const heroUrl = buildWhatsAppUrl({
    source: "homepage_hero",
    model: "J5 EV",
    source_cta: "hero_cta",
  });

  return (
    <>
      <TransparentHeader />

      <section className={styles.heroWrap}>
        <HeroPlaceholder
          tagline="JAECOO PALEMBANG"
          heading={
            <>
              <span className={styles.heroKicker}>JAECOO</span>
              <span className={styles.heroModel}>J5</span>
              <span className={styles.heroElectric}>ELECTRIC SUV</span>
            </>
          }
          subheading="THIS IS THE REAL SUV."
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
          accent="default"
        />
      </section>

      <HomeRange models={models} />
      <HomeExperienceSection />
      <HomeTechnologySection />
      <HomePromoSection promos={promos} />
      <HomeAboutSection />
      <HomeJournalSection news={news} />
      <HomeFinalCTA />
    </>
  );
}
