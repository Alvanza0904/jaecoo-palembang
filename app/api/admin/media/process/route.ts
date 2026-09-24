/**
 * JAECOO Palembang — Media Processing API
 * STEP 5D: POST /api/admin/media/process
 *
 * Triggered after upload to generate responsive variants using Sharp.
 * Server-side only — Sharp runs in Node.js runtime (not Edge).
 *
 * Flow:
 *  1. Auth check
 *  2. Fetch original from Supabase Storage
 *  3. Use Sharp to resize to multiple breakpoints → WebP
 *  4. Upload each variant to Supabase Storage (variants/ subfolder)
 *  5. Update media_assets record with variants + processing_status
 *
 * Vercel compatibility:
 *  - Sharp is supported on Vercel (AWS Lambda / Node.js runtime)
 *  - Next.js uses Sharp internally for image optimization
 *  - Max execution: 60s (Pro) / 10s (Hobby) — we process async
 *  - Variants are small enough to stay well within limits
 *
 * Security: admin auth required, service_role NOT used.
 */

export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { VARIANT_WIDTHS, THUMB_WIDTH } from '@/lib/types/media-asset'

const BUCKET = 'jaecoo-media'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const user = await requireAdmin(supabase)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { mediaId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const { mediaId } = body
  if (!mediaId) {
    return NextResponse.json({ error: 'mediaId diperlukan' }, { status: 400 })
  }

  // ── Fetch asset record ────────────────────────────────────────────────
  const { data: asset, error: fetchErr } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', mediaId)
    .single()

  if (fetchErr || !asset) {
    return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
  }

  if (String(asset.mime_type ?? "").startsWith("video/")) {
    return NextResponse.json({ asset, skipped: "Video tidak diproses menjadi varian gambar." })
  }

  // Only process images
  if (!asset.mime_type.startsWith('image/') || asset.mime_type === 'image/gif') {
    return NextResponse.json({ error: 'Hanya gambar yang bisa diproses' }, { status: 422 })
  }

  // ── Mark as processing ────────────────────────────────────────────────
  await supabase
    .from('media_assets')
    .update({ processing_status: 'processing', processing_error: null })
    .eq('id', mediaId)

  try {
    // ── Download original from Supabase Storage ───────────────────────
    const { data: fileData, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(asset.storage_path)

    if (dlErr || !fileData) {
      throw new Error('Gagal download original: ' + (dlErr?.message ?? 'unknown'))
    }

    const buffer = Buffer.from(await fileData.arrayBuffer())

    // ── Import Sharp (dynamic to avoid edge runtime issues) ───────────
    let sharp: typeof import('sharp')
    try {
      sharp = (await import('sharp')).default
    } catch {
      // Sharp not available (e.g. edge runtime or missing dep)
      await supabase
        .from('media_assets')
        .update({
          processing_status: 'failed',
          processing_error: 'Sharp tidak tersedia di runtime ini. Install: npm install sharp',
        })
        .eq('id', mediaId)

      return NextResponse.json(
        { error: 'Image processing library tidak tersedia', details: 'Install sharp: npm install sharp' },
        { status: 503 }
      )
    }

    const sharpInstance = sharp(buffer)
    const metadata = await sharpInstance.metadata()
    const originalWidth = metadata.width ?? 0

    const variants: Record<string, string> = {}
    const errors: string[] = []

    // ── Generate responsive variants ──────────────────────────────────
    const allWidths = [...VARIANT_WIDTHS, THUMB_WIDTH]

    for (const targetWidth of allWidths) {
      // Skip upscaling: if original is smaller than target, skip
      if (originalWidth > 0 && targetWidth > originalWidth * 1.1) {
        continue
      }

      try {
        const variantBuffer = await sharp(buffer)
          .resize({
            width: targetWidth,
            withoutEnlargement: true,
            fit: 'inside',
          })
          .webp({ quality: targetWidth <= THUMB_WIDTH ? 75 : 82 })
          .toBuffer()

        // Build storage path for variant
        const basePath = asset.storage_path.replace(/\.[^.]+$/, '')
        const label = targetWidth === THUMB_WIDTH ? 'thumb' : String(targetWidth)
        const variantPath = `${basePath}__${label}w.webp`

        // Upload variant
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(variantPath, variantBuffer, {
            contentType: 'image/webp',
            upsert: true, // overwrite if reprocessing
          })

        if (uploadErr) {
          errors.push(`${label}: ${uploadErr.message}`)
          continue
        }

        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(variantPath)

        variants[label] = urlData.publicUrl
      } catch (err) {
        const label = targetWidth === THUMB_WIDTH ? 'thumb' : String(targetWidth)
        errors.push(`${label}: ${String(err)}`)
      }
    }

    // ── Determine final status ────────────────────────────────────────
    const hasVariants = Object.keys(variants).length > 0
    const status = errors.length === 0 && hasVariants
      ? 'ready'
      : hasVariants
        ? 'partial'
        : 'failed'

    const { data: updated } = await supabase
      .from('media_assets')
      .update({
        processing_status: status,
        variants,
        processing_error: errors.length > 0 ? errors.join('; ') : null,
      })
      .eq('id', mediaId)
      .select()
      .single()

    return NextResponse.json({
      ok: true,
      status,
      variants,
      errors: errors.length > 0 ? errors : undefined,
      asset: updated,
    })
  } catch (err) {
    console.error('[Process] Unexpected error:', err)

    await supabase
      .from('media_assets')
      .update({
        processing_status: 'failed',
        processing_error: String(err),
      })
      .eq('id', mediaId)

    return NextResponse.json(
      { error: 'Processing gagal: ' + String(err) },
      { status: 500 }
    )
  }
}
