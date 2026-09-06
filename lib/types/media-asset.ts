/**
 * JAECOO Palembang — Media Asset Types
 * STEP 5C: Media System
 *
 * MediaAsset = row in media_assets table.
 * Covers upload metadata, focal points, and responsive art direction.
 */

export type MediaCategory =
  | 'models'
  | 'promos'
  | 'news'
  | 'gallery'
  | 'about'
  | 'og'
  | 'system'

export type TextColorMode = 'auto' | 'light' | 'dark' | 'custom'

/** Per-breakpoint art direction overrides */
export interface BreakpointArtDirection {
  focal_x?: number  // 0–100
  focal_y?: number  // 0–100
  /** CSS object-position x (e.g. "center", "72%") */
  x?: string
  /** CSS object-position y (e.g. "45%") */
  y?: string
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

export const MAX_FILE_SIZE_MB = 10
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

/** Format file size for display */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Validate file before upload */
export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return `Format tidak didukung: ${file.type}. Gunakan JPG, PNG, WebP, AVIF, atau MP4.`
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File terlalu besar: ${formatFileSize(file.size)}. Maksimum ${MAX_FILE_SIZE_MB} MB.`
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
export function buildStoragePath(category: MediaCategory, filename: string): string {
  // Sanitize filename: lowercase, replace spaces, keep extension
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  const timestamp = Date.now()
  const [name, ...extParts] = safe.split('.')
  const ext = extParts.length > 0 ? '.' + extParts.join('.') : ''
  return `${category}/${name}-${timestamp}${ext}`
}

/** focal_x/Y 0–100 → CSS object-position */
export function focalToObjectPosition(focal_x = 50, focal_y = 50): string {
  return `${focal_x}% ${focal_y}%`
}
