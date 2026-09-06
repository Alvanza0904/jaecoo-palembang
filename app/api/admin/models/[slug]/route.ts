/**
 * JAECOO Palembang — API Admin: Single Model
 * STEP 5B: GET + PATCH model basic information
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('models')
      .select(`
        *,
        model_variants(id, variant_key, name, label, price_idr, price_display, price_region, is_default),
        model_colors(id, color_key, name, hex, image_path, sort_order),
        model_content(section, content)
      `)
      .eq('slug', slug)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ model: data })
  } catch (err) {
    console.error('[API] GET /api/admin/models/[slug] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Allowed fields only — jangan biarkan client set arbitrary columns
    const allowed = ['name', 'short_name', 'tagline', 'description', 'published', 'sort_order']
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }

    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    // Validate required
    if ('name' in updates && !updates.name) {
      return NextResponse.json({ error: 'Model name wajib diisi' }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('models')
      .update(updates)
      .eq('slug', slug)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

    return NextResponse.json({ model: data })
  } catch (err) {
    console.error('[API] PATCH /api/admin/models/[slug] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
