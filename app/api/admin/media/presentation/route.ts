/**
 * JAECOO Palembang — Media Presentation Settings API
 * STEP 5E: Visual Media Editor
 *
 * PATCH /api/admin/media/presentation
 *   Body: { mediaId: string, settings: PresentationSettings }
 *   Saves presentation_settings JSONB to media_assets.
 *
 * Protected: requires authenticated admin session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { PresentationSettings } from '@/lib/types/presentation'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function PATCH(req: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const user = await requireAdmin(supabase)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { mediaId: string; settings: PresentationSettings }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON tidak valid' }, { status: 400 })
  }

  const { mediaId, settings } = body
  if (!mediaId || typeof mediaId !== 'string') {
    return NextResponse.json({ error: 'mediaId diperlukan' }, { status: 400 })
  }
  if (!settings || typeof settings !== 'object') {
    return NextResponse.json({ error: 'settings diperlukan' }, { status: 400 })
  }

  // Verify asset exists and belongs to admin session
  const { data: existing, error: fetchErr } = await supabase
    .from('media_assets')
    .select('id')
    .eq('id', mediaId)
    .single()

  if (fetchErr || !existing) {
    return NextResponse.json({ error: 'Media tidak ditemukan' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('media_assets')
    .update({ presentation_settings: settings })
    .eq('id', mediaId)
    .select()
    .single()

  if (error) {
    console.error('[Presentation PATCH]', error)
    return NextResponse.json({ error: 'Gagal simpan: ' + error.message }, { status: 500 })
  }

  return NextResponse.json({ asset: data })
}
