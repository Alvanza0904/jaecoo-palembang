/**
 * JAECOO Palembang — Media Asset API
 * STEP 5D:
 *   GET    /api/admin/media/[id] — get single asset (incl. variants + cutout)
 *   PATCH  /api/admin/media/[id] — update focal point, alt_text, etc.
 *   DELETE /api/admin/media/[id] — delete asset + all variants + cutout from storage
 *
 * Protected: requires authenticated admin session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const BUCKET = 'jaecoo-media'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const user = await requireAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('media_assets')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
  }
  const { count: usageCount } = await supabase
    .from('content_media').select('id', { count: 'exact', head: true }).eq('media_asset_id', id)
  return NextResponse.json({ asset: data, usage_count: usageCount ?? 0 })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const user = await requireAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 })
  }

  // Only allow safe fields to be updated
  const allowed = [
    'focal_x', 'focal_y', 'category',
    'responsive_settings', 'text_color_mode',
    'filename', 'alt_text',
    'presentation_settings',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) update[key] = body[key]
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Tidak ada field yang bisa diupdate' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('media_assets')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[Media PATCH]', error)
    return NextResponse.json({ error: 'Gagal update: ' + error.message }, { status: 500 })
  }
  return NextResponse.json({ asset: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const user = await requireAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Protect referenced assets before touching Storage. content_media is the
  // shared assignment layer for homepage, models and brand assets.
  const { count: usageCount, error: usageError } = await supabase
    .from('content_media')
    .select('id', { count: 'exact', head: true })
    .eq('media_asset_id', id)

  if (usageError) {
    console.error('[Media DELETE] usage lookup error:', usageError)
    return NextResponse.json({ error: 'Tidak dapat memeriksa penggunaan media. Penghapusan dibatalkan.' }, { status: 500 })
  }
  if ((usageCount ?? 0) > 0) {
    return NextResponse.json({
      error: `Media masih digunakan di ${usageCount} content slot. Lepaskan assignment terlebih dahulu sebelum menghapus.`,
      usage_count: usageCount,
    }, { status: 409 })
  }

  // Get asset first to find all storage paths
  const { data: asset, error: fetchErr } = await supabase
    .from('media_assets')
    .select('storage_path, storage_bucket, cutout_storage_path, variants')
    .eq('id', id)
    .single()

  if (fetchErr || !asset) {
    return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
  }

  // Collect all storage paths to delete
  const pathsToDelete: string[] = [asset.storage_path]

  if (asset.cutout_storage_path) {
    pathsToDelete.push(asset.cutout_storage_path)
  }

  // Add variant paths from variants JSONB
  if (asset.variants && typeof asset.variants === 'object') {
    const variants = asset.variants as Record<string, string>
    for (const url of Object.values(variants)) {
      // Extract path from public URL
      // URL: https://xxx.supabase.co/storage/v1/object/public/jaecoo-media/category/originals/file__1920w.webp
      try {
        const urlObj = new URL(url)
        const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
        if (pathMatch?.[1]) {
          pathsToDelete.push(pathMatch[1])
        }
      } catch {
        // Skip malformed URLs
      }
    }
  }

  // Delete all storage files (non-critical — continue even if some fail)
  const bucket = asset.storage_bucket || BUCKET
  const { error: storageErr } = await supabase.storage
    .from(bucket)
    .remove(pathsToDelete)

  if (storageErr) {
    console.warn('[Media DELETE] storage error (continuing):', storageErr)
  }

  // Delete from DB
  const { error: dbErr } = await supabase
    .from('media_assets')
    .delete()
    .eq('id', id)

  if (dbErr) {
    console.error('[Media DELETE] DB error:', dbErr)
    return NextResponse.json({ error: 'Gagal hapus dari database: ' + dbErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
