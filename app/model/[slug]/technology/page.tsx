/**
 * JAECOO Palembang — Model Technology Page
 * Route: /model/[slug]/technology
 *
 * STEP 4A: Uses model.technology.headline from data — not hardcoded.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
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
  const model = getModelBySlug(slug);
  if (!model) return {};
  return {
    title: buildPageTitle(`${model.name} — Teknologi`),
    description: model.technology.subheadline ?? `Teknologi terdepan pada ${model.name}.`,
  };
}

export default async function TechnologyPage({ params }: Props) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  const { technology } = model;
  const whatsappUrl = buildWhatsAppUrl({
    source: "model_technology",
    source_page: `/model/${slug}/technology`,
    model: model.short_name,
    source_cta: "tech_cta",
  });

  return (
    <>
      <TransparentHeader />

      {/* Hero — headline dari technology data */}
      <HeroPlaceholder
        tagline="Technology"
        heading={technology.headline}
        subheading={technology.subheadline}
        size="medium"
        accent="cool"
      />

      {/* Headline section */}
      <section className={styles.headlineSection}>
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

      {/* Features — editorial list */}
      <section className={styles.featuresSection}>
        <Container>
          <div className={styles.featureList}>
            {technology.features.map((feature, i) => (
              <Reveal key={feature.id} variant="fade-up" delay={i * 80}>
                <article className={styles.featureRow}>
                  <div className={styles.featureIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className={styles.featureContent}>
                    {feature.tag && (
                      <p className={styles.featureTag}>{feature.tag}</p>
                    )}
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureDesc}>{feature.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <Container size="narrow">
          <Reveal variant="fade-up">
            <div className={styles.ctaBlock}>
              <h2 className={styles.ctaHeading}>
                Rasakan teknologi {model.short_name} secara langsung.
              </h2>
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
