import { supabase } from '@/lib/supabase/client'
import { getModels } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  try {
    const { error } = await supabase.from('models').select('slug').limit(1)

    if (error) {
      return Response.json({
        status: 'error',
        supabase: false,
        error: error.message,
        code: error.code,
        env_url: url ? url.substring(0, 30) + '...' : 'MISSING',
        env_key: key ? 'set (' + key.substring(0, 10) + '...)' : 'MISSING',
      }, { status: 503 })
    }

    const models = await getModels()

    return Response.json({
      status: 'ok',
      supabase: true,
      models_count: models.length,
      env_url: url ? url.substring(0, 30) + '...' : 'MISSING',
      env_key: key ? 'set' : 'MISSING',
      models: models.map((m) => ({
        slug: m.slug,
        name: m.name,
        price: m.default_variant.price_display,
      })),
    })
  } catch (err) {
    const e = err as Error
    return Response.json({
      status: 'error',
      supabase: false,
      error: e.message,
      env_url: url ? url.substring(0, 30) + '...' : 'MISSING',
      env_key: key ? 'set (' + key.substring(0, 10) + '...)' : 'MISSING',
    }, { status: 503 })
  }
}
