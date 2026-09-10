/**
 * JAECOO Palembang — Animation Selector
 * STEP 7C: Context-aware, curated animation selection.
 *
 * Selects reveal variants based on:
 *   - Text alignment / position
 *   - Section type
 *   - Recently used variants (avoids repetition)
 *
 * "Random" here means curated variety, not arbitrary chaos.
 */

import type { RevealVariant } from "@/components/motion/Reveal";

export type TextPosition = "left" | "right" | "center" | "overlay-left" | "overlay-right";
export type SectionType = "hero" | "cinematic" | "editorial" | "tech" | "detail" | "stat" | "cta";

interface AnimationContext {
  textPosition?: TextPosition;
  sectionType?: SectionType;
  isHeadline?: boolean;
  recentVariants?: RevealVariant[];
}

/**
 * Curated variant pools per context.
 * Each pool is ordered by preference — index 0 is most preferred.
 */
const POOLS: Record<string, RevealVariant[]> = {
  "left":          ["slide-left", "fade-up", "mask", "fade"],
  "overlay-left":  ["fade-up", "slide-left", "mask"],
  "right":         ["slide-right", "fade-up", "fade-down"],
  "overlay-right": ["fade-up", "slide-right", "fade-down"],
  "center":        ["fade-up", "scale", "blur", "fade-down"],
  "hero":          ["mask", "scale", "blur"],
  "cinematic":     ["fade-up", "slide-left", "slide-right", "mask"],
  "editorial":     ["mask", "fade-up", "slide-left", "scale"],
  "tech":          ["scale", "mask", "fade-up", "blur"],
  "detail":        ["fade-up", "slide-left", "slide-right"],
  "stat":          ["fade-down", "scale", "fade-up"],
  "cta":           ["fade-up", "scale", "mask"],
  "headline":      ["mask", "scale", "fade-up", "slide-left"],
  "body":          ["fade-up", "fade-down", "fade"],
};

/**
 * Pick a variant from a pool, avoiding recently used ones.
 */
function pickFrom(pool: RevealVariant[], recent: RevealVariant[]): RevealVariant {
  // Try to find a variant not in recent history
  for (const candidate of pool) {
    if (!recent.slice(-3).includes(candidate)) {
      return candidate;
    }
  }
  // Fallback: just use the first option
  return pool[0];
}

/**
 * Select an animation variant given context.
 * Pass recentVariants to avoid consecutive repetition.
 */
export function selectAnimation(ctx: AnimationContext = {}): RevealVariant {
  const recent = ctx.recentVariants ?? [];

  // Headline-specific pool takes priority
  if (ctx.isHeadline) {
    const pool = POOLS["headline"];
    return pickFrom(pool, recent);
  }

  // Section type pool
  if (ctx.sectionType && POOLS[ctx.sectionType]) {
    const pool = POOLS[ctx.sectionType];
    return pickFrom(pool, recent);
  }

  // Text position pool
  if (ctx.textPosition && POOLS[ctx.textPosition]) {
    const pool = POOLS[ctx.textPosition];
    return pickFrom(pool, recent);
  }

  // Default
  return pickFrom(POOLS["center"], recent);
}

/**
 * Pre-defined animation sequences for Technology page scenes.
 * These are hand-curated to create varied but coherent choreography.
 */
export const TECH_PAGE_SEQUENCE: RevealVariant[] = [
  "mask",       // Scene 1 — hero text
  "fade-up",    // Scene 1 — supporting text
  "slide-left", // Scene 2 — cockpit/display
  "scale",      // Scene 2 — headline
  "fade-up",    // Scene 2 — body
  "slide-right",// Scene 3 — sensors/adas
  "fade-down",  // Scene 3 — stat
  "blur",       // Scene 4 — connectivity
  "fade-up",    // Feature items
  "mask",       // CTA
];

/**
 * Utility: get variant from a pre-defined sequence with bounds safety.
 */
export function fromSequence(seq: RevealVariant[], index: number): RevealVariant {
  return seq[index % seq.length];
}
