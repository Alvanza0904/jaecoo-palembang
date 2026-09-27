/**
 * JAECOO Palembang — HeroPlaceholder
 * Cinematic hero with full-bleed background image.
 */

"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import styles from "./HeroPlaceholder.module.css";

interface HeroPlaceholderProps {
  tagline?: string;
  heading?: ReactNode;
  subheading?: string;
  cta?: ReactNode;
  backgroundImage?: string;
  backgroundImageMobile?: string;
  size?: "full" | "large" | "medium" | "small";
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
  accent = "default",
}: HeroPlaceholderProps) {
  void accent; // prop accepted for API consistency; not used in rendering
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
                role="presentation"
                aria-hidden="true"
                className={styles.bgImg}
                style={{ display: "none" }}
                aria-hidden="true"
              />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={backgroundImage}
              alt=""
              role="presentation"
              aria-hidden="true"
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
        {tagline && (
          <Reveal variant="fade-up" delay={0} threshold={0}>
            <span className={styles.tagline}>{tagline}</span>
          </Reveal>
        )}
        {heading && (
          <Reveal variant="mask" delay={80} threshold={0}>
            <h1 className={styles.heading}>{heading}</h1>
          </Reveal>
        )}
        {subheading && (
          <Reveal variant="fade-up" delay={160} threshold={0}>
            <p className={styles.subheading}>{subheading}</p>
          </Reveal>
        )}
        {cta && (
          <Reveal variant="scale" delay={240} threshold={0}>
            <div className={styles.cta}>{cta}</div>
          </Reveal>
        )}
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollHint} aria-hidden="true">
        <div className={styles.scrollLine} />
      </div>
    </section>
  );
}
