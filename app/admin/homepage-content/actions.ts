'use server'

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HomepageContent } from '@/types/homepage-content';

// Singleton UUID untuk homepage content (selalu satu baris di tabel)
const SINGLETON_UUID = '11111111-1111-1111-1111-111111111111';

// ─────────────────────────────────────────────────────────────
// LEGACY: Digunakan oleh ContentEditor.tsx (backward compat)
// ─────────────────────────────────────────────────────────────
export async function updateHomepageContent(data: HomepageContent) {
  return saveHomepageContent(data.id, data as unknown as Record<string, unknown>);
}

// ─────────────────────────────────────────────────────────────
// UNIFIED EDITOR: Action utama yang mendukung struktur JSONB baru
// Mendukung: desktop_image, mobile_image, text_position_mode,
//            desktop_position, mobile_position per section
// ─────────────────────────────────────────────────────────────
export async function saveHomepageContent(
  id: string | null | undefined,
  data: Record<string, unknown>
) {
  try {
    // Cek auth dulu dengan regular client
    const authClient = await createSupabaseServerClient();
    const { data: sessionData, error: authError } = await authClient.auth.getUser();
    if (authError || !sessionData.user) {
      return { success: false, error: 'Unauthorized access.' };
    }

    // FIX UUID: 'fallback-id' atau falsy → Singleton UUID
    const validId =
      !id || id === 'fallback-id'
        ? SINGLETON_UUID
        : id;

    // Bersihkan metadata form lokal sebelum masuk ke DB
    const payload = { ...data };
    delete payload.id;
    delete payload.updated_at;

    // Pakai Admin Client (service role) untuk bypass RLS pada write
    const adminClient = createSupabaseAdminClient();
    const { error } = await adminClient
      .from('homepage_content')
      .upsert(
        {
          id: validId,
          ...payload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/homepage-content');
    return { success: true };

  } catch (err) {
    console.error('Error saving homepage content:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return { success: false, error: message };
  }
}
