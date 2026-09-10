/**
 * JAECOO Palembang — HomeDealerLocation
 *
 * STEP 8.1: Local SEO dealer address section.
 * STEP 8.2: Cinematic full-width background image design.
 *
 * Design principle:
 * - Full-width cinematic section with background image
 * - HTML semantic (<address>) for crawlability — address is always HTML text
 * - No Google Maps / iframe / map embed / coordinates
 * - Image received via backgroundImage prop — ready for CMS integration later
 * - Consistent with site visual language (dark, editorial)
 *
 * CMS integration notes (for future step):
 * - Component accepts `backgroundImage?: string` prop
 * - When CMS is ready, pass image URL from DB as prop from parent (page.tsx)
 * - Current fallback: gradient-only backdrop if no image is provided
 * - This pattern avoids structural refactor when CMS integration is added
 */

import Link from "next/link";
import styles from "./HomeDealerLocation.module.css";
import { SITE_SETTINGS } from "@/lib/data/site";
import type { ResponsiveImage } from "@/lib/types/media";

interface HomeDealerLocationProps {
  /**
   * URL of the background image.
   * Pass from CMS/DB when available.
   * Falls back to dark gradient if undefined.
   */
  backgroundImage?: ResponsiveImage;
}

export function HomeDealerLocation({
  backgroundImage,
}: HomeDealerLocationProps) {
  return (
    <section
      className={styles.section}
      aria-labelledby="dealer-location-title"
    >
      {/* Background image layer — CMS-ready */}
      <div className={styles.backdrop} aria-hidden="true">
        {backgroundImage?.desktop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <picture>
            {backgroundImage.mobile && <source media="(max-width: 767px)" srcSet={backgroundImage.mobile} />}
            <img className={styles.backdropImg} src={backgroundImage.desktop} alt="" loading="lazy" />
          </picture>
        ) : (
          /* Fallback: cinematic dark gradient — same visual weight as image */
          <div className={styles.backdropFallback} />
        )}
        <div className={styles.backdropOverlay} />
      </div>

      {/* Content */}
      <div className={styles.inner}>
        {/* Top label */}
        <p className={styles.eyebrow}>Dealer Resmi</p>

        {/* Dealer heading */}
        <h2 id="dealer-location-title" className={styles.title}>
          Omoda Jaecoo<br />Palembang
        </h2>

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* Semantic address block — crawlable HTML */}
        <address className={styles.address}>
          <p className={styles.dealerName}>
            {SITE_SETTINGS.dealerName}
          </p>
          <p className={styles.street}>
            {SITE_SETTINGS.dealerAddress.street}
          </p>
          <p className={styles.cityLine}>
            {SITE_SETTINGS.dealerAddress.locality},<br />
            {SITE_SETTINGS.dealerAddress.region} {SITE_SETTINGS.dealerAddress.postalCode}
          </p>
        </address>

        {/* CTA */}
        <Link href="/sales-jaecoo-palembang" className={styles.cta}>
          Hubungi Sales
          <span className={styles.ctaArrow} aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
