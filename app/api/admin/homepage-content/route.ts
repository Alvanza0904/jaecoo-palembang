/**
 * JAECOO Palembang — API Admin: Homepage Content
 *
 * PATCH /api/admin/homepage-content
 * Body: { hero?: {...}, experience?: {...}, ... }
 * Merge partial section ke homepage_content singleton (upsert by fixed UUID).
 *
 * Auth: Supabase session wajib.
 * DB write: menggunakan admin client (service role) untuk bypass RLS.
 */

import { NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server'

// Singleton UUID untuk homepage content
const SINGLETON_ID = '11111111-1111-1111-1111-111111111111'

// Section keys yang valid (whitelist — tidak ada arbitrary injection)
const VALID_SECTIONS = [
  'hero', 'experience', 'technology', 'about',
  'promo', 'journal', 'dealer_location', 'final_cta', 'seo',
] as const

type ValidSection = typeof VALID_SECTIONS[number]

export async function PATCH(request: Request) {
  try {
    // 1. Auth check
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse body
    const body = await request.json() as Record<string, unknown>

    // 3. Whitelist sections — hanya keys yang valid yang masuk DB
    const payload: Record<string, unknown> = {}
    for (const key of Object.keys(body)) {
      if ((VALID_SECTIONS as readonly string[]).includes(key)) {
        payload[key as ValidSection] = body[key]
      }
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Tidak ada section valid dalam payload.' }, { status: 400 })
    }

    // 4. Fetch current row agar bisa merge (tidak overwrite sections lain)
    const adminClient = createSupabaseAdminClient()
    const { data: existing } = await adminClient
      .from('homepage_content')
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle()

    // 5. Merge: section lama tetap, section baru di-update
    const merged = {
      ...(existing ?? {}),
      ...payload,
      id: SINGLETON_ID,
      updated_at: new Date().toISOString(),
    }

    // 6. Upsert ke Supabase
    const { error: upsertError } = await adminClient
      .from('homepage_content')
      .upsert(merged, { onConflict: 'id' })

    if (upsertError) {
      console.error('[API] homepage-content PATCH upsert error:', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, updated: Object.keys(payload) })

  } catch (err) {
    console.error('[API] homepage-content PATCH error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('id', SINGLETON_ID)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ content: data })
  } catch (err) {
    console.error('[API] homepage-content GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
