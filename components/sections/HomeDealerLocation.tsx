/**
 * JAECOO Palembang — HomeDealerLocation
 * Local SEO + dealer address section.
 */

import Link from "next/link";
import { SITE_SETTINGS } from "@/lib/data/site";
import styles from "./HomeDealerLocation.module.css";
import type { ResponsiveImage } from "@/lib/types/media";

export function HomeDealerLocation({ backgroundImage }: { backgroundImage?: ResponsiveImage }) {
  const { dealerAddress } = SITE_SETTINGS;
  const mapQuery = encodeURIComponent(
    `${dealerAddress.street}, ${dealerAddress.locality}, ${dealerAddress.region}`
  );

  return (
    <section className={styles.section} aria-labelledby="dealer-title">
      {backgroundImage?.desktop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImage.desktop}
          alt=""
          className={styles.bgImg}
          aria-hidden="true"
          loading="lazy"
        />
      )}

      <div className={styles.inner}>
        <div>
          <span className={styles.eyebrow}>Dealer Resmi</span>
          <h2 id="dealer-title" className={styles.title}>
            OMODA JAECOO<br />Palembang
          </h2>
          <address className={styles.address} style={{ fontStyle: "normal" }}>
            {dealerAddress.street}<br />
            {dealerAddress.locality}<br />
            {dealerAddress.region} {dealerAddress.postalCode}
          </address>
          <Link href="/sales-jaecoo-palembang" className={styles.cta}>
            Konsultasi dengan Alvan →
          </Link>
        </div>

        <iframe
          className={styles.mapFrame}
          src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
          title="Lokasi Dealer OMODA JAECOO Palembang"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
