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
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getModelBySlug, getModelSlugs } from "@/lib/supabase/queries";
import { getModelBySlug as getStaticModelBySlug } from "@/lib/data/models";
import { Button } from "@/components/ui/Button";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/motion/Reveal";
import { LineReveal } from "@/components/motion/LineReveal";
import { LayeredHero } from "@/components/hero/LayeredHero";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { J7ShsExploreCta } from "@/components/model/J7ShsExploreCta";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { buildPageTitle } from "@/lib/utils/seo";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import type { ModelData, ModelFeature } from "@/lib/types/model";
import type { ResponsiveImage } from "@/lib/types/media";
import styles from "./technology.module.css";

function TechSceneImage({
  image,
  label,
  ratio,
  className,
}: {
  image?: ResponsiveImage;
  label: string;
  ratio: string;
  className?: string;
}) {
  const src = image?.desktop ?? image?.tablet ?? image?.mobile;
  if (!src) {
    return (
      <ImagePlaceholder
        label={label}
        ratio={ratio}
        source="Admin → Media Library"
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={image?.alt || label} className={className} />
  );
}

/** Compute presentation_settings style for a feature image (same pattern as Hero). */
function featureImageStyle(image: ResponsiveImage | undefined): CSSProperties {
  if (!image?.presentation_settings) return {};
  return getBackgroundLayerStyle(
    image.presentation_settings,
    "desktop",
    image.focal_x ?? 50,
    image.focal_y ?? 50,
  );
}

interface Props { params: Promise<{ slug: string }> }

function hasText(feature: ModelFeature) {
  return Boolean((feature.title || feature.description || "").trim());
}

/**
 * Technology page reads model.technology (Admin → model_content.section = technology).
 * It does not reuse exterior/interior overview scenes.
 * J7 SIVP keeps the shared SHS specification sheet, and this page is where
 * Super Intelligent Valet Parking, LiDAR, and the 27-sensor suite are shown.
 */
function technologyFeatures(model: ModelData): ModelFeature[] {
  let features = (model.technology.features ?? []).filter(hasText);

  if (model.slug === "jaecoo-j7-sivp") {
    const blob = features.map((feature) => `${feature.title} ${feature.description} ${feature.tag ?? ""}`).join(" ");
    if (!/lidar|valet|sivp|27/i.test(blob)) {
      const differentiators = (getStaticModelBySlug("jaecoo-j7-sivp")?.technology.features ?? [])
        .filter((feature) => /lidar|valet|sensor|sivp|ruang|pilih/i.test(`${feature.title} ${feature.description} ${feature.tag ?? ""}`));
      features = [...differentiators, ...features];
    }
  }

  if (features.length > 0) return features;

  const built: ModelFeature[] = [];
  const adas = model.page_copy?.adas;
  if (adas?.heading || adas?.body) {
    built.push({
      id: `${model.slug}-adas`,
      tag: adas.label || "ADAS",
      title: (adas.heading || "Bantuan pengemudi").replace(/\n/g, " "),
      description: adas.body || [adas.stat, adas.unit].filter(Boolean).join(" "),
    });
  }
  const cockpit = model.page_copy?.cockpit;
  if (cockpit?.heading || cockpit?.body) {
    built.push({
      id: `${model.slug}-drive`,
      tag: cockpit.label || "Berkendara",
      title: (cockpit.heading || "Teknologi berkendara").replace(/\n/g, " "),
      description: cockpit.body || "",
    });
  }
  const performance = model.page_copy?.performance;
  if (performance?.heading || (model.highlights?.length ?? 0) > 0) {
    built.push({
      id: `${model.slug}-performance`,
      tag: performance?.label || "Performa",
      title: (performance?.heading || "Performa").replace(/\n/g, " "),
      description: (model.highlights ?? []).map((item) => `${item.value} ${item.label}`).join(" · "),
    });
  }
  return built.filter(hasText);
}

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

  const scene = model.page_copy?.tech_intelligence;
  const sceneHeading = (scene?.heading || "SMART\nBY DESIGN.").split("\n").filter(Boolean);
  const techStats = model.page_copy?.tech_stats?.length
    ? model.page_copy.tech_stats
    : (model.highlights ?? []);
  const close = model.page_copy?.tech_close;
  const closeHeading = (close?.heading || "Rasakan sendiri\nteknologinya.").split("\n");
  const closeBody = close?.body || `Jadwalkan test drive eksklusif dan buktikan perbedaan ${model.short_name} secara langsung.`;
  const closePrimary = close?.primary_label || "Jadwalkan Test Drive →";
  const closeSecondary = close?.secondary_label || "Spesifikasi Lengkap";
  const features = technologyFeatures(model);

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
          heroSection: negative margin-top cancels ModelNavigation height (48px)
          so the hero fills the full viewport.
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.heroSection}>
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
      </div>

      {/* ══════════════════════════════════════════════════════════
          02 — INTELLIGENCE SCENE — HMI / Smart Kokpit
          Full-bleed dark scene, text overlays bottom-left
      ══════════════════════════════════════════════════════════ */}
      <section className={styles.cinematicScene} data-theme="dark">
        <div className={styles.sceneBg} aria-hidden="true">
          <TechSceneImage
            image={model.image_slots?.tech_intelligence ?? model.image_slots?.technology}
            label="TECHNOLOGY — INTELLIGENT COCKPIT / DISPLAY SCREEN"
            ratio="16/9"
            className={styles.sceneBgImg}
          />
          <div className={styles.sceneOverlay} data-gradient="bottom" />
        </div>

        <div className={styles.sceneContent} data-position="bottom-left">
          <Reveal variant="slide-left" delay={0}>
            <p className={styles.sceneEyebrow}>
              <span className={styles.eyebrowLine} />
              <span>{scene?.label || "Kecerdasan"}</span>
            </p>
          </Reveal>
          <LineReveal
            lines={sceneHeading}
            tag="h2"
            delay={120}
            staggerMs={110}
            lineClassName={styles.cinematicHeading}
          />
          <Reveal variant="fade-up" delay={420}>
            <p className={styles.sceneSupportText}>
              {scene?.body || `Antarmuka dan fitur ${model.short_name} mengikuti data model ini — bukan salinan model lain.`}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          03 — TECHNOLOGY FEATURES — Each feature as a cinematic scene
          Alternating: image-left/text-right, then image-right/text-left
      ══════════════════════════════════════════════════════════ */}
      {features.map((feature, i) => {
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
                      style={featureImageStyle(feature.media.image)}
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
      {features.length === 0 && technology.subheadline && (
        <section className={styles.cinematicScene} data-theme="dark" data-section-transition>
          <div className={styles.sceneContent} data-position="bottom-left">
            <Reveal variant="fade-up">
              <p className={styles.sceneSupportText}>{technology.subheadline}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════
          05 — STAT STRIP — Key technology numbers
      ══════════════════════════════════════════════════════════ */}
      {techStats.length > 0 && (
      <section className={styles.statStrip}>
        <div className={styles.statStripInner}>
          {techStats.map((stat, i) => (
            <Reveal key={`${stat.label}-${stat.value}`} variant="fade-down" delay={i * 80} threshold={0.1}>
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
      )}

      {model.specifications.length > 0 && (
        <section className={styles.specBand} data-section-transition>
          <div className={styles.specInner}>
            <Reveal variant="fade-up">
              <p className={styles.specEyebrow}>Spesifikasi</p>
              <h2 className={styles.specHeading}>
                {model.slug === "jaecoo-j7-sivp" ? "Basis yang sama dengan J7 SHS." : "Angka teknis."}
              </h2>
              {model.slug === "jaecoo-j7-sivp" && (
                <p className={styles.specNote}>
                  Spesifikasi kendaraan mengikuti J7 SHS. Yang membedakan SIVP adalah Super Intelligent Valet Parking, LiDAR, dan 27 sensor.
                </p>
              )}
            </Reveal>
            <div className={styles.specGrid}>
              {model.specifications.map((category) => (
                <div key={category.label} className={styles.specCategory}>
                  <h3 className={styles.specCategoryTitle}>{category.label}</h3>
                  <dl className={styles.specList}>
                    {category.specs.map((spec) => (
                      <div key={`${category.label}-${spec.label}`} className={styles.specRow}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {slug === "jaecoo-j7-sivp" && <J7ShsExploreCta />}
      <section className={styles.ctaScene} data-theme="dark">
        <div className={styles.sceneBg} aria-hidden="true">
          <TechSceneImage
            image={model.image_slots?.tech_cta ?? model.image_slots?.final_cta}
            label="TECHNOLOGY CTA — VEHICLE / DRAMATIC ANGLE"
            ratio="21/9"
            className={styles.sceneBgImg}
          />
          <div className={styles.sceneOverlay} data-gradient="center" style={{ opacity: 0.75 }} />
        </div>

        <div className={styles.ctaContent}>
          <Reveal variant="mask" threshold={0.15}>
            <p className={styles.ctaEyebrow}>{close?.label || model.short_name}</p>
          </Reveal>
          <Reveal variant="scale" delay={160} threshold={0.15}>
            <h2 className={styles.ctaHeading}>
              {closeHeading.map((line, index) => (
                <span key={`${line}-${index}`}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h2>
          </Reveal>
          <Reveal variant="fade-up" delay={320} threshold={0.15}>
            <p className={styles.ctaBody}>{closeBody}</p>
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
                {closePrimary}
              </Button>
              <Button
                as="link"
                href={`/model/${slug}/specifications`}
                variant="ghost"
                size="lg"
              >
                {closeSecondary}
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
