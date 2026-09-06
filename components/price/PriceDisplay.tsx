/**
 * JAECOO Palembang — PriceDisplay
 * STEP 5B.1: Renders price based on price_status.
 *
 * Rules:
 *   official      → nominal Rp (price_display / price_idr formatted)
 *   starting_from → "Mulai dari" + nominal
 *   prebook       → badge PRE-BOOK, no Rp
 *   coming_soon   → badge COMING SOON
 *   contact_sales → CTA text "Hubungi Sales untuk harga"
 *   hidden        → render nothing (null)
 *
 * Never renders Rp0, NaN, null, or undefined as a price string.
 */

import type { PriceStatus } from "@/lib/types/model";
import styles from "./PriceDisplay.module.css";

interface PriceDisplayProps {
  price_status: PriceStatus;
  price_idr?: number | null;
  price_display?: string | null;
  price_display_override?: string | null;
  /** Show price_region below the price (optional) */
  price_region?: string;
  /** Additional CSS class */
  className?: string;
}

function formatIDR(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

function resolveDisplay(
  price_idr: number | null | undefined,
  price_display: string | null | undefined,
  price_display_override: string | null | undefined
): string | null {
  if (price_display_override) return price_display_override;
  if (price_display) return price_display;
  if (price_idr && price_idr > 0 && !isNaN(price_idr)) {
    return formatIDR(price_idr);
  }
  return null;
}

export function PriceDisplay({
  price_status,
  price_idr,
  price_display,
  price_display_override,
  price_region,
  className,
}: PriceDisplayProps) {
  const resolved = resolveDisplay(price_idr, price_display, price_display_override);

  if (price_status === "hidden") {
    return null;
  }

  if (price_status === "contact_sales") {
    return (
      <div className={`${styles.wrap} ${className ?? ""}`}>
        <span className={styles.contactSales}>Hubungi Sales untuk harga</span>
      </div>
    );
  }

  if (price_status === "coming_soon") {
    return (
      <div className={`${styles.wrap} ${className ?? ""}`}>
        <span className={styles.badgeComingSoon}>COMING SOON</span>
      </div>
    );
  }

  if (price_status === "prebook") {
    return (
      <div className={`${styles.wrap} ${className ?? ""}`}>
        <span className={styles.badgePrebook}>PRE-BOOK</span>
        {price_region && (
          <span className={styles.region}>{price_region}</span>
        )}
      </div>
    );
  }

  // official or starting_from — needs resolved price
  if (!resolved) {
    // Fallback: no price available — show contact sales
    return (
      <div className={`${styles.wrap} ${className ?? ""}`}>
        <span className={styles.contactSales}>Hubungi Sales untuk harga</span>
      </div>
    );
  }

  if (price_status === "starting_from") {
    return (
      <div className={`${styles.wrap} ${className ?? ""}`}>
        <span className={styles.mulaiDari}>Mulai dari</span>
        <span className={styles.nominal}>{resolved}</span>
        {price_region && (
          <span className={styles.region}>{price_region}</span>
        )}
      </div>
    );
  }

  // official
  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <span className={styles.nominal}>{resolved}</span>
      {price_region && (
        <span className={styles.region}>{price_region}</span>
      )}
    </div>
  );
}
