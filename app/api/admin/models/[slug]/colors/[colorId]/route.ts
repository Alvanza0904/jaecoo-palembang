/**
 * JAECOO Palembang — API Admin: Single Color
 * STEP 5B: PATCH update + DELETE color
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string; colorId: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { colorId } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const allowed = ['name', 'hex', 'sort_order']
    const updates: Record<string, unknown> = {}

    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if ('name' in updates && !updates.name) {
      return NextResponse.json({ error: 'Nama warna wajib diisi' }, { status: 422 })
    }
    if ('hex' in updates && !/^#[0-9A-Fa-f]{6}$/.test(String(updates.hex))) {
      return NextResponse.json({ error: 'Hex color tidak valid (format: #RRGGBB)' }, { status: 422 })
    }

    const { data, error } = await supabase
      .from('model_colors')
      .update(updates)
      .eq('id', colorId)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Color not found' }, { status: 404 })

    return NextResponse.json({ color: data })
  } catch (err) {
    console.error('[API] PATCH color error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { colorId } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('model_colors')
      .delete()
      .eq('id', colorId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API] DELETE color error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
