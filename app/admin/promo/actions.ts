'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { PromoFormData } from '@/lib/types/promo';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function savePromo(id: string | null, formData: PromoFormData) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized access.' };

    const slug = formData.slug?.trim()
      ? formData.slug.trim().toLowerCase()
      : generateSlug(formData.title);

    const payload = {
      ...formData,
      slug,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { error } = await supabase.from('promos').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('promos').insert([payload]);
      if (error) throw error;
    }

    revalidatePath('/admin/promo');
    revalidatePath('/promo');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyimpan promo.';
    console.error('[savePromo]', message);
    return { success: false, error: message };
  }
}

export async function deletePromo(id: string) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'Unauthorized access.' };

    const { error } = await supabase.from('promos').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/promo');
    revalidatePath('/promo');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus promo.';
    console.error('[deletePromo]', message);
    return { success: false, error: message };
  }
}
