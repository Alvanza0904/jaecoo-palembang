import { BREAKPOINT_ASPECT_RATIO, type BreakpointKey } from "@/lib/types/presentation";

/**
 * Live section frame for one breakpoint.
 * `vh` is a fraction of the viewport height. `vw` is a fraction of the width.
 * `ratio` is width / height when the live image is not a viewport box.
 */
type Frame = { vh: number; vw?: number } | { ratio: number };

const view = (vh: number, vw?: number): Frame => (vw ? { vh, vw } : { vh });
const ratio = (value: number): Frame => ({ ratio: value });

/**
 * One map for every model slot and homepage section.
 * Homepage keys are prefixed with `home:` because `technology` is a
 * full-bleed homepage band, not the model page's half-width column.
 */
const FRAMES: Record<string, Partial<Record<BreakpointKey, Frame>>> = {
  hero: { desktop: view(1), tablet: view(1), mobile: view(1), small_mobile: view(1) },
  "home:hero": { desktop: view(1), tablet: view(1), mobile: view(1), small_mobile: view(1) },
  exterior: { desktop: view(0.9), tablet: view(0.8), mobile: view(0.8), small_mobile: view(0.8) },
  interior: { desktop: view(0.9), tablet: view(0.8), mobile: view(0.8), small_mobile: view(0.8) },
  adas: { desktop: view(0.9), tablet: view(0.8), mobile: view(0.8), small_mobile: view(0.8) },
  profile: { desktop: view(0.75), tablet: ratio(16 / 9), mobile: ratio(4 / 3), small_mobile: ratio(4 / 3) },
  performance: { desktop: view(0.85), tablet: view(0.85), mobile: view(0.85), small_mobile: view(0.85) },
  specs_visual: { desktop: view(0.7), tablet: view(0.7), mobile: view(0.7), small_mobile: view(0.7) },
  final_cta: { desktop: view(0.8), tablet: view(0.8), mobile: view(0.8), small_mobile: view(0.8) },
  cargo: { desktop: view(0.84), tablet: view(0.84), mobile: view(0.78), small_mobile: view(0.78) },
  technology_hero: { desktop: view(1), tablet: view(1), mobile: view(1), small_mobile: view(1) },
  specifications_hero: { desktop: view(1), tablet: view(1), mobile: view(1), small_mobile: view(1) },
  tech_intelligence: { desktop: view(1), tablet: view(1), mobile: view(0.9), small_mobile: view(0.9) },
  tech_cta: { desktop: view(0.85), tablet: view(0.85), mobile: view(0.8), small_mobile: view(0.8) },
  technology: { desktop: view(0.8, 0.5), tablet: view(0.8, 0.5), mobile: ratio(3 / 4), small_mobile: ratio(3 / 4) },
  design_detail_main: { desktop: ratio(3 / 4), tablet: ratio(3 / 4), mobile: ratio(3 / 4), small_mobile: ratio(3 / 4) },
  design_detail_wheel: { desktop: ratio(1), tablet: ratio(1), mobile: ratio(1), small_mobile: ratio(1) },
  design_detail_rear: { desktop: ratio(1), tablet: ratio(1), mobile: ratio(1), small_mobile: ratio(1) },
  cockpit_main: { desktop: ratio(4 / 3), tablet: ratio(4 / 3), mobile: ratio(4 / 3), small_mobile: ratio(4 / 3) },
  cockpit_detail: { desktop: ratio(1), tablet: ratio(1), mobile: ratio(1), small_mobile: ratio(1) },
  colors: { desktop: ratio(16 / 9), tablet: ratio(16 / 9), mobile: ratio(4 / 3), small_mobile: ratio(4 / 3) },
  "home:experience": { desktop: view(0.72), tablet: view(0.72), mobile: view(1), small_mobile: view(1) },
  "home:technology": { desktop: view(0.72), tablet: view(0.72), mobile: view(1), small_mobile: view(1) },
  "home:final_cta": { desktop: view(0.6), tablet: view(0.6), mobile: view(0.6), small_mobile: view(0.6) },
};

const DEVICE_VIEWPORT: Record<Exclude<BreakpointKey, "desktop">, { width: number; height: number }> = {
  // Landscape 4:3. A portrait phone window must not become the tablet frame.
  tablet: { width: 1024, height: 768 },
  mobile: { width: 390, height: 844 },
  small_mobile: { width: 375, height: 812 },
};

export function sectionFrameAspect(
  slot: string | undefined,
  breakpoint: BreakpointKey,
  viewport: { width: number; height: number },
): number {
  const frame = slot ? FRAMES[slot]?.[breakpoint] ?? FRAMES[slot]?.desktop : undefined;
  if (!frame) return BREAKPOINT_ASPECT_RATIO[breakpoint];
  if ("ratio" in frame) return frame.ratio;
  const device = breakpoint === "desktop"
    ? (viewport.width >= 1024 ? viewport : { width: 1440, height: 900 })
    : DEVICE_VIEWPORT[breakpoint];
  const width = device.width * (frame.vw ?? 1);
  const height = Math.max(1, device.height * frame.vh);
  return width / height;
}
