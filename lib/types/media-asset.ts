/**
 * JAECOO Palembang — Media Asset Types
 * STEP 5D: Smart Media Processing
 *
 * MediaAsset = row in media_assets table.
 * Covers upload metadata, focal points, responsive variants, cutout.
 */

export type MediaCategory =
  | 'models'
  | 'promos'
  | 'news'
  | 'gallery'
  | 'about'
  | 'og'
  | 'system'

export type MediaProcessingStatus =
  | 'uploaded'    // original uploaded, awaiting processing
  | 'processing'  // variants/cutout being generated
  | 'ready'       // all processing complete
  | 'partial'     // original ok, some processing failed
  | 'failed'      // processing failed (original still accessible)

export type TextColorMode = 'auto' | 'light' | 'dark' | 'custom'

/** Per-breakpoint art direction overrides */
export interface BreakpointArtDirection {
  focal_x?: number  // 0–100
  focal_y?: number  // 0–100
  x?: string        // CSS object-position x
  y?: string        // CSS object-position y
  scale?: number
  text_x?: number
  text_y?: number
  text_width?: number
}

export interface ResponsiveSettings {
  desktop?: BreakpointArtDirection
  tablet?: BreakpointArtDirection
  mobile?: BreakpointArtDirection
  small_mobile?: BreakpointArtDirection
}

/** Responsive variant URLs */
export interface MediaVariants {
  '1920'?: string
  '1440'?: string
  '1024'?: string
  '768'?: string
  '480'?: string
  thumb?: string
  og?: string
}

/** Full media asset record (matches media_assets table) */
export interface MediaAsset {
  id: string
  filename: string
  storage_path: string
  storage_bucket: string
  public_url: string | null
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  category: MediaCategory
  focal_x: number
  focal_y: number
  responsive_settings: ResponsiveSettings
  text_color_mode: TextColorMode
  // STEP 5D additions
  processing_status: MediaProcessingStatus
  cutout_url: string | null
  cutout_storage_path: string | null
  variants: MediaVariants
  alt_text: string | null
  processing_error: string | null
  // STEP 5E: Visual Editor presentation settings
  presentation_settings?: import('./presentation').PresentationSettings
  // Meta
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

/** Upload payload sent to /api/admin/media/upload */
export interface UploadMediaPayload {
  file: File
  category: MediaCategory
}

/** Metadata stored in DB after upload */
export interface CreateMediaAssetPayload {
  filename: string
  storage_path: string
  public_url: string
  mime_type: string
  size_bytes: number
  width?: number
  height?: number
  category: MediaCategory
  focal_x?: number
  focal_y?: number
}

/** Allowed MIME types for upload */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const

export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'] as const

export const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as const

export const MAX_FILE_SIZE_MB = 20
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const MEDIA_CATEGORIES: { value: MediaCategory; label: string }[] = [
  { value: 'models',  label: 'Models' },
  { value: 'promos',  label: 'Promos' },
  { value: 'news',    label: 'News' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'about',   label: 'About' },
  { value: 'og',      label: 'OG' },
  { value: 'system',  label: 'System' },
]

/** Processing status display labels */
export const PROCESSING_STATUS_LABEL: Record<MediaProcessingStatus, string> = {
  uploaded:   'Menunggu',
  processing: 'Processing…',
  ready:      'Ready',
  partial:    'Sebagian Selesai',
  failed:     'Gagal',
}

export const PROCESSING_STATUS_COLOR: Record<MediaProcessingStatus, string> = {
  uploaded:   '#94a3b8',
  processing: '#f59e0b',
  ready:      '#22c55e',
  partial:    '#f97316',
  failed:     '#ef4444',
}

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

import { MAX_VIDEO_BYTES } from "./video";

/** Validate file before upload */
export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return `Format tidak didukung: ${file.type || "tidak dikenal"}. Gunakan JPG, PNG, WebP, AVIF, MP4, atau WebM.`
  }
  const video = file.type.startsWith("video/")
  const limit = video ? MAX_VIDEO_BYTES : 10 * 1024 * 1024
  if (file.size > limit) {
    return `File terlalu besar: ${formatFileSize(file.size)}. Maksimum ${video ? "50 MB" : "10 MB"}.`
  }
  return null
}

/** Get image dimensions from a File object */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Tidak bisa membaca dimensi gambar'))
    }
    img.src = url
  })
}

/** Build storage path from category and filename */
export function buildStoragePath(category: MediaCategory, filename: string, prefix?: string): string {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  const timestamp = Date.now()
  const parts = safe.split('.')
  const ext = parts.length > 1 ? '.' + parts[parts.length - 1] : ''
  const name = parts.slice(0, -1).join('.')
  const prefixStr = prefix ? `${prefix}/` : ''
  return `${category}/${prefixStr}${name}-${timestamp}${ext}`
}

/** focal_x/Y 0–100 → CSS object-position */
export function focalToObjectPosition(focal_x = 50, focal_y = 50): string {
  return `${focal_x}% ${focal_y}%`
}

/** Filename stem shared by an original and its resized variants. */
export function mediaStem(url?: string | null): string {
  if (!url) return ""
  const file = decodeURIComponent(url.split("?")[0].split("/").pop() || "")
  return file
    .replace(/__(?:\d+w|thumb|cutout|og)\.webp$/i, "")
    .replace(/\.(jpe?g|png|webp|avif)$/i, "")
    .toLowerCase()
}

/** A variant is usable only when it was generated from the current original. */
export function variantMatchesSource(publicUrl?: string | null, variantUrl?: string | null): boolean {
  if (!variantUrl) return false
  const source = mediaStem(publicUrl)
  if (!source) return true
  return mediaStem(variantUrl) === source
}

export function pickOwnedUrl(
  publicUrl: string | null | undefined,
  variants: MediaVariants | Record<string, string> | null | undefined,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const url = variants?.[key as keyof MediaVariants]
    if (url && variantMatchesSource(publicUrl, url)) return url
  }
  return publicUrl ?? undefined
}

/** Get best available URL for a media asset (variant → original) */
export function getBestUrl(
  asset: MediaAsset,
  preferredWidth: 1920 | 1440 | 1024 | 768 | 480 | 'thumb' = 1440
): string {
  return pickOwnedUrl(asset.public_url, asset.variants, [String(preferredWidth), "1440", "1920"]) ?? ""
}

/** Check if an asset has a cutout available */
export function hasCutout(asset: MediaAsset): boolean {
  return !!asset.cutout_url
}

/** Responsive variants config — widths to generate */
export const VARIANT_WIDTHS = [1920, 1440, 1024, 768, 480] as const
export const THUMB_WIDTH = 320
export type VariantWidth = (typeof VARIANT_WIDTHS)[number]
