/**
 * Replace the specification rows for one model.
 * Auth: Supabase session, same as the other model admin routes.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

interface SpecInput {
  category?: string
  spec_label?: string
  spec_value?: string
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
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
    const incoming = Array.isArray(body?.specs) ? body.specs as SpecInput[] : null
    if (!incoming) {
      return NextResponse.json({ error: 'specs harus berupa array' }, { status: 422 })
    }

    const rows = incoming
      .map((row, index) => ({
        model_id: model.id,
        category: String(row.category ?? '').trim(),
        spec_label: String(row.spec_label ?? '').trim(),
        spec_value: String(row.spec_value ?? '').trim(),
        sort_order: index,
      }))
      .filter((row) => row.category && row.spec_label && row.spec_value)

    const { error: deleteError } = await supabase
      .from('model_specifications')
      .delete()
      .eq('model_id', model.id)

    if (deleteError) throw deleteError

    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from('model_specifications')
        .insert(rows)
      if (insertError) throw insertError
    }

    revalidatePath(`/model/${slug}`, 'page')
    revalidatePath(`/model/${slug}/specifications`, 'page')
    revalidatePath(`/model/${slug}/technology`, 'page')

    return NextResponse.json({ ok: true, count: rows.length })
  } catch (err) {
    console.error('[API] PUT specs error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
