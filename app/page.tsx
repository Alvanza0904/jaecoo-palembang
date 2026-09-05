/**
 * JAECOO Palembang — Homepage
 *
 * Phase 2: Visual Foundation.
 * Cinematic full-width storytelling architecture.
 * Hero + Range + Technology + Promo + Journal + Global CTA.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getModels } from "@/lib/data/models";
import { getActivePromos } from "@/lib/data/promos";
import { getPublishedNews } from "@/lib/data/news";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { GoldLine } from "@/components/ui/GoldLine";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
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
      {/* Transparent header over hero */}
      <TransparentHeader />

      {/* ─── 1. HERO ──────────────────────────────────────────── */}
      {/*
        Phase 2: Using HeroPlaceholder.
        Phase 3+: Replace with <LayeredHero> when real images are ready.
        The LayeredHero component is fully built and ready to use.
      */}
      <HeroPlaceholder
        tagline="Dealer Resmi Palembang"
        heading={
          <>
            <span className={styles.heroModelLine}>JAECOO</span>
            <span className={styles.heroNameLine}>J5 EV</span>
          </>
        }
        subheading="Electric. Intelligent. Ready."
        cta={
          <div className={styles.heroCtas}>
            <Button as="link" href="/model/j5-ev" variant="primary" size="lg">
              Jelajahi J5 EV
            </Button>
            <Button
              as="a"
              href={heroWhatsApp}
              variant="secondary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to Alvan →
            </Button>
          </div>
        }
        accent="warm"
      />

      {/* ─── 2. JAECOO RANGE ──────────────────────────────────── */}
      <section className={styles.rangeSection} aria-label="Lineup JAECOO">
        <Container>
          <div className={styles.rangeMeta}>
            <Reveal variant="fade">
              <SectionHeading
                eyebrow="The Range"
                heading="Three models. One philosophy."
                subheading="Performance, technology, and design — without compromise."
              />
            </Reveal>
          </div>

          <div className={styles.modelList}>
            {models.map((model, i) => (
              <Reveal key={model.slug} variant="fade-up" delay={i * 80}>
                <article className={styles.modelRow}>
                  {/* Index */}
                  <span className={styles.modelIndex} aria-hidden="true">
                    0{i + 1}
                  </span>

                  {/* Info */}
                  <div className={styles.modelInfo}>
                    <p className={styles.modelShortName}>{model.short_name}</p>
                    <h3 className={styles.modelName}>{model.name}</h3>
                    <p className={styles.modelTagline}>{model.tagline}</p>
                  </div>

                  {/* Price + CTA */}
                  <div className={styles.modelPricing}>
                    <div>
                      <p className={styles.modelPrice}>
                        {model.default_variant.price_display}
                      </p>
                      <p className={styles.modelRegion}>
                        {model.default_variant.price_region}
                      </p>
                    </div>
                    <Button
                      as="link"
                      href={`/model/${model.slug}`}
                      variant="ghost"
                      size="sm"
                    >
                      Detail →
                    </Button>
                  </div>

                  {/* Gold separator */}
                  <div className={styles.modelSep} aria-hidden="true" />
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ─── 3. TECHNOLOGY ────────────────────────────────────── */}
      <section className={styles.techSection} aria-label="Teknologi JAECOO">
        <Container size="content">
          <Reveal variant="fade-up">
            <GoldLine width="short" className={styles.techGold} />
          </Reveal>
          <Reveal variant="fade-up" delay={100}>
            <SectionHeading
              eyebrow="Technology"
              heading={<>Intelligence<br />in Motion.</>}
              subheading="Every JAECOO is built with technology that adapts to you — not the other way around."
              size="display"
              align="center"
            />
          </Reveal>

          <Reveal variant="fade" delay={200}>
            <div className={styles.techCta}>
              <Button as="link" href="/model/j5-ev/technology" variant="secondary" size="md">
                Explore Technology
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ─── 4. PROMO ─────────────────────────────────────────── */}
      {promos.length > 0 && (
        <section className={styles.promoSection} aria-label="Promo JAECOO Palembang">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Penawaran"
                heading="Promo Terkini"
                subheading="Penawaran spesial dari JAECOO Palembang — terbatas untuk waktu tertentu."
              />
            </Reveal>
            {/* PromoCard akan ditambahkan di Phase 3+ */}
            <p className={styles.comingSoon}>
              {promos.length} penawaran aktif — segera hadir.
            </p>
          </Container>
        </section>
      )}

      {/* ─── 5. JAECOO JOURNAL ────────────────────────────────── */}
      {news.length > 0 && (
        <section className={styles.journalSection} aria-label="JAECOO Journal">
          <Container>
            <Reveal>
              <div className={styles.journalHeader}>
                <SectionHeading
                  eyebrow="Journal"
                  heading="The JAECOO Journal"
                />
                <Link href="/berita" className={styles.journalSeeAll}>
                  Semua Artikel →
                </Link>
              </div>
            </Reveal>
            {/* NewsCard akan ditambahkan di Phase 3+ */}
            <p className={styles.comingSoon}>
              {news.length} artikel tersedia.
            </p>
          </Container>
        </section>
      )}

      {/* ─── 6. GLOBAL CTA ────────────────────────────────────── */}
      <section className={styles.ctaSection} aria-label="Hubungi Sales Alvan">
        <Container size="narrow">
          <Reveal variant="fade-up">
            <div className={styles.ctaBlock}>
              <GoldLine width="short" className={styles.ctaGold} />
              <h2 className={styles.ctaHeading}>
                Ready to drive<br />something extraordinary?
              </h2>
              <p className={styles.ctaBody}>
                Konsultasi gratis, test drive, simulasi kredit — semua bisa diatur langsung bersama Alvan via WhatsApp.
              </p>
              <Button
                as="a"
                href={buildWhatsAppUrl({
                  source: "homepage_hero",
                  source_cta: "global_cta",
                })}
                variant="primary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Talk to Alvan →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
