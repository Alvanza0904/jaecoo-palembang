/**
 * JAECOO Palembang — API Admin: Model Variants
 * STEP 5B: POST create new variant
 * STEP 5B.1: price_status support, nullable price_idr / price_display
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const VALID_PRICE_STATUSES = [
  'official',
  'prebook',
  'coming_soon',
  'contact_sales',
  'starting_from',
  'hidden',
] as const

const PRICE_REQUIRES_AMOUNT = ['official', 'starting_from'] as const

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
    const {
      variant_key, name, label,
      price_status = 'official',
      price_idr, price_display, price_display_override,
      price_region, is_default,
    } = body

    // Validate required fields
    if (!name?.trim()) return NextResponse.json({ error: 'Nama variant wajib diisi' }, { status: 422 })
    if (!variant_key?.trim()) return NextResponse.json({ error: 'Variant key wajib diisi' }, { status: 422 })

    // Validate price_status
    if (!VALID_PRICE_STATUSES.includes(price_status as typeof VALID_PRICE_STATUSES[number])) {
      return NextResponse.json(
        { error: `price_status tidak valid. Pilih: ${VALID_PRICE_STATUSES.join(', ')}` },
        { status: 422 }
      )
    }

    // Validate price_idr for statuses that require it
    const requiresAmount = PRICE_REQUIRES_AMOUNT.includes(
      price_status as typeof PRICE_REQUIRES_AMOUNT[number]
    )
    let priceIdrValue: number | null = null
    if (price_idr !== null && price_idr !== undefined && price_idr !== '') {
      const n = Number(price_idr)
      if (isNaN(n)) {
        return NextResponse.json({ error: 'Harga harus berupa angka' }, { status: 422 })
      }
      priceIdrValue = n
    }
    if (requiresAmount && (!priceIdrValue || priceIdrValue <= 0)) {
      return NextResponse.json(
        { error: `Harga (price_idr) wajib diisi untuk status "${price_status}"` },
        { status: 422 }
      )
    }

    // Auto-format price_display if not provided and price_idr exists
    let priceDisplayValue: string | null = price_display?.trim() || null
    if (!priceDisplayValue && priceIdrValue) {
      priceDisplayValue = `Rp${priceIdrValue.toLocaleString('id-ID')}`
    }

    const { data, error } = await supabase
      .from('model_variants')
      .insert({
        model_id: model.id,
        variant_key: variant_key.trim(),
        name: name.trim(),
        label: label?.trim() || null,
        price_status,
        price_idr: priceIdrValue,
        price_display: priceDisplayValue,
        price_display_override: price_display_override?.trim() || null,
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

    revalidatePath(`/model/${slug}`, 'page')
    revalidatePath(`/model/${slug}/specifications`, 'page')
    revalidatePath(`/sales-jaecoo-palembang`, 'page')
    revalidatePath('/', 'page')

    return NextResponse.json({ variant: data }, { status: 201 })
  } catch (err) {
    console.error('[API] POST /api/admin/models/[slug]/variants error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
