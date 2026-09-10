/**
 * JAECOO Palembang — HomeDealerLocation
 *
 * STEP 8.1: Local SEO dealer address section.
 * Placed before the main footer.
 *
 * Design principle:
 * - Premium, minimal typographic composition
 * - HTML semantic (<address>) for crawlability
 * - No Google Maps / iframe / map embed / coordinates
 * - Consistent with site visual language (dark, editorial)
 * - Crawlable plain HTML text — no JS-rendered content
 */

import Link from "next/link";
import styles from "./HomeDealerLocation.module.css";

export function HomeDealerLocation() {
  return (
    <section className={styles.section} aria-labelledby="dealer-location-title">
      <div className={styles.inner}>
        {/* Left: label + heading */}
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Dealer Resmi</p>
          <h2 id="dealer-location-title" className={styles.title}>
            Omoda Jaecoo<br />Palembang
          </h2>
        </div>

        {/* Right: address block */}
        <div className={styles.body}>
          <address className={styles.address}>
            <p className={styles.dealerName}>
              Dealer Resmi Omoda Jaecoo Palembang
            </p>
            <p className={styles.street}>
              Komp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506 - 509
            </p>
            <p className={styles.city}>
              9 Ilir, Kec. Ilir Tim. II, Kota Palembang
            </p>
            <p className={styles.province}>
              Sumatera Selatan 30113
            </p>
          </address>

          <p className={styles.note}>
            Sales Jaecoo Palembang siap membantu konsultasi, test drive,
            dan simulasi kredit langsung dari dealer.
          </p>

          <Link href="/sales-jaecoo-palembang" className={styles.link}>
            Hubungi Sales ↗
          </Link>
        </div>
      </div>

      {/* Decorative gold line */}
      <div className={styles.topLine} aria-hidden="true" />
    </section>
  );
}
