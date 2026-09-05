/**
 * JAECOO Palembang — Hero Placeholder
 *
 * Used when real hero images are not yet available.
 * Cinematic dark gradient with editorial typography.
 * Drop-in replacement for LayeredHero bg.
 */

import styles from "./HeroPlaceholder.module.css";

interface HeroPlaceholderProps {
  heading: React.ReactNode;
  subheading?: React.ReactNode;
  tagline?: string;
  cta?: React.ReactNode;
  size?: "full" | "large" | "medium";
  /** Subtle accent color variation */
  accent?: "default" | "warm" | "cool";
}

export function HeroPlaceholder({
  heading,
  subheading,
  tagline,
  cta,
  size = "full",
  accent = "default",
}: HeroPlaceholderProps) {
  return (
    <section
      className={[
        styles.hero,
        styles[`hero--${size}`],
        styles[`hero--${accent}`],
      ].join(" ")}
    >
      {/* Background gradient */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.gradient} />
        {/* Subtle grid lines */}
        <div className={styles.grid} />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.inner}>
          {tagline && (
            <p className={styles.tagline}>{tagline}</p>
          )}
          <div className={styles.headingWrap}>
            <h1 className={styles.heading}>{heading}</h1>
            {subheading && (
              <p className={styles.subheading}>{subheading}</p>
            )}
          </div>
          {cta && <div className={styles.cta}>{cta}</div>}
        </div>
      </div>
    </section>
  );
}
