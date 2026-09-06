/**
 * JAECOO Palembang — API Admin: Model Colors
 * STEP 5B: POST create new color
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id')
      .eq('slug', slug)
      .single()

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const body = await req.json()
    const { color_key, name, hex, sort_order } = body

    if (!name?.trim()) return NextResponse.json({ error: 'Nama warna wajib diisi' }, { status: 422 })
    if (!color_key?.trim()) return NextResponse.json({ error: 'Color key wajib diisi' }, { status: 422 })
    if (!hex?.trim() || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return NextResponse.json({ error: 'Hex color tidak valid (format: #RRGGBB)' }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('model_colors')
      .insert({
        model_id: model.id,
        color_key: color_key.trim(),
        name: name.trim(),
        hex: hex.trim(),
        sort_order: Number(sort_order) || 0,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Color key sudah ada' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ color: data }, { status: 201 })
  } catch (err) {
    console.error('[API] POST colors error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
