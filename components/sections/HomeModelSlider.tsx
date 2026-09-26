"use client";

/**
 * JAECOO Palembang — HomeModelSlider
 * Cinematic full-screen model showcase. Touch/swipe + keyboard nav.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import type { ModelData } from "@/lib/types/model";
import { PriceDisplay } from "@/components/price/PriceDisplay";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import styles from "./HomeModelSlider.module.css";

interface Props { models: ModelData[]; }

const SLUG_LABEL: Record<string, string> = {
  "jaecoo-j5-ev":  "J5",
  "jaecoo-j7-shs": "J7 SHS",
  "jaecoo-j7-sivp": "J7 SIVP",
  "jaecoo-j8-shs": "J8 SHS",
};

function sorted(models: ModelData[]) {
  return [...models].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function validSrc(src?: string | null): boolean {
  if (!src) return false;
  return src.startsWith("http") || src.startsWith("/");
}

export function HomeModelSlider({ models }: Props) {
  const list = sorted(models);
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(true);
  const touchStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [epoch, setEpoch] = useState(0);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + list.length) % list.length), [list.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % list.length), [list.length]);
  const manual = useCallback((action: () => void) => {
    action();
    setEpoch((value) => value + 1);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") manual(prev);
      if (e.key === "ArrowRight") manual(next);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, manual]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Auto-advance only while the slider is near the viewport.
  useEffect(() => {
    if (!inView || list.length < 2) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % list.length), 8000);
    return () => clearInterval(timer);
  }, [inView, epoch, list.length]);

  if (!list.length) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStart.current === null) return;
        const diff = touchStart.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 44) {
          swiped.current = true;
          manual(diff > 0 ? next : prev);
        }
        touchStart.current = null;
      }}
    >
      <div className={styles.track}>
        {list.map((model, i) => {
          const heroMedia = model.hero_media;
          const src = heroMedia?.image?.desktop ?? heroMedia?.image?.mobile;
          const isActive = i === current;

          // Apply presentation_settings (same pattern as LayeredHero / getBackgroundLayerStyle)
          const ps = heroMedia?.presentation_settings;
          const desktopImgStyle: CSSProperties = ps
            ? getBackgroundLayerStyle(ps, "desktop", heroMedia?.focal_x ?? 50, heroMedia?.focal_y ?? 50)
            : {};
          const mobilePsSettings = heroMedia?.image?.presentation_settings_mobile ?? ps;
          const mobileImgStyle: CSSProperties = mobilePsSettings
            ? getBackgroundLayerStyle(mobilePsSettings, "mobile", heroMedia?.focal_x ?? 50, heroMedia?.focal_y ?? 50)
            : {};
          const slideImgStyle: CSSProperties = {
            ...desktopImgStyle,
            "--slider-mobile-fit":       mobileImgStyle.objectFit,
            "--slider-mobile-position":  mobileImgStyle.objectPosition,
            "--slider-mobile-transform": mobileImgStyle.transform,
            "--slider-mobile-origin":    mobileImgStyle.transformOrigin,
          } as CSSProperties;

          const nearby = isActive || i === (current + 1) % list.length || i === (current - 1 + list.length) % list.length;

          return (
            <Link
              key={model.slug}
              href={`/model/${model.slug}`}
              className={[styles.slide, isActive ? styles.slideActive : ""].join(" ")}
              aria-label={`Lihat ${model.name}`}
              aria-hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={(event) => {
                if (!isActive || swiped.current) {
                  event.preventDefault();
                  swiped.current = false;
                }
              }}
            >
              {nearby && validSrc(src) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src!}
                  alt={model.name}
                  className={styles.slideImg}
                  loading={isActive ? "eager" : "lazy"}
                  fetchPriority={isActive ? "high" : "low"}
                  decoding="async"
                  style={Object.keys(desktopImgStyle).length > 0 ? slideImgStyle : undefined}
                />
              ) : (
                <div className={styles.slideFallback} aria-hidden="true" />
              )}
              <div className={styles.slideOverlay} aria-hidden="true" />

              <div className={styles.slideContent}>
                <span className={styles.slideIndex}>
                  {String(i + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
                </span>
                <span className={styles.slideName}>
                  {SLUG_LABEL[model.slug] ?? model.short_name}
                </span>
                <span className={styles.slideTagline}>{model.tagline}</span>
                <p className={styles.slideDescription}>{model.description}</p>

                <div className={styles.slideActions}>
                  <span className={styles.slideLink}>
                    Jelajahi {SLUG_LABEL[model.slug] ?? model.short_name} →
                  </span>
                  <span className={styles.slidePrice}>
                    <PriceDisplay
                      price_status={model.default_variant.price_status}
                      price_idr={model.default_variant.price_idr}
                      price_display={model.default_variant.price_display}
                      price_display_override={model.default_variant.price_display_override}
                      price_region={model.default_variant.price_region}
                    />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Controls */}
      <div className={styles.nav}>
        <div className={styles.dots}>
          {list.map((m, i) => (
            <button
              key={m.slug}
              className={[styles.dot, i === current ? styles.dotActive : ""].join(" ")}
              onClick={() => manual(() => setCurrent(i))}
              aria-label={`Model ${i + 1}`}
            />
          ))}
        </div>
        <button className={styles.navBtn} onClick={() => manual(prev)} aria-label="Sebelumnya">←</button>
        <button className={styles.navBtn} onClick={() => manual(next)} aria-label="Berikutnya">→</button>
      </div>
    </section>
  );
}
