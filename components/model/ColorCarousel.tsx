/**
 * JAECOO Palembang — Color Carousel
 * STEP 7B: Interactive color showcase — single visual area.
 *
 * - Satu area visual yang berubah saat swatch dipilih
 * - Smooth transition antar warna
 * - Touch/swipe support di mobile
 * - Tidak membuat kartu vertikal — semua dalam satu carousel
 */

"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import type { ModelColor } from "@/lib/types/model";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getBackgroundLayerStyle } from "@/lib/types/presentation";
import styles from "./ColorCarousel.module.css";

interface ColorCarouselProps {
  colors: ModelColor[];
  modelName: string;
}

export function ColorCarousel({ colors, modelName }: ColorCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeColor = colors[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (index === activeIndex || isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 220);
    },
    [activeIndex, isTransitioning]
  );

  const goPrev = () => goTo((activeIndex - 1 + colors.length) % colors.length);
  const goNext = () => goTo((activeIndex + 1) % colors.length);

  return (
    <div className={styles.carousel}>
      {/* Main vehicle image */}
      <div
        className={[
          styles.vehicleImage,
          isTransitioning ? styles.transitioning : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-live="polite"
        aria-label={`${modelName} — ${activeColor.name}`}
      >
        {activeColor.image?.desktop ? (() => {
          const ps = activeColor.image?.presentation_settings;
          const imgStyle = ps
            ? getBackgroundLayerStyle(ps, "desktop", activeColor.image?.focal_x ?? 50, activeColor.image?.focal_y ?? 50)
            : {};
          return (
            <Image
              src={activeColor.image.desktop}
              alt={activeColor.image.alt ?? `${modelName} ${activeColor.name}`}
              fill
              className={styles.vehicleImg}
              sizes="(max-width: 768px) 100vw, 80vw"
              style={Object.keys(imgStyle).length > 0 ? imgStyle : undefined}
            />
          );
        })() : (
          <ImagePlaceholder
            label={`COLOR — ${activeColor.name.toUpperCase()}`}
            ratio="16/9"
            source="Admin → Media Library"
            className={styles.vehiclePlaceholder}
          />
        )}
      </div>

      {/* Controls overlay */}
      <div className={styles.controls}>
        {/* Color name */}
        <div
          className={[
            styles.colorName,
            isTransitioning ? styles.nameTransitioning : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {activeColor.name}
        </div>

        {/* Swatches */}
        <div className={styles.swatches} role="tablist" aria-label="Pilih warna">
          {colors.map((color, i) => (
            <button
              key={color.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={color.name}
              className={[
                styles.swatch,
                i === activeIndex ? styles.swatchActive : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ backgroundColor: color.hex }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        {colors.length > 1 && (
          <div className={styles.arrows}>
            <button
              className={styles.arrow}
              onClick={goPrev}
              aria-label="Warna sebelumnya"
            >
              ←
            </button>
            <span className={styles.arrowCount}>
              {activeIndex + 1} / {colors.length}
            </span>
            <button
              className={styles.arrow}
              onClick={goNext}
              aria-label="Warna berikutnya"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
