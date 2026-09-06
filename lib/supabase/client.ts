/**
 * JAECOO Palembang — Supabase Browser Client
 * STEP 5A fix: gunakan createBrowserClient dari @supabase/ssr
 * agar session cookie di-set dengan benar dan terbaca oleh server.
 */

import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
