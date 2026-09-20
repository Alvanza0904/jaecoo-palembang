/**
 * JAECOO Palembang — HomeExperience Sections
 * Image-led editorial homepage sections.
 */

import Link from "next/link";
import type { ModelData } from "@/lib/types/model";
import type { Promo } from "@/lib/types/promo";
import type { NewsData } from "@/lib/types/news";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { ResponsiveImage } from "@/lib/types/media";
import { formatDate } from "@/lib/utils/format";
import styles from "./HomeExperience.module.css";

function Media({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  if (!src || (!src.startsWith("http://") && !src.startsWith("https://"))) {
    return <div className={`${styles.mediaFallback} ${className}`} aria-hidden="true" />;
  }
  return (
    <div className={`${styles.media} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" />
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
      <Media
        src={image?.desktop}
        alt="JAECOO — Premium SUV Experience"
        className={styles.experienceMedia}
      />
      <div className={styles.experienceCopy}>
        <span className={styles.eyebrow}>Pengalaman Berkendara</span>
        <h2 id="experience-title" className={styles.experienceTitle}>
          {cms?.title || "Pengalaman\nTanpa Kompromi."}
        </h2>
        <p className={styles.experienceDesc}>
          {cms?.description || "Kenyamanan premium di setiap medan. Dirancang untuk mereka yang berani menjelajah batas."}
        </p>
        <Link className={styles.textLink} href="/berita">Lihat Informasi →</Link>
      </div>
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
      <Media
        src={image?.desktop}
        alt="JAECOO — Advanced Teknologi"
        className={styles.technologyMedia}
      />
      <div className={styles.technologyCopy}>
        <span className={styles.eyebrow}>Teknologi</span>
        <h2 id="technology-title" className={styles.technologyTitle}>
          {cms?.title || "Teknologi\nCerdas."}
        </h2>
        <p className={styles.technologyDesc}>
          {cms?.description || "Sistem SHS dan ARDIS terdepan di kelasnya — merevolusi pengalaman berkendara off-road dan EV range."}
        </p>
      </div>
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
        <Media
          src={image?.desktop}
          alt="OMODA JAECOO Palembang — Dealer Resmi"
          className={styles.aboutMedia}
        />
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
      {image?.desktop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.desktop}
          alt=""
          className={styles.finalCtaImg}
          aria-hidden="true"
          loading="lazy"
        />
      )}
      <div className={styles.finalCtaOverlay} aria-hidden="true" />
      <div className={styles.finalCtaInner}>
        <span className={styles.finalCtaEyebrow}>JAECOO Palembang</span>
        <h2 id="final-cta-title" className={styles.finalCtaTitle}>
          {cms?.title || "Siap memulai perjalanan Anda?"}
        </h2>
        <p className={styles.finalCtaDesc}>
          {cms?.description || "Hubungi Alvan sekarang untuk konsultasi gratis, test drive, dan penawaran eksklusif."}
        </p>
        <Button as="a" href={wa} variant="primary" size="lg" target="_blank" rel="noopener noreferrer">
          Chat dengan Alvan →
        </Button>
      </div>
    </section>
  );
}
