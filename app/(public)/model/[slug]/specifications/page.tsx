/**
 * JAECOO Palembang — Model Specifications Page
 * Route: /model/[slug]/specifications
 *
 * STEP 7B: Premium spec experience.
 * - Editorial header with price
 * - Spec tables by category
 * - Color selector with CMS images OR placeholders
 * - Variants display
 * - Finance Calculator (guarded)
 * - Navigation back to Overview
 */

export const revalidate = 0;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GoldLine } from "@/components/ui/GoldLine";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
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
    <>
      <TransparentHeader />

      <div className={styles.page}>
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <section className={styles.headerSection}>
          <Container size="content">
            <Reveal variant="fade-up">
              <GoldLine width="short" className={styles.gold} />
              <h1 className={styles.pageTitle}>{model.name}</h1>
              <p className={styles.pageSubtitle}>Specifications</p>
            </Reveal>

            {v.price_status !== "hidden" && (
              <Reveal variant="fade-up" delay={80}>
                <div className={styles.priceRow}>
                  <PriceDisplay
                    price_status={v.price_status}
                    price_idr={v.price_idr}
                    price_display={v.price_display}
                    price_display_override={v.price_display_override}
                    price_region={v.price_region}
                  />
                </div>
              </Reveal>
            )}
          </Container>
        </section>

        {/* ── SPEC CATEGORIES ───────────────────────────────────────────── */}
        <section className={styles.specsSection}>
          <Container size="content">
            <div className={styles.categories}>
              {model.specifications.map((cat, i) => (
                <Reveal key={cat.label} variant="fade-up" delay={i * 60}>
                  <div className={styles.category}>
                    <h2 className={styles.categoryLabel}>{cat.label}</h2>
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

            <Reveal variant="fade" delay={200}>
              <p className={styles.disclaimer}>
                Spesifikasi dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.
                Untuk informasi terkini dan resmi, hubungi Sales JAECOO Palembang.
              </p>
            </Reveal>
          </Container>
        </section>

        {/* ── COLORS ────────────────────────────────────────────────────── */}
        {model.colors.length > 0 && (
          <section className={styles.colorsSection}>
            <Container size="content">
              <Reveal variant="fade-up">
                <SectionHeading
                  eyebrow="Warna Eksterior"
                  heading="Available Colors."
                />
              </Reveal>

              <div className={styles.colorGrid}>
                <Stagger delay={80} staggerMs={60} variant="fade-up">
                  {model.colors.map((color) => (
                    <div key={color.id} className={styles.colorCard}>
                      <div className={styles.colorImgWrap}>
                        {color.image?.desktop ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={color.image.desktop}
                            alt={color.image.alt ?? color.name}
                            className={styles.colorImg}
                          />
                        ) : (
                          <ImagePlaceholder
                            label={`COLOR — ${color.name.toUpperCase()}`}
                            ratio="16/9"
                            source="Admin → Media Library"
                            className={styles.colorImgPlaceholder}
                          />
                        )}
                      </div>
                      <div className={styles.colorMeta}>
                        <div
                          className={styles.colorSwatch}
                          style={{ backgroundColor: color.hex }}
                          aria-hidden="true"
                        />
                        <p className={styles.colorName}>{color.name}</p>
                      </div>
                    </div>
                  ))}
                </Stagger>
              </div>
            </Container>
          </section>
        )}

        {/* ── VARIANTS ──────────────────────────────────────────────────── */}
        {model.variants.length > 1 && (
          <section className={styles.variantsSection}>
            <Container size="content">
              <Reveal variant="fade-up">
                <SectionHeading eyebrow="Varian" heading="Choose Your Variant." />
              </Reveal>

              <div className={styles.variantList}>
                <Stagger delay={80} staggerMs={80} variant="fade-up">
                  {model.variants.map((variant) => (
                    <div key={variant.id} className={styles.variantItem}>
                      <div className={styles.variantTop}>
                        <div>
                          <h3 className={styles.variantName}>{variant.name}</h3>
                          {variant.label && (
                            <span className={styles.variantBadge}>{variant.label}</span>
                          )}
                        </div>
                        <PriceDisplay
                          price_status={variant.price_status}
                          price_idr={variant.price_idr}
                          price_display={variant.price_display}
                          price_display_override={variant.price_display_override}
                          price_region={variant.price_region}
                        />
                      </div>
                      <Button
                        as="a"
                        href={buildWhatsAppUrl({
                          source: "model_specifications",
                          source_page: `/model/${slug}/specifications`,
                          model: variant.name,
                          source_cta: "variant_specs_cta",
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

        {/* ── FINANCE CALCULATOR ────────────────────────────────────────── */}
        {showCalculator && (
          <section className={styles.calcSection}>
            <Container size="narrow">
              <Reveal variant="fade-up" threshold={0}>
                <SectionHeading
                  eyebrow="Simulasi Kredit"
                  heading="Hitung Cicilan Anda."
                  subheading="Estimasi angsuran dengan bunga flat 10%/tahun. Hubungi kami untuk simulasi resmi."
                />
              </Reveal>
              <Reveal variant="fade-up" delay={100} threshold={0}>
                <div className={styles.calcWrapper}>
                  <FinanceCalculator
                    price={v.price_idr!}
                    modelName={model.name}
                  />
                </div>
              </Reveal>
            </Container>
          </section>
        )}

        {/* ── NAVIGATION ────────────────────────────────────────────────── */}
        <section className={styles.navSection}>
          <Container size="content">
            <Reveal variant="fade-up">
              <div className={styles.navRow}>
                <Button as="link" href={`/model/${slug}`} variant="ghost" size="md">
                  ← {model.short_name} Overview
                </Button>
                <Button as="link" href={`/model/${slug}/technology`} variant="ghost" size="md">
                  Technology →
                </Button>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className={styles.ctaSection}>
          <Container size="narrow">
            <Reveal variant="fade-up">
              <div className={styles.ctaBlock}>
                <GoldLine width="short" />
                <h2 className={styles.ctaHeading}>
                  Siap memesan {model.short_name}?
                </h2>
                <p className={styles.ctaBody}>
                  Hubungi Alvan untuk informasi harga terkini, test drive,
                  dan penawaran spesial dealer resmi JAECOO Palembang.
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
      </div>
    </>
  );
}
