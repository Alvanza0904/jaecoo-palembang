/**
 * JAECOO Palembang — Model Teknologi Page
 * Route: /model/[slug]/technology
 *
 * STEP 7C: Image-Led Cinematic Teknologi.
 *
 * Architecture (cinematic scenes, NOT card grid):
 *   01 HERO — Full-bleed cinematic image, editorial headline overlay
 *   02 INTELLIGENCE — Kokpit / HMI full scene
 *   03 CONNECTIVITY — Smart / digital lifestyle scene
 *   04 SAFETY TECH — ADAS / sensor scene
 *   [N] FEATURE SCENES — Each technology feature as its own cinematic scene
 *   CTA — Dark end scene
 *
 * Text animation: varied per section (mask, slide, scale, fade-up, blur)
 * Section transitions: staggered entrance via IntersectionObserver
 * Respects prefers-reduced-motion.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import type { ResponsiveImage } from "@/lib/types/media";
import type { CSSProperties } from "react";
import styles from "./technology.module.css";

function techFeatureImageStyle(image: ResponsiveImage | undefined): CSSProperties {
  if (!image?.presentation_settings) return {};
  return getBackgroundLayerStyle(
    image.presentation_settings,
    "desktop",
    image.focal_x ?? 50,
    image.focal_y ?? 50,
  ) as CSSProperties;
}

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getModelSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};
  return {
    title: buildPageTitle(`${model.name} — Teknologi`),
    alternates: { canonical: `/model/${slug}/technology` },
    description:
      model.technology.subheadline ??
      `Teknologi terdepan pada ${model.name}.`,
  };
}

export default async function TeknologiPage({ params }: Props) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) notFound();

  const { technology } = model;
  const hasHeroImage = !!(model.hero_media?.image?.desktop);

  const whatsappUrl = buildWhatsAppUrl({
    source: "model_technology",
    source_page: `/model/${slug}/technology`,
    model: model.short_name,
    source_cta: "tech_cta",
  });

  // Split headline into lines for LineReveal
  const headlineLines = (technology.headline || "Intelligence Built In")
    .split(/\s{2,}|\n/)
    .filter(Boolean);
  const singleLineHeadline = headlineLines.length <= 1;

  return (
    <>
      <TransparentHeader />

      {/* ══════════════════════════════════════════════════════════
          01 — TECHNOLOGY HERO — Full cinematic image
      ══════════════════════════════════════════════════════════ */}
      {hasHeroImage ? (
        <LayeredHero
          media={model.hero_media}
          heading={technology.headline}
          subheading={`${model.short_name}`}
          tagline="TECHNOLOGY"
          size="full"
        />
      ) : (
        <section className={styles.heroScene} data-theme="dark">
          {/* Background */}
          <div className={styles.sceneBg} aria-hidden="true">
            <ImagePlaceholder
              label="TECHNOLOGY HERO — INTELLIGENT COCKPIT / EXTERIOR"
              device="desktop"
              ratio="21/9"
              source="Admin → Media Library"
              className={styles.sceneBgImg}
            />
            <div className={styles.sceneBgImgMobile}>
              <ImagePlaceholder
                label="TECHNOLOGY HERO — MOBILE"
                device="mobile"
                ratio="9/16"
                source="Admin → Media Library"
                className={styles.sceneBgImg}
              />
            </div>
            <div className={styles.sceneOverlay} />
          </div>

          {/* Editorial text */}
          <div className={styles.heroContent}>
            <Reveal variant="fade-up" delay={100}>
              <p className={styles.sceneEyebrow}>
                <span className={styles.eyebrowLine} />
                <span>Teknologi</span>
              </p>
            </Reveal>

            {singleLineHeadline ? (
              <Reveal variant="mask" delay={200}>
                <h1 className={styles.heroHeading}>
                  {technology.headline || "Intelligence\nBuilt In."}
                </h1>
              </Reveal>
            ) : (
              <LineReveal
                lines={headlineLines}
                tag="h1"
                delay={220}
                staggerMs={130}
                className={styles.heroHeadingLine}
                lineClassName={styles.heroHeading}
              />
            )}

            {technology.subheadline && (
              <Reveal variant="fade-up" delay={480}>
                <p className={styles.heroSubheadline}>{technology.subheadline}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          02 — INTELLIGENCE SCENE — HMI / Smart Kokpit
          Full-bleed dark scene, text overlays bottom-left
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.cinematicScene} data-theme="dark">
        <div className={styles.sceneBg} aria-hidden="true">
          <ImagePlaceholder
            label="TECHNOLOGY — INTELLIGENT COCKPIT / DISPLAY SCREEN"
            device="desktop"
            ratio="16/9"
            source="Admin → Media Library"
            className={styles.sceneBgImg}
          />
          <div className={styles.sceneBgImgMobile}>
            <ImagePlaceholder
              label="TECHNOLOGY — HMI MOBILE"
              device="mobile"
              ratio="3/4"
              source="Admin → Media Library"
              className={styles.sceneBgImg}
            />
          </div>
          <div className={styles.sceneOverlay} data-gradient="bottom" />
        </div>

        <div className={styles.sceneContent} data-position="bottom-left">
          <Reveal variant="slide-left" delay={0}>
            <p className={styles.sceneEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>Kecerdasan</span>
            </p>
          </Reveal>
          <LineReveal
            lines={["SMART", "BY DESIGN."]}
            tag="h2"
            delay={120}
            staggerMs={110}
            lineClassName={styles.cinematicHeading}
          />
          <Reveal variant="fade-up" delay={420}>
            <p className={styles.sceneSupportText}>
              Antarmuka digital {model.short_name} dirancang untuk memahami pengemudi
              — bukan sebaliknya. Kontrol intuitif, layar lebar,
              respons yang akurat.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          03 — TECHNOLOGY FEATURES — Each feature as a cinematic scene
          Alternating: image-left/text-right, then image-right/text-left
      ══════════════════════════════════════════════════════════ */}
      {technology.features.map((feature, i) => {
        const isEven = i % 2 === 0;
        const textVariants = ["scale", "fade-up", "slide-right", "slide-left", "blur", "fade-down"] as const;
        const imgVariants  = ["fade-up", "scale", "slide-left", "slide-right", "fade-up", "scale"] as const;
        const textVariant  = textVariants[i % textVariants.length];
        const imgVariant   = imgVariants[i % imgVariants.length];

        return (
          <section
            key={feature.id}
            className={[
              styles.featureScene,
              i % 2 === 0 ? styles.featureSceneLight : styles.featureSceneDark,
            ].join(" ")}
            data-theme={i % 2 === 0 ? undefined : "dark"}
          >
            {/* Split layout: image + text */}
            <div
              className={[
                styles.featureLayout,
                isEven ? styles.featureLayoutImgLeft : styles.featureLayoutImgRight,
              ].join(" ")}
            >
              {/* Image side */}
              <div className={styles.featureImageWrap}>
                <Reveal variant={imgVariant} threshold={0.08}>
                  {feature.media?.image?.desktop ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={feature.media.image.desktop}
                      alt={feature.media.image.alt ?? feature.title}
                      className={styles.featureImg}
                      style={techFeatureImageStyle(feature.media.image)}
                    />
                  ) : (
                    <ImagePlaceholder
                      label={`TECHNOLOGY — ${(feature.tag ?? feature.title).toUpperCase()}`}
                      ratio="4/3"
                      source="Admin → Media Library"
                      className={styles.featureImg}
                    />
                  )}
                </Reveal>
              </div>

              {/* Text side */}
              <div className={styles.featureTextWrap}>
                <Reveal variant={textVariant} delay={60} threshold={0.1}>
                  <p className={styles.featureEyebrow}>
                    <span className={styles.eyebrowNum}>{String(i + 1).padStart(2, "0")}</span>
                    {feature.tag && (
                      <span className={styles.eyebrowTag}>{feature.tag}</span>
                    )}
                  </p>
                </Reveal>

                <Reveal variant="fade-up" delay={140} threshold={0.1}>
                  <h2 className={styles.featureHeading}>{feature.title}</h2>
                </Reveal>

                <Reveal variant="fade-up" delay={240} threshold={0.1}>
                  <p className={styles.featureBody}>{feature.description}</p>
                </Reveal>
              </div>
            </div>
          </section>
        );
      })}

      {/* ══════════════════════════════════════════════════════════
          04 — CONNECTIVITY SCENE — Smart connectivity / voice
          Only shown if there are 0 features (fallback cinematic scene)
      ══════════════════════════════════════════════════════════ */}
      {technology.features.length === 0 && (
        <>
          <section className={styles.cinematicScene} data-theme="dark">
            <div className={styles.sceneBg} aria-hidden="true">
              <ImagePlaceholder
                label="TECHNOLOGY — VOICE / CONNECTIVITY / DIGITAL INTERFACE"
                device="desktop"
                ratio="16/9"
                source="Admin → Media Library"
                className={styles.sceneBgImg}
              />
              <div className={styles.sceneOverlay} data-gradient="left" />
            </div>

            <div className={styles.sceneContent} data-position="center-right">
              <Reveal variant="fade-down" delay={0}>
                <p className={styles.sceneEyebrow}>
                  <span className={styles.eyebrowLine} />
                  <span>Konektivitas</span>
                </p>
              </Reveal>
              <Reveal variant="scale" delay={140}>
                <h2 className={styles.cinematicHeading}>
                  Always<br />connected.
                </h2>
              </Reveal>
              <Reveal variant="fade-up" delay={340}>
                <p className={styles.sceneSupportText}>
                  Tetap terhubung dengan dunia di sekitar Anda — navigasi,
                  musik, dan kendali kendaraan cerdas dalam satu antarmuka.
                </p>
              </Reveal>
            </div>
          </section>

          <section className={styles.cinematicScene} data-theme="dark">
            <div className={styles.sceneBg} aria-hidden="true">
              <ImagePlaceholder
                label="TECHNOLOGY — DRIVER ASSISTANCE / ADAS / SENSORS"
                device="desktop"
                ratio="16/9"
                source="Admin → Media Library"
                className={styles.sceneBgImg}
              />
              <div className={styles.sceneOverlay} data-gradient="top" />
            </div>

            <div className={styles.sceneContent} data-position="bottom-right">
              <Reveal variant="slide-right" delay={0}>
                <p className={styles.sceneEyebrow}>
                  <span className={styles.eyebrowLine} />
                  <span>Keselamatan</span>
                </p>
              </Reveal>
              <LineReveal
                lines={["TECHNOLOGY", "THAT SEES AHEAD."]}
                tag="h2"
                delay={120}
                staggerMs={110}
                lineClassName={styles.cinematicHeading}
              />
              <Reveal variant="fade-up" delay={420}>
                <p className={styles.sceneSupportText}>
                  Sensor dan kamera canggih bekerja diam-diam —
                  memindai, memperingatkan, dan melindungi
                  setiap perjalanan Anda.
                </p>
              </Reveal>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          05 — STAT STRIP — Key technology numbers
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.statStrip}>
        <div className={styles.statStripInner}>
          {[
            { value: "19", label: "ADAS Features", unit: "+" },
            { value: "12.3″", label: "Display Utama", unit: "" },
            { value: "5G", label: "Connectivity", unit: "" },
            { value: "360°", label: "Camera System", unit: "" },
          ].map((stat, i) => (
            <Reveal key={i} variant="fade-down" delay={i * 80} threshold={0.1}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {stat.value}
                  {stat.unit && <span className={styles.statUnit}>{stat.unit}</span>}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          06 — FINAL CTA — Dark cinematic end
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.ctaScene} data-theme="dark">
        <div className={styles.sceneBg} aria-hidden="true">
          <ImagePlaceholder
            label="TECHNOLOGY CTA — VEHICLE / DRAMATIC ANGLE"
            device="desktop"
            ratio="21/9"
            source="Admin → Media Library"
            className={styles.sceneBgImg}
          />
          <div className={styles.sceneOverlay} data-gradient="center" style={{ opacity: 0.75 }} />
        </div>

        <div className={styles.ctaContent}>
          <Reveal variant="mask" threshold={0.15}>
            <p className={styles.ctaEyebrow}>{model.short_name}</p>
          </Reveal>
          <Reveal variant="scale" delay={160} threshold={0.15}>
            <h2 className={styles.ctaHeading}>
              Rasakan sendiri<br />
              teknologinya.
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={320} threshold={0.15}>
            <p className={styles.ctaBody}>
              Jadwalkan test drive eksklusif dan buktikan
              perbedaan {model.short_name} secara langsung.
            </p>
          </Reveal>
          <Reveal variant="fade-up" delay={460} threshold={0.15}>
            <div className={styles.ctaButtons}>
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
              <Button
                as="link"
                href={`/model/${slug}/specifications`}
                variant="ghost"
                size="lg"
              >
                Spesifikasi Lengkap
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          NAV — Sebelumnya / Berikutnya navigation
      ══════════════════════════════════════════════════════════ */}
      <nav className={styles.pageNav} aria-label="Model navigation">
        <Button as="link" href={`/model/${slug}`} variant="ghost" size="md">
          ← {model.short_name} Overview
        </Button>
        <Button as="link" href={`/model/${slug}/specifications`} variant="secondary" size="md">
          Spesifikasi Lengkap →
        </Button>
      </nav>
    </>
  );
}
