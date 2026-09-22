/**
 * JAECOO Palembang — Model Overview Page
 * Route: /model/[slug]
 *
 * STEP 7B: Cinematic Editorial Redesign.
 * IMAGE-LED. TEXT SUPPORTS IMAGE. NO CARD GRIDS.
 *
 * Architecture:
 *   01 HERO — Full cinematic, layered typography
 *   02 EXTERIOR — Full-bleed image, editorial text overlay
 *   03 DESIGN DETAIL — Close-up editorial composition
 *   04 PROFILE / PRESENCE — Side profile, oversized typography
 *   05 INTERIOR — Full-width cinematic cabin
 *   06 COCKPIT DETAIL — Layered overlap composition
 *   07 PERFORMANCE — Floating numbers over vehicle image
 *   08 TECHNOLOGY — Image-led with feature overlay
 *   09 ADAS / SAFETY — Driving image + stat overlay
 *   10 COLORS — Interactive carousel (single visual area)
 *   11 SPECS VISUAL — Key numbers + vehicle image
 *   12 FINAL CTA — Cinematic end scene
 *
 *   + Finance Calculator (minimal, integrated)
 */

export const revalidate = 0;

import type { CSSProperties } from "react";
import type { Metadata } from "next";
import type { ResponsiveImage } from "@/lib/types/media";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { HeroPlaceholder } from "@/components/hero/HeroPlaceholder";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { FinanceCalculator } from "@/components/finance/FinanceCalculator";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { priceStatusAllowsCalculator } from "@/lib/types/model";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import { ColorCarousel } from "@/components/model/ColorCarousel";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import styles from "./page.module.css";

/**
 * Compute presentation_settings style for a CMS image slot.
 * Mirrors the same pattern used by LayeredHero / getBackgroundLayerStyle.
 * Desktop uses presentation_settings; mobile uses presentation_settings_mobile
 * (falls back to presentation_settings when the mobile override is absent).
 */
function cmsImageStyle(
  image: ResponsiveImage | undefined,
  breakpoint: "desktop" | "mobile" | "tablet" | "small_mobile",
): CSSProperties {
  if (!image?.presentation_settings) return {};
  const settings =
    (breakpoint === "mobile" || breakpoint === "small_mobile")
      ? (image.presentation_settings_mobile ?? image.presentation_settings)
      : image.presentation_settings;
  if (!settings) return {};
  return getBackgroundLayerStyle(
    settings,
    breakpoint,
    image.focal_x ?? 50,
    image.focal_y ?? 50,
  );
}

