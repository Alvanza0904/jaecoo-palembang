/**
 * JAECOO Palembang — Model Specifications Page
 * Route: /model/[slug]/specifications
 *
 * STEP 4A: Real spec data from model. Calculator integrated with correct price.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/data/models";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./specifications.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getModelSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) return {};
  return {
    title: buildPageTitle(`${model.name} — Spesifikasi`),
    description: `Spesifikasi lengkap ${model.name}. ${model.default_variant.price_display} ${model.default_variant.price_region}.`,
  };
}

export default async function SpecificationsPage({ params }: Props) {
  const { slug } = await params;
  const model = getModelBySlug(slug);
  if (!model) notFound();

  const whatsappUrl = buildWhatsAppUrl({
    source: "model_specifications",
    source_page: `/model/${slug}/specifications`,
    model: model.short_name,
    source_cta: "specs_cta",
  });

  return (
    <section className={styles.section}>
      <Container size="content">

        {/* Header */}
        <Reveal variant="fade-up">
          <div className={styles.header}>
            <GoldLine width="short" className={styles.gold} />
            <SectionHeading
              eyebrow="Specifications"
              heading={`${model.short_name} — Every Detail Matters.`}
              size="large"
            />
            <div className={styles.priceTag}>
              <span className={styles.priceFrom}>OTR Palembang</span>
              <span className={styles.priceValue}>
                {model.default_variant.price_display}
              </span>
            </div>
          </div>
        </Reveal>

        {/* Spec categories */}
        <div className={styles.categories}>
          {model.specifications.map((cat, i) => (
            <Reveal key={cat.label} variant="fade-up" delay={i * 80}>
              <div className={styles.category}>
                <h3 className={styles.categoryLabel}>{cat.label}</h3>
                <table
                  className={styles.table}
                  aria-label={`Spesifikasi ${cat.label} ${model.name}`}
                >
                  <tbody>
                    {cat.specs.map((spec) => (
                      <tr key={spec.label} className={styles.row}>
                        <th className={styles.rowLabel} scope="row">
                          {spec.label}
                        </th>
                        <td className={styles.rowValue}>{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Disclaimer */}
        <Reveal variant="fade" delay={200}>
          <p className={styles.disclaimer}>
            Spesifikasi dapat berubah sewaktu-waktu. Untuk informasi terkini,
            hubungi Sales JAECOO Palembang.
          </p>
        </Reveal>

        {/* Finance Calculator — price from model data */}
        <Reveal variant="fade-up" delay={100} threshold={0}>
          <div className={styles.calcWrapper}>
            <FinanceCalculator
              price={model.default_variant.price_idr}
              modelName={model.name}
            />
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal variant="fade-up" delay={100}>
          <div className={styles.cta}>
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
  );
}
