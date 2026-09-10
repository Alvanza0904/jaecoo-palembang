/**
 * Admin Content Media API
 * One assignment layer for homepage, models and brand assets.
 */
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

async function requireUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return { supabase, user }
}

function validate(body: Record<string, unknown>) {
  const content_type = typeof body.content_type === 'string' ? body.content_type.trim() : ''
  const content_key = typeof body.content_key === 'string' ? body.content_key.trim() : ''
  const slot_key = typeof body.slot_key === 'string' ? body.slot_key.trim() : ''
  const breakpoint = body.breakpoint == null || body.breakpoint === '' ? null : String(body.breakpoint)
  const media_asset_id = typeof body.media_asset_id === 'string' ? body.media_asset_id : ''
  if (!content_type || !content_key || !slot_key || !media_asset_id) {
    throw new Error('content_type, content_key, slot_key, dan media_asset_id wajib diisi.')
  }
  if (breakpoint && !['desktop', 'tablet', 'mobile', 'small_mobile'].includes(breakpoint)) {
    throw new Error('Breakpoint tidak valid.')
  }
  return { content_type, content_key, slot_key, breakpoint, media_asset_id }
}

function revalidate(content_type: string, content_key: string) {
  if (content_type === 'home') {
    revalidatePath('/', 'page')
  } else if (content_type === 'global') {
    revalidatePath('/', 'layout')
  } else if (content_type === 'model') {
    revalidatePath(`/model/${content_key}`, 'page')
    revalidatePath(`/model/${content_key}/technology`, 'page')
    revalidatePath(`/model/${content_key}/specifications`, 'page')
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase } = auth
    const p = req.nextUrl.searchParams
    const content_type = p.get('content_type')
    const content_key = p.get('content_key')
    if (!content_type || !content_key) return NextResponse.json({ error: 'content_type dan content_key wajib.' }, { status: 400 })

    let query = supabase
      .from('content_media')
      .select('id,content_type,content_key,slot_key,breakpoint,media_asset_id,media_assets(id,filename,public_url,alt_text,width,height,focal_x,focal_y)')
      .eq('content_type', content_type)
      .eq('content_key', content_key)
      .order('slot_key')
    const slot = p.get('slot_key')
    if (slot) query = query.eq('slot_key', slot)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ assignments: data ?? [] })
  } catch (err) {
    console.error('[Content Media GET]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Gagal memuat assignment.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase } = auth
    const body = await req.json()
    const assignment = validate(body)

    // Verify asset exists before creating a reference.
    const { data: asset, error: assetError } = await supabase
      .from('media_assets').select('id').eq('id', assignment.media_asset_id).single()
    if (assetError || !asset) return NextResponse.json({ error: 'Media asset tidak ditemukan.' }, { status: 422 })

    const { data, error } = await supabase
      .from('content_media')
      .upsert(assignment, { onConflict: 'content_type,content_key,slot_key,breakpoint' })
      .select('id,content_type,content_key,slot_key,breakpoint,media_asset_id')
      .single()
    if (error) throw error
    revalidate(assignment.content_type, assignment.content_key)
    return NextResponse.json({ assignment: data })
  } catch (err) {
    console.error('[Content Media PUT]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Gagal menyimpan media.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireUser()
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { supabase } = auth
    const p = req.nextUrl.searchParams
    const content_type = p.get('content_type')
    const content_key = p.get('content_key')
    const slot_key = p.get('slot_key')
    const breakpoint = p.get('breakpoint')
    if (!content_type || !content_key || !slot_key) return NextResponse.json({ error: 'Assignment tidak lengkap.' }, { status: 400 })

    let query = supabase.from('content_media').delete()
      .eq('content_type', content_type).eq('content_key', content_key).eq('slot_key', slot_key)
    query = breakpoint ? query.eq('breakpoint', breakpoint) : query.is('breakpoint', null)
    const { error } = await query
    if (error) throw error
    revalidate(content_type, content_key)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Content Media DELETE]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Gagal menghapus assignment.' }, { status: 500 })
  }
}
