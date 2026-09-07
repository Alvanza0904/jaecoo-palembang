/**
 * JAECOO Palembang — Cutout Alpha Bounding Box Detector
 * STEP 5F: AUTO Cutout Coordinate Mapping
 *
 * Detects the bounding box of non-transparent pixels in a cutout image
 * using the Canvas API (client-side only).
 *
 * Results are returned as percentages (0–100) so they are independent
 * of the image's natural resolution.
 *
 * Usage:
 *   const bbox = await detectCutoutBBox('https://...cutout.webp')
 *   // { xPct: 12.5, yPct: 20.0, wPct: 75.0, hPct: 60.0 }
 */

export interface CutoutBBox {
  /** Left edge of vehicle, as % of image width */
  x_pct: number
  /** Top edge of vehicle, as % of image height */
  y_pct: number
  /** Vehicle width, as % of image width */
  w_pct: number
  /** Vehicle height, as % of image height */
  h_pct: number
}

export interface BBoxResult {
  bbox: CutoutBBox
  /** ISO timestamp when computed */
  computed_at: string
  /** Whether the bbox looks anomalous (vehicle unusually small) */
  anomaly: boolean
  /** Anomaly description if applicable */
  anomaly_reason?: string
}

/**
 * Alpha threshold for considering a pixel as "vehicle" (not transparent).
 * 0–255. 10 filters out shadow artifacts and anti-aliasing noise.
 */
const ALPHA_THRESHOLD = 10

/**
 * Minimum fraction of canvas that vehicle should occupy before flagging anomaly.
 * e.g. 0.05 = vehicle must cover at least 5% of canvas width or height.
 */
const ANOMALY_MIN_FRACTION = 0.05

/**
 * Detect the bounding box of non-transparent pixels in a cutout image.
 *
 * Works by drawing the image onto an offscreen canvas (at reduced resolution
 * for performance) and scanning pixel alpha values.
 *
 * @param imageUrl - Public URL of the cutout image (must be CORS-accessible)
 * @returns BBoxResult with percentage coordinates, or null if detection fails
 */
export async function detectCutoutBBox(imageUrl: string): Promise<BBoxResult | null> {
  // Must run in browser
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return null
  }

  try {
    // Load image
    const img = await loadImage(imageUrl)
    const naturalW = img.naturalWidth
    const naturalH = img.naturalHeight

    if (!naturalW || !naturalH) return null

    // Use reduced resolution for scanning (max 512px wide) — faster, less memory
    // Results are stored as percentages so no precision is lost
    const SCAN_MAX = 512
    const scanScale = Math.min(1, SCAN_MAX / naturalW)
    const scanW = Math.round(naturalW * scanScale)
    const scanH = Math.round(naturalH * scanScale)

    // Draw to offscreen canvas
    const canvas = document.createElement('canvas')
    canvas.width = scanW
    canvas.height = scanH
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    ctx.drawImage(img, 0, 0, scanW, scanH)
    const imageData = ctx.getImageData(0, 0, scanW, scanH)
    const data = imageData.data // RGBA flat array

    // Scan for non-transparent pixels
    let minX = scanW
    let minY = scanH
    let maxX = -1
    let maxY = -1

    for (let y = 0; y < scanH; y++) {
      for (let x = 0; x < scanW; x++) {
        const idx = (y * scanW + x) * 4
        const alpha = data[idx + 3] // A channel
        if (alpha > ALPHA_THRESHOLD) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    // Nothing found
    if (maxX < 0 || maxY < 0) {
      return null
    }

    // Convert to percentages of scan canvas (= same as % of original, since uniform scale)
    const x_pct = round2((minX / scanW) * 100)
    const y_pct = round2((minY / scanH) * 100)
    const w_pct = round2(((maxX - minX + 1) / scanW) * 100)
    const h_pct = round2(((maxY - minY + 1) / scanH) * 100)

    // Anomaly detection
    const anomaly =
      w_pct / 100 < ANOMALY_MIN_FRACTION ||
      h_pct / 100 < ANOMALY_MIN_FRACTION
    const anomaly_reason = anomaly
      ? `Vehicle area unusually small: ${w_pct}% × ${h_pct}% of canvas`
      : undefined

    // Clean up offscreen canvas
    canvas.width = 0
    canvas.height = 0

    return {
      bbox: { x_pct, y_pct, w_pct, h_pct },
      computed_at: new Date().toISOString(),
      anomaly,
      anomaly_reason,
    }
  } catch (err) {
    console.warn('[detectCutoutBBox] failed:', err)
    return null
  }
}

// ─── Helpers ──────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
