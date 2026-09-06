/**
 * JAECOO Palembang — API Admin: Single Variant
 * STEP 5B: PATCH update + DELETE variant
 * STEP 5B.1: price_status support, nullable price_idr / price_display
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
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
    const allowed = [
      'name', 'label',
      'price_status',
      'price_idr', 'price_display', 'price_display_override',
      'price_region', 'is_default',
    ]
    const updates: Record<string, unknown> = {}

    for (const key of allowed) {
      if (key in body) updates[key] = body[key]
    }

    // Validate name
    if ('name' in updates && !updates.name) {
      return NextResponse.json({ error: 'Nama variant wajib diisi' }, { status: 422 })
    }

    // Validate price_status
    if ('price_status' in updates) {
      if (!VALID_PRICE_STATUSES.includes(updates.price_status as typeof VALID_PRICE_STATUSES[number])) {
        return NextResponse.json(
          { error: `price_status tidak valid. Pilih: ${VALID_PRICE_STATUSES.join(', ')}` },
          { status: 422 }
        )
      }
    }

    // price_idr: nullable for non-amount statuses, required for official/starting_from
    const targetStatus = (updates.price_status as string | undefined) ?? undefined
    if ('price_idr' in updates) {
      if (updates.price_idr !== null && updates.price_idr !== undefined) {
        const n = Number(updates.price_idr)
        if (isNaN(n)) {
          return NextResponse.json({ error: 'Harga harus berupa angka' }, { status: 422 })
        }
        updates.price_idr = n
      }
    }

    // If status requires amount, price_idr must be present and > 0
    if (
      targetStatus &&
      PRICE_REQUIRES_AMOUNT.includes(targetStatus as typeof PRICE_REQUIRES_AMOUNT[number])
    ) {
      const priceVal = updates.price_idr
      if (!priceVal || Number(priceVal) <= 0) {
        return NextResponse.json(
          { error: `Harga (price_idr) wajib diisi untuk status "${targetStatus}"` },
          { status: 422 }
        )
      }
    }

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