function CmsModelImage({
  image,
  label,
  ratio = "16/9",
  className,
}: {
  image?: ResponsiveImage;
  label: string;
  ratio?: string;
  className?: string;
}) {
  const src = image?.desktop ?? image?.tablet ?? image?.mobile ?? image?.small_mobile;
  if (!image || !src) {
    return (
      <ImagePlaceholder
        label={label}
        ratio={ratio}
        source="Supabase → Media Library"
        className={className}
      />
    );
  }

  // Desktop presentation style (applied via inline style on the <img>)
  const desktopStyle = cmsImageStyle(image, "desktop");
  const mobileStyle  = cmsImageStyle(image, "mobile");

  // Expose mobile overrides as CSS custom properties so a single <img>
  // can switch between desktop and mobile via a @media rule in the stylesheet.
  // This mirrors the same pattern used in HomeExperience.tsx (VisualImage).
  const combinedStyle: CSSProperties = {
    ...desktopStyle,
    "--cms-mobile-fit":       mobileStyle.objectFit,
    "--cms-mobile-position":  mobileStyle.objectPosition,
    "--cms-mobile-transform": mobileStyle.transform,
    "--cms-mobile-origin":    mobileStyle.transformOrigin,
  } as CSSProperties;

  return (
    // Keep the existing section classes so the visual composition is unchanged.
    // The image source is resolved from Supabase media assignments.
    <picture>
      {image.small_mobile && (
        <source media="(max-width: 389px)" srcSet={image.small_mobile} />
      )}
      {image.mobile && (
        <source media="(max-width: 767px)" srcSet={image.mobile} />
      )}
      {image.tablet && (
        <source media="(max-width: 1023px)" srcSet={image.tablet} />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={image.alt}
        className={`${className ?? ""} ${styles.cmsImg}`}
        loading="lazy"
        decoding="async"
        style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      />
    </picture>
  );
}

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

  const whatsappCtaUrl = buildWhatsAppUrl({
    source: "model_overview",
    source_page: `/model/${slug}`,
    model: model.short_name,
    source_cta: "model_cta_final",
  });

  const hasHeroImage = !!(model.hero_media?.image?.desktop);

  // Key specs dari model — ambil dari data technology features untuk highlights
  const keyFeatures = model.technology.features.slice(0, 3);

  return (
    <>
      <TransparentHeader />

      {/* ══════════════════════════════════════════════════════════════════
          01 — HERO — Full Cinematic
          heroSection: negative margin-top cancels ModelNavigation height (48px)
          so the hero fills the full viewport and the bottom CTA is reachable.
      ══════════════════════════════════════════════════════════════════ */}
      <div className={styles.heroSection}>
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
                  as="a"
                  href={whatsappUrl}
                  variant="primary"
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat dengan Alvan →
                </Button>
                <Button
                  as="link"
                  href={`/model/${slug}/specifications`}
                  variant="ghost"
                  size="lg"
                >
                  Spesifikasi
                </Button>
              </div>
            }
          />
        ) : (
          <HeroPlaceholder
            tagline="OVERVIEW"
            heading={model.tagline}
            subheading={model.name}
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
                  Chat dengan Alvan →
                </Button>
                <Button
                  as="link"
                  href={`/model/${slug}/specifications`}
                  variant="ghost"
                  size="lg"
                >
                  Spesifikasi
                </Button>
              </div>
            }
            size="full"
          />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          02 — EXTERIOR — Full-bleed image, editorial text layered inside
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.cinematicSection} data-theme="dark">
        {/* Background image — full bleed */}
        <div className={styles.cinematicBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.exterior} label="EXTERIOR — FULL BLEED" ratio="21/9" className={styles.cinematicBgImg} />
          <div className={styles.cinematicBgImgMobile} aria-hidden="true">
            <CmsModelImage image={model.image_slots?.exterior_mobile ?? model.image_slots?.exterior} label="EXTERIOR — MOBILE" ratio="4/5" className={styles.cinematicBgImg} />
          </div>
          <div className={styles.cinematicOverlay} />
        </div>

        {/* Editorial text — positioned bottom-left inside image */}
        <div className={styles.cinematicContent} data-position="bottom-left">
          <Reveal variant="fade-up">
            <p className={styles.editorialLabel}>
              <span className={styles.editorialNum}>01</span>
              <span className={styles.editorialCat}>Desain</span>
            </p>
            <h2 className={styles.cinematicHeading}>
              Desained<br />
              untuk tampil berkarakter.
            </h2>
            <p className={styles.cinematicBody}>
              {model.description}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          03 — DESIGN DETAIL — Editorial close-up
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.detailSection}>
        <div className={styles.detailGrid}>
          {/* Main detail image — dominan */}
          <Reveal variant="fade-up" className={styles.detailMainWrap}>
            <CmsModelImage image={model.image_slots?.design_detail_main} label="DESIGN DETAIL — HEADLIGHT / GRILLE" ratio="3/4" className={styles.detailMainImg} />
          </Reveal>

          {/* Editorial text — right column */}
          <div className={styles.detailTextWrap}>
            <Reveal variant="fade-up" delay={120}>
              <p className={styles.editorialLabel}>
                <span className={styles.editorialNum}>02</span>
                <span className={styles.editorialCat}>Detail</span>
              </p>
              <h2 className={styles.detailHeading}>
                Setiap garis<br />
                memiliki tujuan.
              </h2>
              <p className={styles.detailBody}>
                Dari lampu depan LED signature hingga lekukan bodi yang tegas —
                setiap detail {model.short_name} dirancang dengan presisi.
              </p>
            </Reveal>

            {/* Secondary detail images stacked */}
            <div className={styles.detailSecondaryImgs}>
              <Reveal variant="fade-up" delay={200}>
                <CmsModelImage image={model.image_slots?.design_detail_wheel} label="DETAIL — WHEEL / RIM" ratio="1/1" className={styles.detailSecondaryImg} />
              </Reveal>
              <Reveal variant="fade-up" delay={280}>
                <CmsModelImage image={model.image_slots?.design_detail_rear} label="DETAIL — REAR / BADGE" ratio="1/1" className={styles.detailSecondaryImg} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          04 — PROFILE / PRESENCE — Side profile, oversized type
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.presenceSection} data-theme="dark">
        <div className={styles.presenceBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.profile} label="PROFILE — SIDE VIEW FULL" ratio="16/7" className={styles.presenceBgImg} />
          <div className={styles.cinematicOverlay} style={{ opacity: 0.5 }} />
        </div>

        <div className={styles.presenceContent}>
          <Reveal variant="fade-up">
            <p className={styles.presenceLabel}>
              <span className={styles.editorialNum}>03</span>
              <span className={styles.editorialCat}>Karakter</span>
            </p>
            <h2 className={styles.presenceHeading}>
              Percaya Diri<br />
              dari setiap<br />
              sudut.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          05 — INTERIOR — Full-width cinematic cabin
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.cinematicSection} data-theme="dark">
        <div className={styles.cinematicBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.interior} label="INTERIOR — CABIN FULL WIDTH" ratio="21/9" className={styles.cinematicBgImg} />
          <div className={styles.cinematicBgImgMobile}>
            <CmsModelImage image={model.image_slots?.interior_mobile ?? model.image_slots?.interior} label="INTERIOR — MOBILE" ratio="4/5" className={styles.cinematicBgImg} />
          </div>
          <div className={styles.cinematicOverlay} />
        </div>

        <div className={styles.cinematicContent} data-position="bottom-right">
          <Reveal variant="fade-up">
            <p className={styles.editorialLabel}>
              <span className={styles.editorialNum}>04</span>
              <span className={styles.editorialCat}>Interior</span>
            </p>
            <h2 className={styles.cinematicHeading}>
              Kabin<br />
              yang dirancang untuk<br />
              perjalanan.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          06 — COCKPIT DETAIL — Layered overlap composition
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.cockpitSection}>
        <Container size="wide">
          <div className={styles.cockpitLayout}>
            {/* Main cockpit image */}
            <div className={styles.cockpitMainWrap}>
              <Reveal variant="fade-up">
                <CmsModelImage image={model.image_slots?.cockpit_main} label="COCKPIT — DASHBOARD / SCREEN" ratio="4/3" className={styles.cockpitMainImg} />
              </Reveal>

              {/* Floating detail image — overlaps main */}
              <Reveal variant="fade-up" delay={150} className={styles.cockpitFloatingWrap}>
                <CmsModelImage image={model.image_slots?.cockpit_detail} label="COCKPIT — STEERING / DETAIL" ratio="1/1" className={styles.cockpitFloatingImg} />
              </Reveal>
            </div>

            {/* Editorial text */}
            <div className={styles.cockpitText}>
              <Reveal variant="fade-up" delay={80}>
                <p className={styles.editorialLabel}>
                  <span className={styles.editorialNum}>05</span>
                  <span className={styles.editorialCat}>Kokpit</span>
                </p>
                <h2 className={styles.cockpitHeading}>
                  Cerdas<br />
                  sejak dirancang.
                </h2>
                <p className={styles.cockpitBody}>
                  Layar sentuh ganda, panel instrumen digital, dan antarmuka
                  intuitif — semua dalam jangkauan pengemudi {model.short_name}.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          07 — PERFORMANCE — Floating numbers over vehicle image
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.performanceSection} data-theme="dark">
        <div className={styles.performanceBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.performance} label="PERFORMANCE — VEHICLE / ACTION" ratio="16/9" className={styles.performanceBgImg} />
          <div className={styles.cinematicOverlay} style={{ opacity: 0.6 }} />
        </div>

        <Container size="wide">
          <div className={styles.performanceContent}>
            <Reveal variant="fade-up">
              <p className={styles.editorialLabel}>
                <span className={styles.editorialNum}>06</span>
                <span className={styles.editorialCat}>Performa</span>
              </p>
              <h2 className={styles.performanceHeading}>
                Tenaga<br />
                tanpa<br />
                kompromi.
              </h2>
            </Reveal>

            {/* Floating key numbers */}
            <div className={styles.performanceStats}>
              {keyFeatures.length > 0 ? (
                keyFeatures.map((feature, i) => (
                  <Reveal key={feature.id} variant="fade-up" delay={i * 100}>
                    <div className={styles.performanceStat}>
                      <span className={styles.performanceStatTag}>{feature.tag ?? "—"}</span>
                      <span className={styles.performanceStatLabel}>{feature.title}</span>
                    </div>
                  </Reveal>
                ))
              ) : (
                <>
                  <Reveal variant="fade-up">
                    <div className={styles.performanceStat}>
                      <span className={styles.performanceStatTag}>130 kW</span>
                      <span className={styles.performanceStatLabel}>Tenaga</span>
                    </div>
                  </Reveal>
                  <Reveal variant="fade-up" delay={100}>
                    <div className={styles.performanceStat}>
                      <span className={styles.performanceStatTag}>553 km</span>
                      <span className={styles.performanceStatLabel}>Jarak Tempuh</span>
                    </div>
                  </Reveal>
                  <Reveal variant="fade-up" delay={200}>
                    <div className={styles.performanceStat}>
                      <span className={styles.performanceStatTag}>7.1 s</span>
                      <span className={styles.performanceStatLabel}>0–100 km/h</span>
                    </div>
                  </Reveal>
                </>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          08 — TECHNOLOGY — Image-led with feature overlay
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.techSection}>
        <div className={styles.techLayout}>
          {/* Left: main image */}
          <div className={styles.techImageWrap}>
            <Reveal variant="fade-up">
              <CmsModelImage image={model.image_slots?.technology} label="TECHNOLOGY — HMI / SCREEN" ratio="3/4" className={styles.techMainImg} />
            </Reveal>
          </div>

          {/* Right: editorial text + features */}
          <div className={styles.techContent}>
            <Reveal variant="fade-up">
              <p className={styles.editorialLabel}>
                <span className={styles.editorialNum}>07</span>
                <span className={styles.editorialCat}>Teknologi</span>
              </p>
              <h2 className={styles.techHeading}>
                {model.technology.headline || "Kecerdasan built in."}
              </h2>
              {model.technology.subheadline && (
                <p className={styles.techSubheadline}>{model.technology.subheadline}</p>
              )}
            </Reveal>

            {model.technology.features.slice(0, 4).map((feature, i) => (
              <Reveal key={feature.id} variant="fade-up" delay={80 + i * 60}>
                <div className={styles.techFeature}>
                  <span className={styles.techFeatureNum}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    {feature.tag && <p className={styles.techFeatureTag}>{feature.tag}</p>}
                    <p className={styles.techFeatureTitle}>{feature.title}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal variant="fade-up" delay={300}>
              <Button
                as="link"
                href={`/model/${slug}/technology`}
                variant="secondary"
                size="md"
                className={styles.techCta}
              >
                Jelajahi Teknologi →
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          09 — ADAS / SAFETY — Driving image + stat overlay
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.cinematicSection} data-theme="dark">
        <div className={styles.cinematicBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.adas} label="ADAS — DRIVING / SAFETY" ratio="21/9" className={styles.cinematicBgImg} />
          <div className={styles.cinematicOverlay} style={{ opacity: 0.55 }} />
        </div>

        <Container size="wide">
          <div className={styles.adasContent}>
            <Reveal variant="fade-up">
              <p className={styles.editorialLabel}>
                <span className={styles.editorialNum}>08</span>
                <span className={styles.editorialCat}>Keselamatan</span>
              </p>
              <div className={styles.adasStat}>
                <span className={styles.adasStatNumber}>19</span>
                <span className={styles.adasStatUnit}>ADAS</span>
              </div>
              <h2 className={styles.adasHeading}>
                Kecerdasan<br />
                that watches<br />
                ahead.
              </h2>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          10 — COLORS — Interactive carousel
      ══════════════════════════════════════════════════════════════════ */}
      {model.colors.length > 0 && (
        <section className={styles.colorsSection}>
          <div className={styles.colorsSectionHeader}>
            <Reveal variant="fade-up">
              <p className={styles.colorsEyebrow}>Pilihan Warna</p>
              <h2 className={styles.colorsHeading}>Pilih JAECOO Anda</h2>
            </Reveal>
          </div>

          <ColorCarousel colors={model.colors} modelName={model.short_name} />
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          11 — SPECS VISUAL — Key numbers + vehicle image
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.specsSection} data-theme="dark">
        <div className={styles.specsBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.specs_visual} label="SPECS — VEHICLE PROFILE" ratio="16/9" className={styles.specsBgImg} />
          <div className={styles.cinematicOverlay} style={{ opacity: 0.7 }} />
        </div>

        <Container size="wide">
          <div className={styles.specsContent}>
            <Reveal variant="fade-up">
              <p className={styles.editorialLabel}>
                <span className={styles.editorialNum}>09</span>
                <span className={styles.editorialCat}>Spesifikasi</span>
              </p>
              <h2 className={styles.specsHeading}>{model.name}</h2>

              <div className={styles.specsPrice}>
                <PriceDisplay
                  price_status={model.default_variant.price_status}
                  price_idr={model.default_variant.price_idr}
                  price_display={model.default_variant.price_display}
                  price_display_override={model.default_variant.price_display_override}
                  price_region={model.default_variant.price_region}
                  className={styles.specsPriceDisplay}
                />
              </div>
            </Reveal>

            <Reveal variant="fade-up" delay={100}>
              <Button
                as="link"
                href={`/model/${slug}/specifications`}
                variant="ghost"
                size="md"
                className={styles.specsLink}
              >
                Lihat Spesifikasi Lengkap →
              </Button>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          FINANCE CALCULATOR — minimal, tucked between specs and CTA
      ══════════════════════════════════════════════════════════════════ */}
      {priceStatusAllowsCalculator(
        model.default_variant.price_status,
        model.default_variant.price_idr
      ) && (
        <section className={styles.calcSection}>
          <Container size="narrow">
            <Reveal variant="fade-up" threshold={0}>
              <div className={styles.calcHeader}>
                <p className={styles.calcEyebrow}>Simulasi Kredit</p>
                <h2 className={styles.calcHeading}>Hitung cicilan Anda.</h2>
                <p className={styles.calcSub}>
                  Estimasi angsuran dengan bunga flat 10%/tahun.
                  Hubungi kami untuk simulasi resmi.
                </p>
              </div>
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

      {/* ══════════════════════════════════════════════════════════════════
          12 — FINAL CTA — Cinematic end scene
      ══════════════════════════════════════════════════════════════════ */}
      <section className={styles.ctaSection} data-theme="dark">
        <div className={styles.ctaBg} aria-hidden="true">
          <CmsModelImage image={model.image_slots?.final_cta} label="FINAL CTA — CINEMATIC VEHICLE" ratio="16/9" className={styles.ctaBgImg} />
          <div className={styles.cinematicOverlay} style={{ opacity: 0.65 }} />
        </div>

        <Container size="narrow">
          <div className={styles.ctaContent}>
            <Reveal variant="fade-up">
              <p className={styles.ctaEyebrow}>Siap Melangkah Lebih Jauh?</p>
              <h2 className={styles.ctaHeading}>
                Tertarik dengan<br />
                {model.short_name}?
              </h2>
              <p className={styles.ctaBody}>
                Hubungi Alvan untuk harga terkini, jadwal test drive,
                dan penawaran langsung dari dealer resmi JAECOO Palembang.
              </p>
            </Reveal>

            <Reveal variant="fade-up" delay={120}>
              <div className={styles.ctaActions}>
                <Button
                  as="a"
                  href={whatsappCtaUrl}
                  variant="primary"
                  size="lg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chat dengan Alvan →
                </Button>
                <Button
                  as="link"
                  href={`/model/${slug}/technology`}
                  variant="ghost"
                  size="lg"
                >
                  Jelajahi Teknologi
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
