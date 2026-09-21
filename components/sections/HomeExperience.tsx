/**
 * JAECOO Palembang — HomeExperience Sections
 * Image-led editorial homepage sections.
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import type { ModelData } from "@/lib/types/model";
import type { Promo } from "@/lib/types/promo";
import type { NewsData } from "@/lib/types/news";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { ResponsiveImage } from "@/lib/types/media";
import { getBackgroundLayerStyle, resolveBreakpointSettings, getTypographyContainerStyle, getHeadingStyle, getSubheadingStyle } from "@/lib/types/presentation";
import { formatDate } from "@/lib/utils/format";
import styles from "./HomeExperience.module.css";

function visualMediaStyle(image: ResponsiveImage | undefined, breakpoint: 'desktop' | 'mobile'): CSSProperties {
  if (!image?.presentation_settings) return {};
  const key = breakpoint === 'desktop' ? 'desktop' : 'mobile';
  const settings = breakpoint === 'mobile'
    ? (image.presentation_settings_mobile ?? image.presentation_settings)
    : image.presentation_settings;
  if (!settings) return {};
  return getBackgroundLayerStyle(settings, key, image.focal_x ?? 50, image.focal_y ?? 50);
}

function VisualImage({
  image,
  alt,
  className,
}: {
  image?: ResponsiveImage;
  alt: string;
  className: string;
}) {
  if (!image?.desktop && !image?.mobile) {
    return <div className={`${styles.mediaFallback} ${className}`} aria-hidden="true" />;
  }

  const desktopStyle = visualMediaStyle(image, 'desktop');
  const mobileStyle = visualMediaStyle(image, 'mobile');
  const style = {
    ...desktopStyle,
    '--visual-mobile-fit': mobileStyle.objectFit,
    '--visual-mobile-position': mobileStyle.objectPosition,
    '--visual-mobile-transform': mobileStyle.transform,
    '--visual-mobile-origin': mobileStyle.transformOrigin,
  } as CSSProperties;

  return (
    <picture>
      {image.mobile && <source media="(max-width: 767px)" srcSet={image.mobile} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.desktop ?? image.mobile ?? ''}
        alt={alt}
        className={`${className} ${styles.visualMedia}`}
        loading="lazy"
        decoding="async"
        style={style}
      />
    </picture>
  );
}


function visualTypographyStyles(image: ResponsiveImage | undefined, breakpoint: 'desktop' | 'mobile') {
  if (!image?.presentation_settings) return null;
  const key = breakpoint === 'desktop' ? 'desktop' : 'mobile';
  const settings = breakpoint === 'mobile'
    ? (image.presentation_settings_mobile ?? image.presentation_settings)
    : image.presentation_settings;
  if (!settings) return null;
  const effective = resolveBreakpointSettings(
    settings,
    key,
    image.focal_x ?? 50,
    image.focal_y ?? 50,
  );
  return {
    container: getTypographyContainerStyle(effective.typography),
    heading: getHeadingStyle(effective.typography),
    subheading: getSubheadingStyle(effective.typography),
  };
}

function VisualCopy({
  image,
  title,
  description,
  titleId,
  eyebrow,
  className,
  titleClassName,
  descriptionClassName,
}: {
  image?: ResponsiveImage;
  title: string;
  description: string;
  titleId: string;
  eyebrow: string;
  className: string;
  titleClassName: string;
  descriptionClassName: string;
}) {
  const desktop = visualTypographyStyles(image, 'desktop');
  const mobile = visualTypographyStyles(image, 'mobile');
  const containerStyle = desktop?.container ?? undefined;
  const style = containerStyle ? ({
    ...containerStyle,
    '--visual-mobile-left': mobile?.container.left,
    '--visual-mobile-top': mobile?.container.top,
    '--visual-mobile-width': mobile?.container.width,
    '--visual-mobile-align': mobile?.container.textAlign,
  } as CSSProperties) : undefined;

  return (
    <div className={className} style={style}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h2 id={titleId} className={titleClassName} style={desktop?.heading}>{title}</h2>
      <p className={descriptionClassName} style={desktop?.subheading}>{description}</p>
    </div>
  );
}

// Kept for fallback
export function HomeJarakTempuh({ models }: { models: ModelData[] }) {
  return (
    <section className={styles.range} id="range" aria-labelledby="range-title">
      <div>
        {models.map((model) => (
          <Link href={`/model/${model.slug}`} key={model.slug}>
            <h3>{model.name}</h3>
            <PriceDisplay
              price_status={model.default_variant.price_status}
              price_idr={model.default_variant.price_idr}
              price_display={model.default_variant.price_display}
              price_display_override={model.default_variant.price_display_override}
              price_region={model.default_variant.price_region}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Experience ──────────────────────────────────────────────
export function HomeExperienceSection({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string };
}) {
  return (
    <section className={styles.experience} aria-labelledby="experience-title">
      {image?.desktop || image?.mobile ? (
        <VisualImage image={image} alt="" className={styles.experienceMedia} />
      ) : (
        <div className={styles.experienceMedia} aria-hidden="true" />
      )}
      <VisualCopy
        image={image}
        className={styles.experienceCopy}
        titleClassName={styles.experienceTitle}
        descriptionClassName={styles.experienceDesc}
        titleId="experience-title"
        eyebrow="Pengalaman Berkendara"
        title={cms?.title || "Pengalaman\nTanpa Kompromi."}
        description={cms?.description || "Kenyamanan premium di setiap medan. Dirancang untuk mereka yang berani menjelajah batas."}
      />
      <Link className={styles.textLink} href="/berita" style={visualTypographyStyles(image, 'desktop') ? { position: 'absolute', zIndex: 2, left: visualTypographyStyles(image, 'desktop')!.container.left, top: `calc(${visualTypographyStyles(image, 'desktop')!.container.top} + 42%)` } : undefined}>Lihat Informasi →</Link>
    </section>
  );
}

// ── Teknologi ──────────────────────────────────────────────
export function HomeTeknologiSection({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string };
}) {
  return (
    <section className={styles.technology} aria-labelledby="technology-title">
      {image?.desktop || image?.mobile ? (
        <VisualImage image={image} alt="" className={styles.technologyMedia} />
      ) : (
        <div className={styles.technologyMedia} aria-hidden="true" />
      )}
      <VisualCopy
        image={image}
        className={styles.technologyCopy}
        titleClassName={styles.technologyTitle}
        descriptionClassName={styles.technologyDesc}
        titleId="technology-title"
        eyebrow="Teknologi"
        title={cms?.title || "Teknologi\nCerdas."}
        description={cms?.description || "Sistem SHS dan ARDIS terdepan di kelasnya — merevolusi pengalaman berkendara off-road dan EV range."}
      />
    </section>
  );
}

// ── Promo ───────────────────────────────────────────────────
export function HomePromoSection({ promos }: { promos: Promo[] }) {
  if (!promos.length) return null;
  return (
    <section className={styles.promo} aria-labelledby="promo-title">
      <div className={styles.promoInner}>
        <div className={styles.promoHeader}>
          <span className={styles.eyebrow}>Penawaran</span>
          <h2 id="promo-title" className={styles.promoTitle}>Penawaran Terkini</h2>
        </div>
        <div className={styles.promoGrid}>
          {promos.slice(0, 3).map((promo) => (
            <Link key={promo.id} href={`/promo/${promo.slug}`} className={styles.promoCard}>
              {promo.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className={styles.promoCardImg}
                  loading="lazy"
                />
              )}
              <p className={styles.promoCardEyebrow}>{promo.promo_type || "Promo"}</p>
              <h3 className={styles.promoCardTitle}>{promo.title}</h3>
              <p className={styles.promoCardDesc}>{promo.short_description ?? ""}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── About ───────────────────────────────────────────────────
export function HomeAboutSection({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string };
}) {
  return (
    <section className={styles.about} aria-labelledby="about-title">
      <div className={styles.aboutInner}>
        <VisualImage image={image} alt="OMODA JAECOO Palembang — Dealer Resmi" className={styles.aboutMedia} />
        <div className={styles.aboutCopy}>
          <span className={styles.eyebrow}>Dealer Resmi</span>
          <h2 id="about-title" className={styles.aboutTitle}>
            {cms?.title || "OMODA JAECOO\nPalembang."}
          </h2>
          <p className={styles.aboutDesc}>
            {cms?.description || "Dealer resmi OMODA JAECOO Palembang — menghadirkan lineup SUV premium terbaru. Dari konsultasi hingga test drive, kami hadir untuk Anda."}
          </p>
          <Link href="/sales-jaecoo-palembang" className={styles.aboutLink}>Hubungi Alvan →</Link>
        </div>
      </div>
    </section>
  );
}

// ── Journal ─────────────────────────────────────────────────
export function HomeJournalSection({ news }: { news: NewsData[] }) {
  return (
    <section className={styles.journal} aria-labelledby="journal-title">
      <div className={styles.journalInner}>
        <div className={styles.journalHeader}>
          <h2 id="journal-title" className={styles.journalTitle}>Berita & Informasi JAECOO</h2>
          <Link href="/berita" className={styles.textLink}>Lihat semua →</Link>
        </div>

        {!news.length ? (
          <p className={styles.journalEmpty}>Belum ada artikel.</p>
        ) : (
          <div className={styles.journalGrid}>
            {news.map((item) => (
              <Link key={item.id} href={`/berita/${item.slug}`} className={styles.newsCard}>
                {item.cover?.desktop && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.cover.desktop}
                    alt={item.cover.alt ?? item.title}
                    className={styles.newsCardImg}
                    loading="lazy"
                  />
                )}
                <div className={styles.newsCardBody}>
                  <div className={styles.newsCardMeta}>
                    <span className={styles.newsCardCat}>{item.category}</span>
                    <span className={styles.newsCardDate}>{formatDate(item.published_at)}</span>
                  </div>
                  <h3 className={styles.newsCardTitle}>{item.title}</h3>
                  <p className={styles.newsCardExcerpt}>{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Final CTA ───────────────────────────────────────────────
export function HomeFinalCTA({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string; ctaText?: string; ctaUrl?: string };
}) {
  const wa = buildWhatsAppUrl({ source: "homepage_final_cta", source_cta: "final_cta" });
  return (
    <section className={styles.finalCta} aria-labelledby="final-cta-title">
      {image?.desktop && <VisualImage image={image} alt="" className={styles.finalCtaImg} />}
      <div className={styles.finalCtaOverlay} aria-hidden="true" />
      <div className={styles.finalCtaInner}>
        <span className={styles.finalCtaEyebrow}>JAECOO Palembang</span>
        <h2 id="final-cta-title" className={styles.finalCtaTitle}>
          {cms?.title || "Siap memulai perjalanan Anda?"}
        </h2>
        <p className={styles.finalCtaDesc}>
          {cms?.description || "Hubungi Alvan sekarang untuk konsultasi gratis, test drive, dan penawaran eksklusif."}
        </p>
        <Button
          as="a"
          href={cms?.ctaUrl || wa}
          variant="primary"
          size="lg"
          target="_blank"
          rel="noopener noreferrer"
        >
          {cms?.ctaText || "Chat dengan Alvan →"}
        </Button>
      </div>
    </section>
  );
}
