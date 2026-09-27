/**
 * JAECOO Palembang — Deterministic Animation Variant Selector
 *
 * Memilih animation variant secara deterministik berdasarkan index/key/seed.
 * Hasilnya STABIL — tidak berubah antar render, tidak menyebabkan hydration mismatch.
 *
 * Prinsip:
 * - Sama index + sama context = sama variant (selalu)
 * - Variasi terasa alami, tidak repetitif
 * - Context memberi nuansa berbeda per section
 *
 * Cara pakai:
 *   import { getVariant } from "@/lib/utils/deterministic-animation";
 *   const variant = getVariant(index);          // default pool
 *   const variant = getVariant(index, "news");  // news pool
 *   const variant = getVariant(index, "hero");  // hero pool
 */

import type { RevealVariant } from "@/components/motion/Reveal";

export type AnimContext =
  | "default"
  | "hero"
  | "news"
  | "promo"
  | "model"
  | "sales"
  | "editorial"
  | "stat"
  | "cta"
  | "overlay"
  | "card";

/**
 * Curated variant pools per context.
 * Urutan: lebih premium lebih awal.
 */
const VARIANT_POOLS: Record<AnimContext, RevealVariant[]> = {
  default:   ["fade-up", "fade", "slide-left", "fade-down", "blur", "slide-right", "scale", "fade-up"],
  hero:      ["scale", "blur", "fade-up", "fade"],
  news:      ["fade-up", "slide-left", "fade", "fade-down", "slide-right", "fade-up", "blur", "scale"],
  promo:     ["fade-up", "slide-right", "fade", "slide-left", "scale", "fade-up", "fade-down"],
  model:     ["mask", "fade-up", "slide-left", "scale", "blur", "slide-right", "fade-down", "fade"],
  sales:     ["fade-up", "slide-left", "fade", "scale", "fade-down", "slide-right"],
  editorial: ["mask", "slide-left", "fade-up", "scale", "fade", "blur", "slide-right"],
  stat:      ["fade-down", "scale", "fade-up", "blur", "fade"],
  cta:       ["fade-up", "scale", "mask", "blur", "fade"],
  overlay:   ["fade-up", "blur", "fade", "scale", "slide-left"],
  card:      ["fade-up", "fade", "scale", "slide-left", "slide-right", "fade-down"],
};

/**
 * Deterministic "hash" sederhana berbasis index + context.
 * Tidak random — hasilnya sama setiap kali.
 */
function deterministicIndex(index: number, context: AnimContext): number {
  const contextSeed: Record<AnimContext, number> = {
    default:   7,
    hero:      3,
    news:      11,
    promo:     5,
    model:     13,
    sales:     9,
    editorial: 17,
    stat:      2,
    cta:       19,
    overlay:   6,
    card:      4,
  };
  const seed = contextSeed[context];
  // Formula: (prime * index + contextSeed) % poolLength
  // Memberikan distribusi yang merata tanpa librari tambahan.
  return (index * 3 + seed) % 1000;
}

/**
 * Ambil variant berdasarkan index + context.
 * Hasilnya selalu stabil untuk kombinasi yang sama.
 *
 * @param index - posisi elemen (0-based). Bisa juga string hash (via `strIndex`).
 * @param context - jenis section/halaman untuk memilih pool yang tepat.
 */
export function getVariant(index: number, context: AnimContext = "default"): RevealVariant {
  const pool = VARIANT_POOLS[context];
  const hash = deterministicIndex(index, context);
  return pool[hash % pool.length];
}

/**
 * Variasi untuk stagger delay.
 * Memberikan stagger ringan (0-3 step) per index.
 */
export function getStaggerDelay(
  index: number,
  baseDelay = 0,
  staggerMs = 80,
): number {
  // Stagger hanya 3 level: 0, 1, 2
  // Mencegah delay terlalu panjang di akhir list
  const staggerStep = index % 3;
  return baseDelay + staggerStep * staggerMs;
}

/**
 * Heading selalu mendapat variant yang lebih dramatis.
 */
export function getHeadingVariant(index: number, context: AnimContext = "default"): RevealVariant {
  const headingPools: Record<AnimContext, RevealVariant[]> = {
    default:   ["fade-up", "mask", "scale", "blur"],
    hero:      ["scale", "blur", "mask"],
    news:      ["fade-up", "mask", "blur"],
    promo:     ["fade-up", "scale", "mask"],
    model:     ["mask", "scale", "blur", "fade-up"],
    sales:     ["fade-up", "scale", "blur"],
    editorial: ["mask", "scale", "blur", "slide-left"],
    stat:      ["fade-down", "scale", "blur"],
    cta:       ["scale", "mask", "blur"],
    overlay:   ["blur", "fade-up", "scale"],
    card:      ["fade-up", "scale", "mask"],
  };
  const pool = headingPools[context];
  return pool[index % pool.length];
}
