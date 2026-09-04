/**
 * JAECOO Palembang — Model Technology Page
 * Route: /model/[slug]/technology
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/data/models";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./technology.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getModelSlugs().map((slug) => ({ slug }));
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

  return (
    <section className={styles.section}>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Technology"
            heading={technology.headline}
            subheading={technology.subheadline}
            size="large"
          />
        </Reveal>

        <div className={styles.features}>
          <Stagger delay={200} staggerMs={150}>
            {technology.features.map((feature) => (
              <article key={feature.id} className={styles.feature}>
                {feature.tag && <p className={styles.featureTag}>{feature.tag}</p>}
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.description}</p>
              </article>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
