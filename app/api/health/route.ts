import { testConnection, getModels } from '@/lib/supabase/queries'

export const dynamic = 'force-dynamic'

export async function GET() {
  const connection = await testConnection()

  if (!connection.ok) {
    return Response.json(
      {
        status: 'error',
        supabase: false,
        error: connection.error,
      },
      { status: 503 }
    )
  }

  const models = await getModels()

  return Response.json({
    status: 'ok',
    supabase: true,
    models_count: models.length,
    models: models.map((m) => ({
      slug: m.slug,
      name: m.name,
      price: m.default_variant.price_display,
    })),
  })
}
