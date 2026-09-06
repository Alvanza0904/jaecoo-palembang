/**
 * JAECOO Palembang — API Admin: Model Variants
 * STEP 5B: POST create new variant
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

    // Get model id
    const { data: model, error: modelError } = await supabase
      .from('models')
      .select('id')
      .eq('slug', slug)
      .single()

    if (modelError || !model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 })
    }

    const body = await req.json()
    const { variant_key, name, label, price_idr, price_display, price_region, is_default } = body

    // Validate
    if (!name?.trim()) return NextResponse.json({ error: 'Nama variant wajib diisi' }, { status: 422 })
    if (!variant_key?.trim()) return NextResponse.json({ error: 'Variant key wajib diisi' }, { status: 422 })
    if (!price_idr || isNaN(Number(price_idr))) return NextResponse.json({ error: 'Harga harus berupa angka' }, { status: 422 })

    const { data, error } = await supabase
      .from('model_variants')
      .insert({
        model_id: model.id,
        variant_key: variant_key.trim(),
        name: name.trim(),
        label: label?.trim() || null,
        price_idr: Number(price_idr),
        price_display: price_display?.trim() || `Rp${Number(price_idr).toLocaleString('id-ID')}`,
        price_region: price_region?.trim() || 'OTR Palembang',
        is_default: Boolean(is_default),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Variant key sudah ada' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ variant: data }, { status: 201 })
  } catch (err) {
    console.error('[API] POST /api/admin/models/[slug]/variants error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
