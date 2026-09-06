/**
 * JAECOO Palembang — Media Asset API
 * STEP 5C:
 *   GET    /api/admin/media/[id] — get single asset
 *   PATCH  /api/admin/media/[id] — update focal point, category, etc.
 *   DELETE /api/admin/media/[id] — delete asset + storage file
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
  return NextResponse.json({ asset: data })
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
  const allowed = ['focal_x', 'focal_y', 'category', 'responsive_settings', 'text_color_mode', 'filename']
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

  // Get asset first to find storage path
  const { data: asset, error: fetchErr } = await supabase
    .from('media_assets')
    .select('storage_path, storage_bucket')
    .eq('id', id)
    .single()

  if (fetchErr || !asset) {
    return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
  }

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from(asset.storage_bucket || BUCKET)
    .remove([asset.storage_path])

  if (storageErr) {
    console.warn('[Media DELETE] storage error (continuing):', storageErr)
    // Don't abort — still delete the DB record even if storage fails
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
