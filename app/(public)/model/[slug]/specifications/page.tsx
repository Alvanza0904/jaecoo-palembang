/**
 * JAECOO Palembang — Model Spesifikasi Page
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
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { resolveSubpageHero } from "@/lib/models/hero";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { priceStatusAllowsCalculator } from "@/lib/types/model";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import { J7ShsExploreCta } from "@/components/model/J7ShsExploreCta";
import { CargoEditorial, J5_CARGO_STATS } from "@/components/model/CargoEditorial";
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

export default async function SpesifikasiPage({ params }: Props) {
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
  const specsCta = model.page_copy?.specs_cta;
  const specsHeading = specsCta?.heading || `Siap memesan ${model.short_name}?`;
  const specsBody = specsCta?.body || "Hubungi Alvan untuk informasi harga terkini, test drive, dan penawaran spesial dealer resmi JAECOO Palembang.";
  const specsButton = specsCta?.primary_label || "Chat dengan Alvan →";
  const specsHeroMedia = resolveSubpageHero(model.image_slots?.specifications_hero, model.hero_media);
  const specsHeroCopy = model.page_copy?.specifications_hero;
  const hasSpecsHero = !!(specsHeroMedia.image?.desktop || specsHeroMedia.image?.mobile);
  const cargoFromSpecs = slug === "jaecoo-j5-ev"
    ? model.specifications.find((category) => /bagasi|cargo/i.test(category.label))
    : undefined;
  const cargoStats = slug === "jaecoo-j5-ev" ? [...J5_CARGO_STATS] : null;
  const tableCategories = cargoFromSpecs
    ? model.specifications.filter((category) => category !== cargoFromSpecs)
    : model.specifications;
  const cargoImage = model.image_slots?.cargo;

  return (
    <>
      <TransparentHeader />

      <div className={styles.heroSection}>
        {hasSpecsHero ? (
          <LayeredHero
            media={specsHeroMedia}
            heading={specsHeroCopy?.heading || model.name}
            subheading={specsHeroCopy?.body || model.short_name}
            tagline={specsHeroCopy?.label || "SPESIFIKASI"}
            size="large"
          />
        ) : null}
      </div>

      <div className={hasSpecsHero ? styles.pageAfterHero : styles.page}>
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <section className={styles.headerSection} data-contrast="light">
          <Container size="content">
            <Reveal variant="fade-up">
              <GoldLine width="short" className={styles.gold} />
              {!hasSpecsHero && <h1 className={styles.pageTitle}>{model.name}</h1>}
              {!hasSpecsHero && <p className={styles.pageSubtitle}>Spesifikasi</p>}
              {hasSpecsHero && <p className={styles.pageSubtitle}>Detail angka</p>}
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

        {cargoStats && (
          <CargoEditorial
            desktop={cargoImage?.desktop}
            mobile={cargoImage?.mobile}
            alt={cargoImage?.alt || `${model.name} bagasi`}
            focalX={cargoImage?.focal_x}
            focalY={cargoImage?.focal_y}
            stats={cargoStats}
          />
        )}

        {/* ── SPEC CATEGORIES ───────────────────────────────────────────── */}
        <section className={styles.specsSection} data-contrast="light">
          <Container size="content">
            <div className={styles.categories}>
              {tableCategories.map((cat, i) => (
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

        {model.variants.length > 1 && (
          <section className={styles.variantsSection} data-contrast="light">
            <Container size="content">
              <Reveal variant="fade-up">
                <SectionHeading eyebrow="Varian" heading="Pilih Varian" />
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

        {slug === "jaecoo-j7-sivp" && <J7ShsExploreCta />}

        {/* ── NAVIGATION ────────────────────────────────────────────────── */}
        <section className={styles.navSection} data-contrast="light">
          <Container size="content">
            <Reveal variant="fade-up">
              <div className={styles.navRow}>
                <Button as="link" href={`/model/${slug}`} variant="ghost" size="md">
                  ← {model.short_name} Overview
                </Button>
                <Button as="link" href={`/model/${slug}/technology`} variant="ghost" size="md">
                  Teknologi →
                </Button>
              </div>
            </Reveal>
          </Container>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className={styles.ctaSection} data-theme="dark">
          <Container size="narrow">
            <Reveal variant="fade-up">
              <div className={styles.ctaBlock}>
                <GoldLine width="short" />
                <h2 className={styles.ctaHeading}>
                  {specsHeading}
                </h2>
                <p className={styles.ctaBody}>
                  {specsBody}
                </p>
                <Button
                  as="a"
                  href={whatsappUrl}
                  variant="primary"
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {specsButton}
                </Button>
              </div>
            </Reveal>
          </Container>
        </section>
      </div>
    </>
  );
}
