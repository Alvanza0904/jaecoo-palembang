/**
 * JAECOO Palembang — HomeExperience Sections
 *
 * STEP 8: Image-led visual language throughout.
 * STEP 8.7: CMS optional props added — all fallback to existing hardcoded text.
 *           No breaking changes. Pass `cms` prop from page.tsx to enable CMS text.
 */

import Link from "next/link";
import type { ModelData } from "@/lib/types/model";
import type { PromoData } from "@/lib/types/promo";
import type { NewsData } from "@/lib/types/news";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import type { ResponsiveImage } from "@/lib/types/media";
import styles from "./HomeExperience.module.css";

function Media({ src, alt, className = "" }: { src?: string | null; alt: string; className?: string }) {
  if (!src || (!src.startsWith("http://") && !src.startsWith("https://"))) {
    return <div className={`${styles.mediaFallback} ${className}`} aria-hidden="true" />;
  }
  return (
    <div className={`${styles.media} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

// ─── HomeRange — kept as fallback but hidden when slider is shown ────────────
export function HomeRange({ models }: { models: ModelData[] }) {
  return (
    <section className={styles.range} id="range" aria-labelledby="range-title">
      <div className={styles.rangeIntro}>
        <p className={styles.eyebrow}>JAECOO RANGE</p>
        <h2 id="range-title">Three models.<br /><em>One philosophy.</em></h2>
        <p>Performance, technology, and design — expressed through three distinct SUV experiences.</p>
      </div>

      <div className={styles.rangeList}>
        {models.map((model, index) => (
          <Link href={`/model/${model.slug}`} className={styles.rangeItem} key={model.slug}>
            <div className={styles.rangeIndex}>0{index + 1}</div>
            <div className={styles.rangeVisual}>
              <Media src={model.hero_media.image.desktop} alt={model.name} />
              <span className={styles.rangeModel}>{model.short_name}</span>
            </div>
            <div className={styles.rangeCopy}>
              <p className={styles.rangeTagline}>{model.tagline}</p>
              <h3>{model.name}</h3>
              <p>{model.description}</p>
              <div className={styles.rangeBottom}>
                <PriceDisplay
                  price_status={model.default_variant.price_status}
                  price_idr={model.default_variant.price_idr}
                  price_display={model.default_variant.price_display}
                  price_display_override={model.default_variant.price_display_override}
                  price_region={model.default_variant.price_region}
                />
                <span className={styles.arrow}>Explore ↗</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── HomeExperienceSection ───────────────────────────────────────────────────
export function HomeExperienceSection({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string };
}) {
  return (
    <section className={styles.experience} aria-labelledby="experience-title">
      <div className={styles.experienceBg} aria-hidden="true">
        {image?.desktop && (
          // eslint-disable-next-line @next/next/no-img-element
          <picture>{image.mobile && <source media="(max-width: 767px)" srcSet={image.mobile} />}<img src={image.desktop} alt="" loading="lazy" /></picture>
        )}
      </div>
      <div className={styles.experienceInner}>
        <div className={styles.experienceHead}>
          <p className={styles.eyebrow}>THE JAECOO EXPERIENCE</p>
          {cms?.title ? (
            <h2 id="experience-title">{cms.title}</h2>
          ) : (
            <h2 id="experience-title">Designed around<br /><em>the way you move.</em></h2>
          )}
          {cms?.description && <p>{cms.description}</p>}
        </div>
        <div className={styles.experiencePillars}>
          <div className={styles.pillar}>
            <span className={styles.pillarLabel}>GO FURTHER</span>
            <p>Confidence for every road ahead — wherever it leads.</p>
          </div>
          <div className={styles.pillarDivider} />
          <div className={styles.pillar}>
            <span className={styles.pillarLabel}>STAY CONNECTED</span>
            <p>Technology that fits naturally into your journey.</p>
          </div>
          <div className={styles.pillarDivider} />
          <div className={styles.pillar}>
            <span className={styles.pillarLabel}>ARRIVE DIFFERENT</span>
            <p>A space as considered as the journey itself.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HomeTechnologySection ───────────────────────────────────────────────────
export function HomeTechnologySection({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string };
}) {
  return (
    <section className={styles.technology} aria-labelledby="technology-title">
      <div className={styles.techBg} aria-hidden="true">
        {image?.desktop && (
          // eslint-disable-next-line @next/next/no-img-element
          <picture>{image.mobile && <source media="(max-width: 767px)" srcSet={image.mobile} />}<img src={image.desktop} alt="" loading="lazy" /></picture>
        )}
        <div className={styles.techBgFallback} />
        <div className={styles.techOverlay} />
      </div>

      <div className={styles.techContent}>
        <div className={styles.techIntro}>
          <p className={styles.eyebrow}>INTELLIGENCE IN MOTION</p>
          {cms?.title ? (
            <h2 id="technology-title">{cms.title}</h2>
          ) : (
            <h2 id="technology-title">Technology<br /><em>with purpose.</em></h2>
          )}
          {cms?.description ? (
            <p>{cms.description}</p>
          ) : (
            <p>Every journey, made smarter.</p>
          )}
        </div>

        <div className={styles.techPillars}>
          <div className={styles.techPillar}>
            <p className={styles.techLabel}>J7 SHS · J8 SHS</p>
            <h3>Super Hybrid</h3>
          </div>
          <div className={styles.techPillar}>
            <p className={styles.techLabel}>J5 EV</p>
            <h3>Electric Performance</h3>
          </div>
          <div className={styles.techPillar}>
            <p className={styles.techLabel}>J5 · J7 · J8</p>
            <h3>Intelligent Drive</h3>
          </div>
          <div className={styles.techPillar}>
            <p className={styles.techLabel}>J5 · J7 · J8</p>
            <h3>Smart Cockpit</h3>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── HomePromoSection ────────────────────────────────────────────────────────
// Compat type: covers new Promo (Step 8.10) + legacy PromoData shape
type PromoCompat = PromoData & {
  image_url?: string | null;
  short_description?: string | null;
  image?: { desktop?: string; alt?: string };
  model_slug?: string;
};

export function HomePromoSection({ promos }: { promos: PromoData[] }) {
  if (!promos.length) return null;
  const promo = promos[0] as PromoCompat;
  const imageUrl = promo.image_url ?? promo.image?.desktop;
  const imageAlt = promo.image?.alt ?? promo.title;
  const modelLabel =
    promo.models?.name ??
    promo.model_slug?.replace("jaecoo-", "").toUpperCase() ??
    "";
  const bodyText = promo.short_description ?? promo.description ?? "";
  return (
    <section className={styles.promo} aria-labelledby="promo-title">
      <div className={styles.promoMedia}>
        <Media src={imageUrl} alt={imageAlt} />
      </div>
      <div className={styles.promoCopy}>
        <p className={styles.eyebrow}>CURRENT OFFERS</p>
        <p className={styles.promoModel}>{modelLabel}</p>
        <h2 id="promo-title">{promo.title}</h2>
        <p>{bodyText}</p>
        <Link className={styles.textLink} href={`/promo/${promo.slug}`}>Discover offer ↗</Link>
      </div>
    </section>
  );
}

// ─── HomeJournalSection ──────────────────────────────────────────────────────
export function HomeJournalSection({ news }: { news: NewsData[] }) {
  if (!news.length) return null;
  const featured = news[0];
  return (
    <section className={styles.journal} aria-labelledby="journal-title">
      <div className={styles.journalHead}>
        <div>
          <p className={styles.eyebrow}>JAECOO JOURNAL</p>
          <h2 id="journal-title">Stories, insights<br /><em>&amp; latest updates.</em></h2>
        </div>
        <Link className={styles.textLink} href="/berita">View all stories ↗</Link>
      </div>
      <div className={styles.journalGrid}>
        <Link href={`/berita/${featured.slug}`} className={styles.featuredArticle}>
          <Media src={featured.cover?.desktop} alt={featured.cover?.alt ?? featured.title} />
          <div>
            <p>{featured.category}</p>
            <h3>{featured.title}</h3>
            <span>Read story ↗</span>
          </div>
        </Link>
        {news.slice(1, 4).map((item) => (
          <Link href={`/berita/${item.slug}`} className={styles.article} key={item.id}>
            <p>{item.category}</p>
            <h3>{item.title}</h3>
            <span>Read story ↗</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── HomeAboutSection ────────────────────────────────────────────────────────
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
        <div className={styles.aboutCopy}>
          <p className={styles.eyebrow}>YOUR JAECOO CONSULTANT</p>
          <h2 id="about-title">{cms?.title ?? "ALVAN"}</h2>
          <p className={styles.aboutRole}>Sales Consultant · Palembang</p>
          <p className={styles.aboutBody}>
            {cms?.description ?? "Dari memilih model, memahami teknologi, menghitung skema pembiayaan, hingga test drive — saya membantu Anda mendapatkan informasi JAECOO dengan cara yang jelas dan personal."}
          </p>
          <Link className={styles.aboutLink} href="/sales-jaecoo-palembang">Meet Alvan ↗</Link>
        </div>
        <div className={styles.aboutPortrait} aria-hidden="true">
          {image?.desktop ? (
            // eslint-disable-next-line @next/next/no-img-element
            <picture>{image.mobile && <source media="(max-width: 767px)" srcSet={image.mobile} />}<img src={image.desktop} alt="" loading="lazy" /></picture>
          ) : (
            <span>ALVAN</span>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── HomeFinalCTA ────────────────────────────────────────────────────────────
export function HomeFinalCTA({
  image,
  cms,
}: {
  image?: ResponsiveImage;
  cms?: { title?: string; description?: string; ctaText?: string; ctaUrl?: string };
}) {
  const waUrl = buildWhatsAppUrl({
    source: "homepage_global",
    source_cta: "global_cta",
  });
  const href = cms?.ctaUrl ?? waUrl;
  const isExternal = href.startsWith("http");
  return (
    <section className={styles.finalCta}>
      <div className={styles.finalCtaBg} aria-hidden="true">
        {image?.desktop && (
          // eslint-disable-next-line @next/next/no-img-element
          <picture>{image.mobile && <source media="(max-width: 767px)" srcSet={image.mobile} />}<img src={image.desktop} alt="" loading="lazy" /></picture>
        )}
        <div className={styles.finalCtaFallback} />
        <div className={styles.finalCtaOverlay} />
      </div>
      <div className={styles.finalCtaContent}>
        <p className={styles.eyebrow}>YOUR NEXT JOURNEY STARTS HERE</p>
        {cms?.title ? (
          <h2>{cms.title}</h2>
        ) : (
          <h2>Find your<br /><em>JAECOO.</em></h2>
        )}
        <p>{cms?.description ?? "Konsultasi model, test drive, atau simulasi kredit bersama Alvan — langsung dari Palembang."}</p>
        <Button
          as="a"
          href={href}
          variant="primary"
          size="lg"
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {cms?.ctaText ?? "TALK TO ALVAN →"}
        </Button>
      </div>
    </section>
  );
}
