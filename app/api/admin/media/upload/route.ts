/**
 * JAECOO Palembang — Media Upload API
 * STEP 5D: POST /api/admin/media/upload
 *
 * Flow:
 *  1. Auth check
 *  2. Receive multipart/form-data: file + category + optional metadata
 *  3. Validate file type and size
 *  4. Upload ORIGINAL to Supabase Storage (originals/ subfolder — never overwritten)
 *  5. Save metadata to media_assets (status: 'uploaded')
 *  6. Trigger async processing (variants via /api/admin/media/process)
 *  7. Return created asset immediately — processing continues in background
 *
 * Original is ALWAYS stored safely under originals/ subfolder.
 * Variants and cutouts are stored alongside with __1920w, __thumb, __cutout suffixes.
 *
 * Security: service_role is NOT used. Auth via session + RLS.
 */

export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import {
  ALLOWED_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/types/media-asset'
import type { MediaCategory } from '@/lib/types/media-asset'

const BUCKET = 'jaecoo-media'

function buildOriginalPath(category: string, filename: string): string {
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
  const timestamp = Date.now()
  const parts = safe.split('.')
  const ext = parts.length > 1 ? '.' + parts[parts.length - 1] : ''
  const name = parts.slice(0, -1).join('.') || 'file'
  // Store originals in a dedicated subfolder — NEVER overwritten
  return `${category}/originals/${name}-${timestamp}${ext}`
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // ── 1. Auth ───────────────────────────────────────────────────────
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized — login required' }, { status: 401 })
    }

    // ── 2. Parse form data ─────────────────────────────────────────────
    let formData: FormData
    try {
      formData = await req.formData()
    } catch {
      return NextResponse.json(
        { error: 'Request body bukan multipart/form-data yang valid' },
        { status: 400 }
      )
    }

    const file      = formData.get('file') as File | null
    const category  = (formData.get('category') as string | null) ?? 'system'
    const focalXRaw = formData.get('focal_x')
    const focalYRaw = formData.get('focal_y')
    const widthRaw  = formData.get('width')
    const heightRaw = formData.get('height')
    const altText   = formData.get('alt_text') as string | null

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'File tidak ditemukan dalam request' }, { status: 400 })
    }

    // ── 3. Validate ────────────────────────────────────────────────────
    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: `Format file tidak didukung: "${file.type}". Gunakan JPG, PNG, WebP, AVIF, atau MP4.` },
        { status: 422 }
      )
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const mb = (file.size / (1024 * 1024)).toFixed(1)
      return NextResponse.json(
        { error: `File terlalu besar: ${mb} MB. Maksimum 20 MB.` },
        { status: 422 }
      )
    }

    // ── 4. Build storage path (original always in originals/) ──────────
    const storagePath = buildOriginalPath(category, file.name)

    // ── 5. Upload original to Supabase Storage ─────────────────────────
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: storageErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false, // NEVER overwrite originals
      })

    if (storageErr) {
      console.error('[Upload] Supabase Storage error:', storageErr)
      let msg = 'Upload ke storage gagal.'
      if (storageErr.message?.includes('already exists')) {
        msg = 'File dengan nama yang sama sudah ada. Coba rename file terlebih dahulu.'
      } else if (storageErr.message?.includes('Bucket not found')) {
        msg = 'Storage bucket belum dikonfigurasi. Hubungi administrator.'
      } else if (storageErr.message?.includes('row-level security')) {
        msg = 'Permission ditolak oleh RLS. Pastikan sudah login.'
      } else if (storageErr.message) {
        msg = 'Storage error: ' + storageErr.message
      }
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // ── 6. Get public URL ──────────────────────────────────────────────
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    // ── 7. Save metadata to media_assets ──────────────────────────────
    const insertPayload = {
      filename:           file.name,
      storage_path:       storagePath,
      storage_bucket:     BUCKET,
      public_url:         publicUrl,
      mime_type:          file.type,
      size_bytes:         file.size,
      category,
      focal_x:            focalXRaw ? Number(focalXRaw) : 50,
      focal_y:            focalYRaw ? Number(focalYRaw) : 50,
      width:              widthRaw ? Number(widthRaw) : null,
      height:             heightRaw ? Number(heightRaw) : null,
      alt_text:           altText ?? null,
      uploaded_by:        user.id,
      processing_status:  'uploaded',   // Will be updated by /process
      variants:           {},
    }

    const { data: asset, error: dbErr } = await supabase
      .from('media_assets')
      .insert(insertPayload)
      .select()
      .single()

    if (dbErr) {
      console.error('[Upload] DB insert error:', dbErr)
      // Clean up storage
      await supabase.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json(
        { error: 'Upload berhasil tapi metadata gagal disimpan: ' + dbErr.message },
        { status: 500 }
      )
    }

    // ── 8. Trigger processing in background ────────────────────────────
    // We fire-and-forget — the response returns immediately with 'uploaded' status.
    // The client polls /api/admin/media/[id] or shows a manual "Process" button.
    // This avoids Vercel timeout on slow images.
    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      const baseUrl = req.nextUrl.origin
      fetch(`${baseUrl}/api/admin/media/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Forward auth cookies for server-side auth check
          Cookie: req.headers.get('cookie') ?? '',
        },
        body: JSON.stringify({ mediaId: asset.id }),
      }).catch((err) => {
        // Non-fatal — processing can be retried manually
        console.warn('[Upload] Background processing trigger failed:', err)
      })
    }

    return NextResponse.json({ asset }, { status: 201 })
  } catch (err) {
    console.error('[Upload] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error tidak terduga. Coba lagi.' }, { status: 500 })
  }
}
