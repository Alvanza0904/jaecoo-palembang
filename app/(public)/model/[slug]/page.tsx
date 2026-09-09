/**
 * JAECOO Palembang — Model Overview Page
 * Route: /model/[slug]
 *
 * STEP 7B: Complete premium model experience.
 * - LayeredHero jika CMS image tersedia, HeroPlaceholder jika belum
 * - Editorial design section (Exterior, Interior, Key Highlights)
 * - ImagePlaceholder yang jelas untuk setiap area foto
 * - Variants, Colors, Calculator, CTA
 */

export const revalidate = 0;

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { GoldLine } from "@/components/ui/GoldLine";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger } from "@/components/motion/Stagger";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { priceStatusAllowsCalculator } from "@/lib/types/model";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import styles from "./page.module.css";

interface ModelPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return (await getModelSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};

  return {
    title: model.meta_title ?? buildPageTitle(model.name),
    description: model.meta_description,
    alternates: { canonical: `/model/${slug}` },
    openGraph: {
      url: `/model/${slug}`,
      title: model.meta_title ?? model.name,
      description: model.meta_description ?? model.description,
    },
  };
}

export default async function ModelPage({ params }: ModelPageProps) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const whatsappUrl = buildWhatsAppUrl({
    source: "model_overview",
    source_page: `/model/${slug}`,
    model: model.short_name,
    source_cta: "model_hero_cta",
  });

  const hasHeroImage = !!(model.hero_media?.image?.desktop);

  return (
    <>
      <TransparentHeader />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      {hasHeroImage ? (
        <LayeredHero
          media={model.hero_media}
          heading={model.tagline}
          subheading={model.name}
          tagline="OVERVIEW"
          size="full"
          cta={
            <div className={styles.heroCtas}>
              <Button
                as="link"
                href={`/model/${slug}/technology`}
                variant="primary"
                size="lg"
              >
                Explore Technology →
              </Button>
              <Button as="link" href={`/model/${slug}/specifications`} variant="ghost" size="lg">
                Specifications
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <HeroPlaceholder
            tagline="OVERVIEW"
            heading={model.tagline}
            subheading={model.name}
            cta={
              <div className={styles.heroCtas}>
                <Button
                  as="link"
                  href={`/model/${slug}/technology`}
                  variant="primary"
                  size="lg"
                >
                  Explore Technology →
                </Button>
                <Button as="link" href={`/model/${slug}/specifications`} variant="ghost" size="lg">
                  Specifications
                </Button>
              </div>
            }
            size="full"
            accent="cool"
          />
          {/* Hero image placeholder — visible di bawah hero teks */}
          <div className={styles.heroImgPlaceholderRow}>
            <ImagePlaceholder
              label="HERO BACKGROUND"
              device="desktop"
              ratio="21/9"
              className={styles.heroImgPlaceholder}
            />
            <ImagePlaceholder
              label="HERO VEHICLE CUTOUT"
              ratio="4/3"
              source="Admin → Media Library (set as Cutout)"
              className={styles.heroImgPlaceholderCutout}
            />
          </div>
        </>
      )}

      {/* ── 2. MODEL INTRO ───────────────────────────────────────────────── */}
      <section className={styles.introSection}>
        <Container>
          <div className={styles.introGrid}>
            <Reveal variant="fade-up">
              <div className={styles.introText}>
                <GoldLine width="short" className={styles.introGold} />
                <h2 className={styles.introName}>{model.name}</h2>
                <p className={styles.introDesc}>{model.description}</p>
                <div className={styles.introPriceRow}>
                  <PriceDisplay
                    price_status={model.default_variant.price_status}
                    price_idr={model.default_variant.price_idr}
                    price_display={model.default_variant.price_display}
                    price_display_override={model.default_variant.price_display_override}
                    price_region={model.default_variant.price_region}
                  />
                </div>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <ImagePlaceholder
                label="MODEL INTRO"
                ratio="3/2"
                source="Admin → Media Library"
                className={styles.introImg}
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── 3. DESIGN / EXTERIOR ──────────────────────────────────────────── */}
      <section className={styles.editorialSection}>
        <Container size="wide">
          <Reveal variant="fade-up">
            <div className={styles.editorialLabel}>
              <span className={styles.editorialNumber}>01</span>
              <span className={styles.editorialCat}>Design</span>
            </div>
            <h2 className={styles.editorialHeading}>
              Designed to Command.
            </h2>
            <p className={styles.editorialBody}>
              Setiap lekukan {model.short_name} adalah perpaduan fungsi dan estetika —
              desain SUV premium yang menghadirkan kesan kuat di setiap sudut pandang.
            </p>
          </Reveal>
        </Container>

        <div className={styles.editorialMediaRow}>
          <Reveal variant="fade-up" delay={80}>
            <ImagePlaceholder
              label="EXTERIOR"
              device="desktop"
              ratio="16/9"
              source="Admin → Media Library"
              className={styles.editorialMainImg}
            />
          </Reveal>
          <Reveal variant="fade-up" delay={160}>
            <div className={styles.editorialSideImgs}>
              <ImagePlaceholder
                label="EXTERIOR DETAIL"
                ratio="4/3"
                source="Admin → Media Library"
                className={styles.editorialSideImg}
              />
              <ImagePlaceholder
                label="EXTERIOR REAR"
                ratio="4/3"
                source="Admin → Media Library"
                className={styles.editorialSideImg}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 4. INTERIOR ───────────────────────────────────────────────────── */}
      <section className={styles.editorialSection + " " + styles.interiorSection}>
        <Container size="wide">
          <div className={styles.interiorLayout}>
            <Reveal variant="fade-up">
              <div className={styles.interiorText}>
                <div className={styles.editorialLabel}>
                  <span className={styles.editorialNumber}>02</span>
                  <span className={styles.editorialCat}>Interior</span>
                </div>
                <h2 className={styles.editorialHeading}>
                  A Cabin Without Compromise.
                </h2>
                <p className={styles.editorialBody}>
                  Interior {model.short_name} dirancang untuk menghadirkan pengalaman berkendara
                  yang premium — material pilihan, teknologi terdepan, dan kenyamanan
                  yang terasa di setiap kilometer.
                </p>
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100}>
              <ImagePlaceholder
                label="INTERIOR"
                ratio="4/3"
                source="Admin → Media Library"
                className={styles.interiorImg}
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── 5. KEY HIGHLIGHTS ─────────────────────────────────────────────── */}
      <section className={styles.highlightSection}>
        <Container>
          <Reveal variant="fade-up">
            <SectionHeading
              eyebrow="Key Highlights"
              heading={`What sets the ${model.short_name} apart.`}
            />
          </Reveal>

          <div className={styles.featureGrid}>
            <Stagger delay={100} staggerMs={90} variant="fade-up">
              {model.technology.features.map((feature, i) => (
                <div key={feature.id} className={styles.featureCard}>
                  <div className={styles.featureIdx} aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  {feature.tag && (
                    <p className={styles.featureTag}>{feature.tag}</p>
                  )}
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.description}</p>
                </div>
              ))}
            </Stagger>
          </div>

          <Reveal variant="fade" delay={200}>
            <div className={styles.featureLink}>
              <Button
                as="link"
                href={`/model/${slug}/technology`}
                variant="secondary"
                size="md"
              >
                Lihat Teknologi Lengkap →
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ── 6. COLORS ─────────────────────────────────────────────────────── */}
      {model.colors.length > 0 && (
        <section className={styles.colorSection}>
          <Container>
            <Reveal variant="fade">
              <SectionHeading eyebrow="Warna Eksterior" heading="Choose Your Color." />
            </Reveal>

            <Stagger delay={80} staggerMs={60} variant="fade-up">
              {model.colors.map((color) => (
                <div key={color.id} className={styles.colorItem}>
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
                        label={`COLOR IMAGE — ${color.name.toUpperCase()}`}
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
          </Container>
        </section>
      )}

      {/* ── 7. VARIANTS ───────────────────────────────────────────────────── */}
      {model.variants.length > 1 && (
        <section className={styles.variantSection}>
          <Container>
            <Reveal variant="fade">
              <SectionHeading eyebrow="Varian" heading="Choose Your Variant." />
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
                    <PriceDisplay
                      price_status={variant.price_status}
                      price_idr={variant.price_idr}
                      price_display={variant.price_display}
                      price_display_override={variant.price_display_override}
                      price_region={variant.price_region}
                      className={styles.variantPriceDisplay}
                    />
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

      {/* ── 8. FINANCE CALCULATOR ─────────────────────────────────────────── */}
      {priceStatusAllowsCalculator(
        model.default_variant.price_status,
        model.default_variant.price_idr
      ) && (
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
              <FinanceCalculator
                price={model.default_variant.price_idr!}
                modelName={model.name}
              />
            </Reveal>
          </Container>
        </section>
      )}

      {/* ── 9. CTA ────────────────────────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <Container size="narrow">
          <Reveal variant="fade-up">
            <div className={styles.ctaBlock}>
              <GoldLine width="short" />
              <h2 className={styles.ctaHeading}>
                Tertarik dengan {model.short_name}?
              </h2>
              <p className={styles.ctaBody}>
                Hubungi Alvan untuk informasi harga terkini, jadwal test drive,
                dan penawaran spesial langsung dari dealer resmi JAECOO Palembang.
              </p>
              <div className={styles.ctaActions}>
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
                <Button
                  as="link"
                  href={`/model/${slug}/specifications`}
                  variant="ghost"
                  size="lg"
                >
                  Lihat Spesifikasi
                </Button>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
