/**
 * JAECOO Palembang — API Admin: Models List
 * STEP 5B: GET all models (termasuk unpublished) untuk admin panel
 *
 * Auth: Supabase session wajib.
 * Public user tidak bisa akses — 401 jika tidak auth.
 */

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('models')
      .select(`
        *,
        model_variants(id, variant_key, name, label, price_idr, price_display, price_region, is_default),
        model_colors(id, color_key, name, hex, sort_order),
        model_content(section, content)
      `)
      .order('sort_order')

    if (error) throw error

    return NextResponse.json({ models: data ?? [] })
  } catch (err) {
    console.error('[API] GET /api/admin/models error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
