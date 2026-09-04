/**
 * JAECOO Palembang — Homepage
 *
 * Phase 1: Section architecture placeholder.
 * Each section will be built out individually in later phases.
 */

import type { Metadata } from "next";
import { getModels } from "@/lib/data/models";
import { getActivePromos } from "@/lib/data/promos";
import { getPublishedNews } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "JAECOO Palembang — Dealer Resmi JAECOO",
  description:
    "Dealer resmi JAECOO di Palembang. Temukan JAECOO J5 EV, J7 SHS, dan J8 Ardis SHS. Hubungi Sales JAECOO Palembang untuk test drive dan penawaran terbaik.",
};

export default function HomePage() {
  const models = getModels();
  const promos = getActivePromos();
  const news = getPublishedNews(3);

  const heroWhatsApp = buildWhatsAppUrl({
    source: "homepage_hero",
    model: "J5 EV",
    source_cta: "hero_cta",
  });

  return (
    <>
      {/* ─── 1. HERO ──────────────────────────────────────────── */}
      <section className={styles.hero} aria-label="Hero JAECOO J5 EV">
        <div className={styles.heroBg} aria-hidden="true">
          {/* Placeholder — akan diganti dengan layered hero component */}
          <div className={styles.heroBgFill} />
        </div>
        <Container>
          <div className={styles.heroContent}>
            <Reveal variant="fade" delay={100}>
              <p className={styles.heroEyebrow}>Dealer Resmi Palembang</p>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className={styles.heroHeading}>
                <span className={styles.heroModel}>JAECOO</span>
                <span className={styles.heroModelName}>J5 EV</span>
              </h1>
            </Reveal>
            <Reveal variant="fade-up" delay={350}>
              <p className={styles.heroTagline}>Electric. Intelligent. Ready.</p>
            </Reveal>
            <Reveal variant="fade-up" delay={500}>
              <div className={styles.heroCtas}>
                <Button as="link" href="/model/j5-ev" variant="primary" size="lg">
                  Jelajahi J5 EV
                </Button>
                <Button as="a" href={heroWhatsApp} variant="secondary" size="lg" target="_blank" rel="noopener noreferrer">
                  Hubungi Sales
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ─── 2. JAECOO RANGE ──────────────────────────────────── */}
      <section className={styles.section} aria-label="Lineup JAECOO">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Lineup"
              heading="The JAECOO Range"
              subheading="Tiga model. Satu filosofi — performa, teknologi, dan desain yang tidak berkompromi."
            />
          </Reveal>
          <div className={styles.modelGrid}>
            <Stagger delay={150} staggerMs={120}>
              {models.map((model) => (
                <article key={model.slug} className={styles.modelCard}>
                  {/* Placeholder — akan diganti ModelCard component */}
                  <div className={styles.modelCardImg} aria-hidden="true" />
                  <div className={styles.modelCardBody}>
                    <p className={styles.modelCardName}>{model.name}</p>
                    <p className={styles.modelCardPrice}>
                      {model.default_variant.price_display}
                      <span className={styles.modelCardRegion}> {model.default_variant.price_region}</span>
                    </p>
                    <Button as="link" href={`/model/${model.slug}`} variant="secondary" size="sm">
                      Lihat Detail
                    </Button>
                  </div>
                </article>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* ─── 3. TECHNOLOGY TEASER ─────────────────────────────── */}
      <section className={[styles.section, styles.sectionDark].join(" ")} aria-label="Teknologi JAECOO">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Technology"
              heading="Intelligence in Motion"
              subheading="Setiap JAECOO dirancang dengan teknologi yang beradaptasi terhadap Anda — bukan sebaliknya."
              align="center"
              size="large"
            />
          </Reveal>
        </Container>
      </section>

      {/* ─── 4. PROMO ─────────────────────────────────────────── */}
      {promos.length > 0 && (
        <section className={styles.section} aria-label="Promo JAECOO Palembang">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="Penawaran" heading="Promo Terkini" />
            </Reveal>
            {/* PromoCard components akan ditambahkan di fase berikutnya */}
            <p className={styles.placeholder}>{promos.length} promo aktif tersedia.</p>
          </Container>
        </section>
      )}

      {/* ─── 5. JAECOO JOURNAL ────────────────────────────────── */}
      {news.length > 0 && (
        <section className={styles.section} aria-label="JAECOO Journal">
          <Container>
            <Reveal>
              <SectionHeading eyebrow="Journal" heading="Berita Terbaru" />
            </Reveal>
            {/* NewsCard components akan ditambahkan di fase berikutnya */}
            <p className={styles.placeholder}>{news.length} artikel tersedia.</p>
          </Container>
        </section>
      )}

      {/* ─── 6. GLOBAL CTA ────────────────────────────────────── */}
      <section className={[styles.section, styles.sectionCta].join(" ")} aria-label="Hubungi Sales">
        <Container size="narrow">
          <Reveal variant="scale">
            <div className={styles.ctaBlock}>
              <p className={styles.ctaEyebrow}>Siap Memulai?</p>
              <h2 className={styles.ctaHeading}>Bicara langsung dengan Sales kami.</h2>
              <p className={styles.ctaBody}>
                Konsultasi gratis, test drive, simulasi kredit — semua bisa diatur via WhatsApp.
              </p>
              <Button
                as="a"
                href={buildWhatsAppUrl({ source: "homepage_hero", source_cta: "global_cta" })}
                variant="whatsapp"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat WhatsApp
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
