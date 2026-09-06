/**
 * JAECOO Palembang — Supabase Server Client
 * STEP 5A: Admin Authentication
 *
 * Server-side client menggunakan @supabase/ssr untuk cookie-based auth.
 * Digunakan di Server Components, Server Actions, dan Route Handlers.
 *
 * ✅ Safe: menggunakan publishable key, tidak pernah service_role.
 * ✅ Cookie-based: session persist across refresh.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie writes handled by middleware
          }
        },
      },
    }
  )
}

/** Get current session (server-side) */
export async function getServerSession() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/** Get current user (server-side) */
export async function getServerUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
