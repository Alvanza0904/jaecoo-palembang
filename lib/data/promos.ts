/**
 * JAECOO Palembang — Promo Data Layer (Step 8.10)
 * Supabase sebagai Single Source of Truth.
 * Static data dihapus; semua query langsung ke tabel promos.
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Promo } from '@/lib/types/promo';

/** Ambil semua promo berstatus published untuk public page */
export async function getActivePromos(): Promise<Promo[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('promos')
      .select('*, models(id, name, slug)')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  } catch (err) {
    console.error('[getActivePromos]', err);
    return [];
  }
}

/** Ambil satu promo berdasarkan slug (published saja) */
export async function getPromoBySlug(slug: string): Promise<Promo | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('promos')
      .select('*, models(id, name, slug)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data ?? null;
  } catch {
    return null;
  }
}

/** Ambil slug semua promo published (untuk generateStaticParams) */
export async function getAllPromoSlugs(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('promos')
      .select('slug')
      .eq('status', 'published');

    return (data ?? []).map((p: { slug: string }) => p.slug);
  } catch {
    return [];
  }
}
