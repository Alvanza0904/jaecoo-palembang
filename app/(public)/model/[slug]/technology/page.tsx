/**
 * JAECOO Palembang — Model Technology Page
 * Route: /model/[slug]/technology
 *
 * STEP 7B: Editorial technology story.
 * - Technology hero with CMS image OR clear placeholder
 * - Feature sections with editorial layout + image placeholders
 * - CMS image logic: tampil jika ada, placeholder jika tidak
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./technology.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getModelSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};
  return {
    title: buildPageTitle(`${model.name} — Teknologi`),
    alternates: { canonical: `/model/${slug}/technology` },
    description: model.technology.subheadline ?? `Teknologi terdepan pada ${model.name}.`,
  };
}

export default async function TechnologyPage({ params }: Props) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const { technology } = model;
  const hasHeroImage = !!(model.hero_media?.image?.desktop);

  const whatsappUrl = buildWhatsAppUrl({
    source: "model_technology",
    source_page: `/model/${slug}/technology`,
    model: model.short_name,
    source_cta: "tech_cta",
  });

  return (
    <>
      <TransparentHeader />

      {/* ── 1. TECHNOLOGY HERO ──────────────────────────────────────────── */}
      {hasHeroImage ? (
        <LayeredHero
          media={model.hero_media}
          heading={technology.headline}
          subheading={`${model.short_name} — Technology`}
          tagline="TECHNOLOGY"
          size="full"
        />
      ) : (
        <>
          <HeroPlaceholder
            tagline="Technology"
            heading={technology.headline}
            subheading={technology.subheadline}
            size="large"
            accent="cool"
          />
          <div className={styles.heroImgHint}>
            <ImagePlaceholder
              label="TECHNOLOGY HERO"
              device="desktop"
              ratio="21/9"
              source="Admin → Media Library"
              className={styles.heroImgHintItem}
            />
            <ImagePlaceholder
              label="TECHNOLOGY HERO"
              device="mobile"
              ratio="9/16"
              source="Admin → Media Library"
              className={styles.heroImgHintMobile}
            />
          </div>
        </>
      )}

      {/* ── 2. TECHNOLOGY STORY ─────────────────────────────────────────── */}
      <section className={styles.storySection}>
        <Container size="content">
          <Reveal variant="fade-up">
            <GoldLine width="short" className={styles.gold} />
          </Reveal>
          <Reveal variant="fade-up" delay={80}>
            <SectionHeading
              eyebrow={model.short_name}
              heading={technology.headline}
              subheading={technology.subheadline}
              size="large"
            />
          </Reveal>
        </Container>
      </section>

      {/* ── 3. FEATURE SECTIONS ─────────────────────────────────────────── */}
      <section className={styles.featuresSection}>
        <Container>
          <div className={styles.featureList}>
            {technology.features.map((feature, i) => {
              const isEven = i % 2 === 0;
              return (
                <Reveal key={feature.id} variant="fade-up" delay={i * 60}>
                  <article className={[styles.featureBlock, isEven ? styles.featureBlockEven : styles.featureBlockOdd].join(" ")}>
                    {/* Text side */}
                    <div className={styles.featureText}>
                      <div className={styles.featureIndex} aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </div>
                      {feature.tag && (
                        <p className={styles.featureTag}>{feature.tag}</p>
                      )}
                      <h3 className={styles.featureTitle}>{feature.title}</h3>
                      <p className={styles.featureDesc}>{feature.description}</p>
                    </div>

                    {/* Image side */}
                    <div className={styles.featureMedia}>
                      {feature.media?.image?.desktop ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={feature.media.image.desktop}
                          alt={feature.media.image.alt ?? feature.title}
                          className={styles.featureImg}
                        />
                      ) : (
                        <ImagePlaceholder
                          label={`TECHNOLOGY — ${(feature.tag ?? feature.title).toUpperCase()}`}
                          ratio="4/3"
                          source="Admin → Media Library"
                          className={styles.featurePlaceholder}
                        />
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* ── 4. NAVIGATION HINT ──────────────────────────────────────────── */}
      <section className={styles.navSection}>
        <Container>
          <Reveal variant="fade-up">
            <div className={styles.navRow}>
              <div className={styles.navBack}>
                <Button as="link" href={`/model/${slug}`} variant="ghost" size="md">
                  ← {model.short_name} Overview
                </Button>
              </div>
              <div className={styles.navNext}>
                <Button as="link" href={`/model/${slug}/specifications`} variant="secondary" size="md">
                  Spesifikasi Lengkap →
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── 5. CTA ────────────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <Container size="narrow">
          <Reveal variant="fade-up">
            <div className={styles.ctaBlock}>
              <GoldLine width="short" />
              <h2 className={styles.ctaHeading}>
                Rasakan teknologi {model.short_name} secara langsung.
              </h2>
              <p className={styles.ctaBody}>
                Jadwalkan test drive eksklusif dan rasakan perbedaan yang sesungguhnya.
              </p>
              <Button
                as="a"
                href={whatsappUrl}
                variant="primary"
                size="lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Jadwalkan Test Drive →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
