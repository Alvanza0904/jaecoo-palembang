import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/queries";
import { TransparentHeader } from "@/components/layout/TransparentHeader";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { ModelData } from "@/lib/types/model";
import styles from "./model-listing.module.css";

export const revalidate = 0;
export const metadata: Metadata = {
  title: "Model JAECOO Palembang — J5 EV, J7 SHS, J8 Ardis SHS",
  description:
    "Jelajahi lineup JAECOO di Palembang: J5 EV, J7 SHS, dan J8 Ardis SHS. Tiga SUV premium dengan teknologi terdepan.",
  alternates: { canonical: "/model" },
};

/**
 * Display label & layout config per slug.
 * Cinematic text positioning — each model gets its own composition.
 */
const MODEL_CONFIG: Record<
  string,
  {
    displayLabel: string;
    textPosition: "bottom-left" | "center-right" | "center-left";
    ctaLabel: string;
  }
> = {
  "jaecoo-j5-ev": {
    displayLabel: "J5",
    textPosition: "bottom-left",
    ctaLabel: "EXPLORE J5 EV",
  },
  "jaecoo-j7-shs": {
    displayLabel: "J7 SHS",
    textPosition: "center-right",
    ctaLabel: "EXPLORE J7 SHS",
  },
  "jaecoo-j8-shs": {
    displayLabel: "J8 SHS ARDIS",
    textPosition: "center-left",
    ctaLabel: "EXPLORE J8 SHS ARDIS",
  },
};

/**
 * Guaranteed display order J5 → J7 → J8
 */
const SLUG_ORDER: Record<string, number> = {
  "jaecoo-j5-ev": 0,
  "jaecoo-j7-shs": 1,
  "jaecoo-j8-shs": 2,
};

function sortModels(models: ModelData[]): ModelData[] {
  return [...models].sort((a, b) => {
    const ao = SLUG_ORDER[a.slug] ?? 99;
    const bo = SLUG_ORDER[b.slug] ?? 99;
    return ao - bo;
  });
}

function isValidImageSrc(src: string | undefined): boolean {
  if (!src) return false;
  return src.startsWith("http") || src.startsWith("/");
}

export default async function ModelIndexPage() {
  const rawModels = await getModels();
  const models = sortModels(rawModels);

  const wa = buildWhatsAppUrl({
    source: "model_index",
    source_cta: "model_listing_bottom",
  });

  return (
    <>
      <TransparentHeader />

      {/* ── Page Header ───────────────────────────────────────── */}
      <header className={styles.pageHeader}>
        <p className={styles.pageEyebrow}>THE RANGE</p>
        <h1 className={styles.pageTitle}>
          Choose your<br />
          <em>JAECOO.</em>
        </h1>
      </header>

      {/* ── Cinematic Model Sections ──────────────────────────── */}
      <main className={styles.modelList}>
        {models.map((model, idx) => {
          const cfg = MODEL_CONFIG[model.slug] ?? {
            displayLabel: model.short_name,
            textPosition: "bottom-left" as const,
            ctaLabel: `EXPLORE ${model.short_name}`,
          };
          const desktopSrc = model.hero_media?.image?.desktop;
          const mobileSrc = model.hero_media?.image?.mobile ?? desktopSrc;
          const hasImage = isValidImageSrc(desktopSrc);

          return (
            <section
              key={model.slug}
              className={[
                styles.modelSection,
                styles[`pos${cfg.textPosition.replace(/-/g, "_")}`],
              ].join(" ")}
              aria-labelledby={`model-title-${model.slug}`}
            >
              {/* Background image */}
              <div className={styles.imageLayer} aria-hidden="true">
                {hasImage ? (
                  <picture className={styles.modelPicture}>
                    {isValidImageSrc(mobileSrc) && mobileSrc !== desktopSrc && (
                      <source media="(max-width: 767px)" srcSet={mobileSrc} />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className={styles.modelImg}
                      src={desktopSrc}
                      alt=""
                      loading={idx === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </picture>
                ) : (
                  <div className={styles.imageFallback} />
                )}
                <div className={styles.imageOverlay} />
              </div>

              {/* Text content — overlay */}
              <div className={[styles.textBlock, styles[cfg.textPosition.replace(/-/g, "_")]].join(" ")}>
                <p className={styles.modelEyebrow}>
                  JAECOO <span className={styles.modelNumber}>0{idx + 1}</span>
                </p>
                <h2
                  id={`model-title-${model.slug}`}
                  className={styles.modelName}
                >
                  {cfg.displayLabel}
                </h2>
                {model.tagline && (
                  <p className={styles.modelTagline}>{model.tagline}</p>
                )}
                <div className={styles.modelActions}>
                  <a
                    href={`/model/${model.slug}`}
                    className={styles.modelCta}
                    aria-label={cfg.ctaLabel}
                  >
                    {cfg.ctaLabel}
                    <span className={styles.ctaArrow} aria-hidden="true">→</span>
                  </a>
                  <a
                    href={`/model/${model.slug}/specifications`}
                    className={styles.modelCtaGhost}
                    aria-label={`Lihat spesifikasi ${model.name}`}
                  >
                    SPECS
                  </a>
                </div>
              </div>

              {/* Model index number — large decorative */}
              <span className={styles.bgNumber} aria-hidden="true">
                0{idx + 1}
              </span>
            </section>
          );
        })}
      </main>

      {/* ── Bottom CTA ────────────────────────────────────────── */}
      <footer className={styles.bottomCta}>
        <p className={styles.bottomEyebrow}>MAKE IT YOURS</p>
        <h2 className={styles.bottomTitle}>
          Which JAECOO<br />
          <em>is yours?</em>
        </h2>
        <a
          href={wa}
          className={styles.bottomLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Talk to Alvan →
        </a>
      </footer>
    </>
  );
}
