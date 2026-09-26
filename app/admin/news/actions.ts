'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export interface NewsFormData {
  title: string;
  slug?: string;
  excerpt: string;
  body_html?: string;
  category: string;
  cover_url?: string;
  published: boolean;
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
}

export async function saveNews(id: string | null, formData: NewsFormData) {
  try {
    const admin = createSupabaseAdminClient();

    const slug = formData.slug?.trim()
      ? formData.slug.trim().toLowerCase()
      : generateSlug(formData.title);

    const payload = {
      ...formData,
      slug,
      updated_at: new Date().toISOString(),
      published_at: formData.published_at || new Date().toISOString(),
    };

    if (id) {
      const { error } = await admin.from('news').update(payload).eq('id', id);
      if (error) throw error;
    } else {
      const { error } = await admin.from('news').insert([payload]);
      if (error) throw error;
    }

    revalidatePath('/admin/news');
    revalidatePath('/berita');
    revalidatePath('/sitemap.xml');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));
    return { success: false, error: message };
  }
}

export async function deleteNews(id: string) {
  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from('news').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/admin/news');
    revalidatePath('/berita');
    revalidatePath('/sitemap.xml');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : (typeof err === 'object' ? JSON.stringify(err) : String(err));
    return { success: false, error: message };
  }
}
