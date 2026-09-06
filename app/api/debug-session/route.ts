/**
 * DEBUG ONLY — hapus setelah STEP 5A selesai
 */
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return NextResponse.json({
    hasUser: !!user,
    userId: user?.id ?? null,
    email: user?.email ?? null,
    error: error?.message ?? null,
    env: {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    }
  })
}
