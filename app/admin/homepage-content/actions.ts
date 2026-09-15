'use server'

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { HomepageContent } from '@/types/homepage-content';

// Singleton UUID untuk homepage content (selalu satu baris di tabel)
const SINGLETON_UUID = '11111111-1111-1111-1111-111111111111';

export async function updateHomepageContent(data: HomepageContent) {
  try {
    const supabase = await createSupabaseServerClient();

    // Authorization Check
    const { data: sessionData, error: authError } = await supabase.auth.getUser();
    if (authError || !sessionData.user) {
      return { success: false, error: "Unauthorized access." };
    }

    // FIX UUID: Pastikan id selalu berupa UUID valid
    // 'fallback-id' atau string kosong → pakai Singleton UUID
    const validId =
      !data.id || data.id === 'fallback-id'
        ? SINGLETON_UUID
        : data.id;

    const { id: _id, ...updateData } = data;

    // FIX: Gunakan UPSERT agar aman baik row sudah ada maupun belum
    const { error } = await supabase
      .from('homepage_content')
      .upsert(
        {
          id: validId,
          ...updateData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error("Supabase upsert error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/homepage-content');

    return { success: true };
  } catch (error) {
    console.error("Action updateHomepageContent failed:", error);
    return { success: false, error: "Internal server error" };
  }
}
