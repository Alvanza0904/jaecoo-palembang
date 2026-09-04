/**
 * JAECOO Palembang — Model Overview Page
 * Route: /model/[slug]
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/data/models";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
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
      {/* Hero */}
      <section className={styles.hero} aria-label={`Hero ${model.name}`}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.heroBgFill} />
          {/* ResponsiveImage akan ditambahkan dengan media dari model.hero_media */}
        </div>
        <Container>
          <div className={styles.heroContent}>
            <Reveal variant="fade" delay={100}>
              <p className={styles.heroEyebrow}>{model.default_variant.price_region}</p>
            </Reveal>
            <Reveal variant="fade-up" delay={200}>
              <h1 className={styles.heroHeading}>{model.name}</h1>
            </Reveal>
            <Reveal variant="fade-up" delay={350}>
              <p className={styles.heroTagline}>{model.tagline}</p>
            </Reveal>
            <Reveal variant="fade-up" delay={450}>
              <p className={styles.heroPrice}>
                {model.default_variant.price_display}
                <span className={styles.heroPriceRegion}> {model.default_variant.price_region}</span>
              </p>
            </Reveal>
            <Reveal variant="fade-up" delay={550}>
              <div className={styles.heroCtas}>
                <Button as="a" href={whatsappUrl} variant="primary" size="lg" target="_blank" rel="noopener noreferrer">
                  Hubungi Sales
                </Button>
                <Button as="link" href={`/model/${slug}/technology`} variant="secondary" size="lg">
                  Teknologi
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Overview body */}
      <section className={styles.overview}>
        <Container>
          <Reveal>
            <p className={styles.description}>{model.description}</p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
