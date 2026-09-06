/**
 * JAECOO Palembang — Media Cutout Save API
 * STEP 5D: POST /api/admin/media/cutout
 *
 * Receives a WebP cutout (background-removed) from client-side processing
 * (@imgly/background-removal runs in browser via WebAssembly).
 *
 * Flow:
 *  1. Client does background removal in browser → gets transparent WebP Blob
 *  2. Client sends Blob + mediaId to this endpoint
 *  3. Server saves cutout to Supabase Storage (cutouts/ subfolder)
 *  4. Updates media_assets.cutout_url + processing_status
 *
 * Why client-side BG removal?
 *  - No GPU/ML server needed
 *  - @imgly/background-removal uses WebAssembly ONNX model in browser
 *  - Free, no API key, works offline
 *  - Processing stays in browser — server only stores the result
 *
 * Security: admin auth required.
 */

export const runtime = 'nodejs'
export const maxDuration = 30

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const mediaId = formData.get('mediaId') as string | null
  const cutoutFile = formData.get('cutout') as File | null

  if (!mediaId || !cutoutFile) {
    return NextResponse.json({ error: 'mediaId dan cutout file diperlukan' }, { status: 400 })
  }

  // Validate cutout is image/png or image/webp
  if (!['image/png', 'image/webp'].includes(cutoutFile.type)) {
    return NextResponse.json(
      { error: 'Cutout harus PNG atau WebP (mendukung transparency)' },
      { status: 422 }
    )
  }

  // Fetch original asset
  const { data: asset, error: fetchErr } = await supabase
    .from('media_assets')
    .select('id, storage_path, cutout_storage_path, processing_status')
    .eq('id', mediaId)
    .single()

  if (fetchErr || !asset) {
    return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
  }

  // If old cutout exists, remove it
  if (asset.cutout_storage_path) {
    await supabase.storage
      .from(BUCKET)
      .remove([asset.cutout_storage_path])
      .catch(() => { /* non-critical */ })
  }

  // Build cutout storage path
  const basePath = asset.storage_path.replace(/\.[^.]+$/, '')
  const cutoutPath = `${basePath}__cutout.webp`

  // Upload cutout
  const buffer = Buffer.from(await cutoutFile.arrayBuffer())

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(cutoutPath, buffer, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadErr) {
    console.error('[Cutout] Upload error:', uploadErr)
    return NextResponse.json(
      { error: 'Gagal upload cutout: ' + uploadErr.message },
      { status: 500 }
    )
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(cutoutPath)

  // Determine new status: if was 'ready' or 'partial', keep 'ready'
  const newStatus = asset.processing_status === 'uploaded' ? 'partial' : asset.processing_status

  const { data: updated, error: dbErr } = await supabase
    .from('media_assets')
    .update({
      cutout_url: urlData.publicUrl,
      cutout_storage_path: cutoutPath,
      processing_status: newStatus === 'failed' ? 'partial' : (newStatus ?? 'partial'),
      processing_error: null,
    })
    .eq('id', mediaId)
    .select()
    .single()

  if (dbErr) {
    return NextResponse.json(
      { error: 'Cutout uploaded tapi DB update gagal: ' + dbErr.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    cutout_url: urlData.publicUrl,
    asset: updated,
  })
}
