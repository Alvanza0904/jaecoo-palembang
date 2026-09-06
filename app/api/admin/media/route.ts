/**
 * JAECOO Palembang — Media API
 * STEP 5C: GET /api/admin/media — list media assets
 *
 * Protected: requires authenticated admin session.
 * Supports ?category=models&search=foo query params.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Auth check
    const { data: { user }, error: authErr } = await supabase.auth.getUser()
    if (authErr || !user) {
      return NextResponse.json(
        { error: 'Unauthorized — login required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search   = searchParams.get('search')

    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }
    if (search && search.trim()) {
      query = query.ilike('filename', `%${search.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('[Media API] list error:', error)
      return NextResponse.json(
        { error: 'Gagal memuat media: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ assets: data ?? [] })
  } catch (err) {
    console.error('[Media API] unexpected error:', err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}
