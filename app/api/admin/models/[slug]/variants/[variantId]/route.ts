/**
 * JAECOO Palembang — API Admin: Single Variant
 * STEP 5B: PATCH update + DELETE variant
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string; variantId: string }>
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { variantId } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const allowed = ['name', 'label', 'price_idr', 'price_display', 'price_region', 'is_default']
    const updates: Record<string, unknown> = {}

    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    if ('name' in updates && !updates.name) {
      return NextResponse.json({ error: 'Nama variant wajib diisi' }, { status: 422 })
    }
    if ('price_idr' in updates && isNaN(Number(updates.price_idr))) {
      return NextResponse.json({ error: 'Harga harus berupa angka' }, { status: 422 })
    }
    if ('price_idr' in updates) updates.price_idr = Number(updates.price_idr)

    const { data, error } = await supabase
      .from('model_variants')
      .update(updates)
      .eq('id', variantId)
      .select()
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })

    return NextResponse.json({ variant: data })
  } catch (err) {
    console.error('[API] PATCH variant error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { variantId } = await params
    const supabase = await createSupabaseServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('model_variants')
      .delete()
      .eq('id', variantId)

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[API] DELETE variant error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
