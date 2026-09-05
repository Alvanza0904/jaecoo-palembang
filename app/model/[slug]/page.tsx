/**
 * JAECOO Palembang — Model Overview Page
 * Route: /model/[slug]
 * Phase 2: Uses HeroPlaceholder until real images ready.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/data/models";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GoldLine } from "@/components/ui/GoldLine";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./page.module.css";

interface ModelPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getModelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) return {};

  return {
    title: model.meta_title ?? buildPageTitle(model.name),
    description: model.meta_description,
    openGraph: {
      title: model.meta_title ?? model.name,
      description: model.meta_description ?? model.description,
    },
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  const whatsappUrl = buildWhatsAppUrl({
    source: "model_overview",
    source_page: `/model/${slug}`,
    model: model.short_name,
    source_cta: "model_hero_cta",
  });

  return (
    <>
      <TransparentHeader />
      {/* ── Hero ── */}
      <HeroPlaceholder
        tagline="OVERVIEW"
        heading={
          <>
            <span className={styles.heroPrefix}>THIS IS THE</span>
            <span className={styles.heroModel}>REAL SUV.</span>
          </>
        }
        subheading={model.tagline}
        cta={
          <div className={styles.heroCtas}>
            <Button
              as="a"
              href={whatsappUrl}
              variant="primary"
              size="lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to Alvan →
            </Button>
            <Button as="link" href={`/model/${slug}/specifications`} variant="ghost" size="lg">
              Spesifikasi
            </Button>
          </div>
        }
        size="large"
        accent="cool"
      />

      {/* ── Model Description ── */}
      <section className={styles.descSection}>
        <Container>
          <Reveal variant="fade-up">
            <div className={styles.descContent}>
              <GoldLine width="short" className={styles.descGold} />
              <h2 className={styles.descName}>{model.name}</h2>
              <p className={styles.descText}>{model.description}</p>

              <div className={styles.descPrice}>
                <p className={styles.priceLabel}>Mulai dari</p>
                <p className={styles.priceValue}>
                  {model.default_variant.price_display}
                </p>
                <p className={styles.priceRegion}>
                  {model.default_variant.price_region}
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Technology Preview ── */}
      <section className={styles.techPreview}>
        <Container>
          <Reveal variant="fade-up">
            <SectionHeading
              eyebrow="Technology"
              heading={model.technology.headline}
              subheading={model.technology.subheadline}
            />
          </Reveal>

          <div className={styles.techFeatures}>
            <Stagger delay={100} staggerMs={100} variant="fade-up">
              {model.technology.features.map((feature) => (
                <div key={feature.id} className={styles.techFeature}>
                  {feature.tag && (
                    <p className={styles.techTag}>{feature.tag}</p>
                  )}
                  <h3 className={styles.techTitle}>{feature.title}</h3>
                  <p className={styles.techDesc}>{feature.description}</p>
                </div>
              ))}
            </Stagger>
          </div>

          <Reveal variant="fade" delay={200}>
            <div className={styles.techLink}>
              <Button
                as="link"
                href={`/model/${slug}/technology`}
                variant="secondary"
                size="md"
              >
                Teknologi Lengkap →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── Color variants ── */}
      {model.colors.length > 0 && (
        <section className={styles.colorSection}>
          <Container>
            <Reveal variant="fade">
              <SectionHeading eyebrow="Exterior" heading="Available Colors" />
            </Reveal>
            <div className={styles.colorSwatches}>
              <Stagger delay={100} staggerMs={60} variant="fade-up">
                {model.colors.map((color) => (
                  <div key={color.id} className={styles.colorSwatch}>
                    <div
                      className={styles.swatchDot}
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <p className={styles.swatchName}>{color.name}</p>
                  </div>
                ))}
              </Stagger>
            </div>
          </Container>
        </section>
      )}

      {/* ── Variants ── */}
      {model.variants.length > 1 && (
        <section className={styles.variantSection}>
          <Container>
            <Reveal variant="fade">
              <SectionHeading eyebrow="Varian" heading="Choose Your Variant" />
            </Reveal>
            <div className={styles.variants}>
              <Stagger delay={100} staggerMs={80} variant="fade-up">
                {model.variants.map((variant) => (
                  <div key={variant.id} className={styles.variantCard}>
                    <div className={styles.variantHeader}>
                      <h3 className={styles.variantName}>{variant.name}</h3>
                      {variant.label && (
                        <span className={styles.variantBadge}>{variant.label}</span>
                      )}
                    </div>
                    <p className={styles.variantPrice}>{variant.price_display}</p>
                    <p className={styles.variantRegion}>{variant.price_region}</p>
                    <Button
                      as="a"
                      href={buildWhatsAppUrl({
                        source: "model_overview",
                        source_page: `/model/${slug}`,
                        model: variant.name,
                        source_cta: "variant_cta",
                      })}
                      variant="primary"
                      size="sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Hubungi Sales
                    </Button>
                  </div>
                ))}
              </Stagger>
            </div>
          </Container>
        </section>
      )}

      {/* ── Global CTA ── */}
      <section className={styles.ctaSection}>
        <Container size="narrow">
          <Reveal variant="fade-up">
            <div className={styles.ctaBlock}>
              <h2 className={styles.ctaHeading}>
                Tertarik dengan {model.short_name}?
              </h2>
              <p className={styles.ctaBody}>
                Hubungi Alvan untuk informasi harga terkini, test drive, dan penawaran spesial.
              </p>
              <Button
                as="a"
                href={whatsappUrl}
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
