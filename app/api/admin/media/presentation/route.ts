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
import { revalidatePath } from 'next/cache'
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

  // Revalidate all model pages that could use this media asset.
  // We query model_content to find which models reference this mediaId,
  // then revalidate only those slugs. If query fails, revalidate all models.
  try {
    const { data: usages } = await supabase
      .from('model_content')
      .select('models!inner(slug), content')
      .eq('section', 'hero')

    const slugsToRevalidate = new Set<string>()

    for (const usage of usages ?? []) {
      const heroContent = usage.content as Record<string, unknown> | null
      const bgId = heroContent?.media_asset_id
      const cutoutId = heroContent?.cutout_media_id
      if (bgId === mediaId || cutoutId === mediaId) {
        const slug = (usage.models as { slug: string } | null)?.slug
        if (slug) slugsToRevalidate.add(slug)
      }
    }

    // If no specific slug found, revalidate common paths
    if (slugsToRevalidate.size === 0) {
      revalidatePath('/model/[slug]', 'page')
    } else {
      for (const slug of slugsToRevalidate) {
        revalidatePath(`/model/${slug}`, 'page')
        revalidatePath(`/model/${slug}/specifications`, 'page')
        console.log(`[Presentation PATCH] Revalidated /model/${slug}`)
      }
    }
  } catch (revalErr) {
    // Non-fatal — asset is saved, just cache may be stale
    console.warn('[Presentation PATCH] revalidatePath failed:', revalErr)
  }

  return NextResponse.json({ asset: data })
}
