/**
 * JAECOO Palembang — AnimatedText
 *
 * Wrapper reusable untuk teks dengan scroll reveal animation otomatis.
 * Variant dipilih secara deterministik — stabil antar render, tidak ada
 * hydration mismatch.
 *
 * Penggunaan dasar (auto-variant):
 *   <AnimatedText index={0}>Judul</AnimatedText>
 *   <AnimatedText index={1} context="news">Paragraf</AnimatedText>
 *
 * Override manual:
 *   <AnimatedText variant="mask">Heading penting</AnimatedText>
 *
 * Sebagai heading (pool lebih dramatis):
 *   <AnimatedText index={0} asHeading>Heading</AnimatedText>
 *
 * PENTING: "use client" karena menggunakan IntersectionObserver via Reveal.
 */

"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import type { RevealVariant } from "./Reveal";
import { getVariant, getHeadingVariant, getStaggerDelay } from "@/lib/utils/deterministic-animation";
import type { AnimContext } from "@/lib/utils/deterministic-animation";

interface AnimatedTextProps {
  children: ReactNode;
  /**
   * Index elemen dalam section (0-based).
   * Digunakan untuk memilih variant secara deterministik.
   * Wajib jika `variant` tidak diberikan.
   */
  index?: number;
  /**
   * Context section untuk pool animasi yang tepat.
   * Default: "default"
   */
  context?: AnimContext;
  /**
   * Override manual — lewati auto-selection.
   * Berguna untuk elemen yang membutuhkan animasi spesifik.
   */
  variant?: RevealVariant;
  /**
   * Gunakan heading variant pool (lebih dramatis).
   */
  asHeading?: boolean;
  /**
   * Base delay sebelum animasi mulai (ms).
   */
  delay?: number;
  /**
   * Terapkan stagger otomatis berdasarkan index.
   * Default: true jika index >= 1.
   */
  stagger?: boolean;
  /**
   * Stagger ms per step. Default: 80ms.
   */
  staggerMs?: number;
  /**
   * IntersectionObserver threshold. Default: 0.12.
   */
  threshold?: number;
  className?: string;
}

export function AnimatedText({
  children,
  index = 0,
  context = "default",
  variant,
  asHeading = false,
  delay = 0,
  stagger = false,
  staggerMs = 80,
  threshold = 0.12,
  className,
}: AnimatedTextProps) {
  // Pilih variant: manual override > heading pool > default pool
  const resolvedVariant: RevealVariant = variant
    ? variant
    : asHeading
    ? getHeadingVariant(index, context)
    : getVariant(index, context);

  // Hitung delay: base + stagger jika aktif
  const resolvedDelay = stagger
    ? getStaggerDelay(index, delay, staggerMs)
    : delay;

  return (
    <Reveal
      variant={resolvedVariant}
      delay={resolvedDelay}
      threshold={threshold}
      className={className}
    >
      {children}
    </Reveal>
  );
}
