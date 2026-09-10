"use client";

/**
 * JAECOO Palembang — HomeModelSlider
 *
 * STEP 8: Cinematic horizontal model showcase for the homepage.
 * STEP 8.1: Sort guarantee J5->J7->J8 regardless of CMS/Supabase order.
 *
 * Features:
 * - Full-width cinematic layout, desktop + mobile
 * - Swipe/drag on mobile (touch events)
 * - Previous / next + dot navigation
 * - Smooth crossfade transition
 * - CMS/data-driven: renders from ModelData[]
 * - Guaranteed J5->J7->J8 order via slug sort map
 */

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import type { ModelData } from "@/lib/types/model";
import styles from "./HomeModelSlider.module.css";

interface HomeModelSliderProps {
  models: ModelData[];
}

/** Guaranteed display order regardless of CMS sort_order or Supabase return order */
const SLUG_ORDER: Record<string, number> = {
  "jaecoo-j5-ev":  0,
  "jaecoo-j7-shs": 1,
  "jaecoo-j8-shs": 2,
};

function sortModels(models: ModelData[]): ModelData[] {
  return [...models].sort((a, b) => {
    const ao = SLUG_ORDER[a.slug] ?? 99;
    const bo = SLUG_ORDER[b.slug] ?? 99;
    return ao - bo;
  });
}

export function HomeModelSlider({ models: rawModels }: HomeModelSliderProps) {
  const models = sortModels(rawModels);
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const total = models.length;

  const goTo = useCallback(
    (index: number) => {
      if (transitioning || index === active) return;
      setTransitioning(true);
      setTimeout(() => {
        setActive(index);
        setTransitioning(false);
      }, 420);
    },
    [active, transitioning]
  );

  const prev = useCallback(() => {
    goTo((active - 1 + total) % total);
  }, [active, total, goTo]);

  const next = useCallback(() => {
    goTo((active + 1) % total);
  }, [active, total, goTo]);

  // Touch / swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      if (dx < 0) { next(); } else { prev(); }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  if (!models.length) return null;

  const model = models[active];
  const desktopSrc = model.hero_media?.image?.desktop;
  const mobileSrc = model.hero_media?.image?.mobile ?? desktopSrc;
  const hasImage = desktopSrc?.startsWith("http");

  return (
    <section
      className={styles.slider}
      aria-label="JAECOO Model Range"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background image layer */}
      <div
        className={[styles.backdrop, transitioning ? styles.backdropFade : ""].join(" ")}
        aria-hidden="true"
      >
        {hasImage ? (
          <>
            {/* Desktop */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.backdropImg}
              src={desktopSrc}
              alt=""
              loading="eager"
            />
            {/* Mobile override if different */}
            {mobileSrc && mobileSrc !== desktopSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={[styles.backdropImg, styles.backdropImgMobile].join(" ")}
                src={mobileSrc}
                alt=""
                loading="eager"
              />
            )}
          </>
        ) : (
          <div className={styles.backdropFallback} />
        )}
        {/* Gradient overlay — left side for text, bottom for mobile */}
        <div className={styles.overlay} />
      </div>

      {/* Content */}
      <div
        className={[styles.content, transitioning ? styles.contentFade : ""].join(" ")}
      >
        {/* Top — model identity */}
        <div className={styles.identity}>
          <p className={styles.brand}>JAECOO</p>
          <h2 className={styles.modelName}>{model.short_name}</h2>
          <p className={styles.tagline}>{model.tagline}</p>
        </div>

        {/* Bottom — nav + CTA */}
        <div className={styles.footer}>
          {/* Model tabs */}
          <nav className={styles.tabs} aria-label="Select model">
            {models.map((m, i) => (
              <button
                key={m.slug}
                className={[styles.tab, i === active ? styles.tabActive : ""].join(" ")}
                onClick={() => goTo(i)}
                aria-label={`View ${m.short_name}`}
                aria-current={i === active ? "true" : undefined}
              >
                <span className={styles.tabName}>{m.short_name}</span>
                <span className={styles.tabLine} />
              </button>
            ))}
          </nav>

          {/* CTA */}
          <Link
            href={`/model/${model.slug}`}
            className={styles.cta}
            aria-label={`Explore ${model.name}`}
          >
            EXPLORE {model.short_name}
            <span className={styles.ctaArrow}>→</span>
          </Link>
        </div>
      </div>

      {/* Prev / next arrows */}
      <button
        className={[styles.arrow, styles.arrowPrev].join(" ")}
        onClick={prev}
        aria-label="Previous model"
        disabled={transitioning}
      >
        <ArrowIcon dir="left" />
      </button>
      <button
        className={[styles.arrow, styles.arrowNext].join(" ")}
        onClick={next}
        aria-label="Next model"
        disabled={transitioning}
      >
        <ArrowIcon dir="right" />
      </button>

      {/* Dot indicator */}
      <div className={styles.dots} aria-hidden="true">
        {models.map((_, i) => (
          <button
            key={i}
            className={[styles.dot, i === active ? styles.dotActive : ""].join(" ")}
            onClick={() => goTo(i)}
            tabIndex={-1}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className={styles.progress} aria-hidden="true">
        <div
          className={styles.progressBar}
          style={{ width: `${((active + 1) / total) * 100}%` }}
        />
      </div>
    </section>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {dir === "left" ? (
        <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}
