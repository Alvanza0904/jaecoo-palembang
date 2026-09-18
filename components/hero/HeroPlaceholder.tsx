/**
 * JAECOO Palembang — HeroPlaceholder
 * Cinematic hero with full-bleed background image.
 */

import type { ReactNode } from "react";
import styles from "./HeroPlaceholder.module.css";

interface HeroPlaceholderProps {
  tagline?: string;
  heading?: ReactNode;
  subheading?: string;
  cta?: ReactNode;
  backgroundImage?: string;
  backgroundImageMobile?: string;
  size?: "large" | "medium" | "small";
  accent?: "default" | "none";
}

export function HeroPlaceholder({
  tagline,
  heading,
  subheading,
  cta,
  backgroundImage,
  backgroundImageMobile,
  size = "large",
  accent: _accent = "default",
}: HeroPlaceholderProps) {
  const sizeClass =
    size === "medium" ? styles["hero--medium"] :
    size === "small"  ? styles["hero--small"] : "";

  return (
    <section className={[styles.hero, sizeClass].filter(Boolean).join(" ")}>
      {/* Background */}
      <div className={styles.bg}>
        {backgroundImage ? (
          <>
            {backgroundImageMobile && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={backgroundImageMobile}
                alt=""
                className={styles.bgImg}
                style={{ display: "none" }}
                aria-hidden="true"
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage}
              alt=""
              className={styles.bgImg}
              aria-hidden="true"
              fetchPriority="high"
              decoding="async"
            />
          </>
        ) : (
          <div
            className={styles.bgImg}
            style={{
              background: "linear-gradient(135deg, #141414 0%, #1e1e1e 50%, #141414 100%)",
            }}
            aria-hidden="true"
          />
        )}
        <div className={styles.overlay} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className={styles.content}>
        {tagline && <span className={styles.tagline}>{tagline}</span>}
        {heading  && <h1 className={styles.heading}>{heading}</h1>}
        {subheading && <p className={styles.subheading}>{subheading}</p>}
        {cta && <div className={styles.cta}>{cta}</div>}
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint} aria-hidden="true">
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
