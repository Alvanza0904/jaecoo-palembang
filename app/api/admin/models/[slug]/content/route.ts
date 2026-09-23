/**
 * JAECOO Palembang — API Admin: Model Content
 * STEP 5B: PATCH content sections (overview, technology)
 *
 * Auth: Supabase session wajib.
 */

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ slug: string }>
}

const VALID_SECTIONS = ['overview', 'technology', 'hero', 'page']

export async function PATCH(req: NextRequest, { params }: RouteParams) {
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
    const { section, content } = body

    if (!section || !VALID_SECTIONS.includes(section)) {
      return NextResponse.json({ error: `Section tidak valid. Pilih: ${VALID_SECTIONS.join(', ')}` }, { status: 422 })
    }
    if (!content || typeof content !== 'object') {
      return NextResponse.json({ error: 'Content harus berupa object' }, { status: 422 })
    }

    // Upsert content (insert or update)
    const { data, error } = await supabase
      .from('model_content')
      .upsert(
        {
          model_id: model.id,
          section,
          content,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'model_id,section' }
      )
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/model/${slug}`, 'page')
    revalidatePath(`/model/${slug}/technology`, 'page')
    revalidatePath(`/model/${slug}/specifications`, 'page')

    return NextResponse.json({ content: data })
  } catch (err) {
    console.error('[API] PATCH content error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
