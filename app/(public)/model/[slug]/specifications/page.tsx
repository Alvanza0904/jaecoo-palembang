/**
 * JAECOO Palembang — Model Specifications Page
 * Route: /model/[slug]/specifications
 *
 * STEP 4A: Real spec data from model. Calculator integrated with correct price.
 * STEP 5B.1: PriceDisplay component, calculator guarded by priceStatusAllowsCalculator.
 */

export const revalidate = 0; // selalu fetch fresh dari Supabase

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { priceStatusAllowsCalculator } from "@/lib/types/model";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./specifications.module.css";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getModelSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};

  const v = model.default_variant;
  // SEO: hanya sertakan harga jika status menghasilkan nominal nyata
  const priceText =
    v.price_status === "official" || v.price_status === "starting_from"
      ? (v.price_display ? `. ${v.price_display} ${v.price_region}` : "")
      : "";

  return {
    title: buildPageTitle(`${model.name} — Spesifikasi`),
    alternates: { canonical: `/model/${slug}/specifications` },
    description: `Spesifikasi lengkap ${model.name}${priceText}.`,
  };
}

export default async function SpecificationsPage({ params }: Props) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const whatsappUrl = buildWhatsAppUrl({
    source: "model_specifications",
    source_page: `/model/${slug}/specifications`,
    model: model.short_name,
    source_cta: "specs_cta",
  });

  const v = model.default_variant;
  const showCalculator = priceStatusAllowsCalculator(v.price_status, v.price_idr);

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
            {v.price_status !== "hidden" && (
              <div className={styles.priceTag}>
                <PriceDisplay
                  price_status={v.price_status}
                  price_idr={v.price_idr}
                  price_display={v.price_display}
                  price_display_override={v.price_display_override}
                  price_region={v.price_region}
                />
              </div>
            )}
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

        {/* Finance Calculator — hanya jika price_status memungkinkan */}
        {showCalculator && (
          <Reveal variant="fade-up" delay={100} threshold={0}>
            <div className={styles.calcWrapper}>
              <FinanceCalculator
                price={v.price_idr!}
                modelName={model.name}
              />
            </div>
          </Reveal>
        )}

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
