/**
 * JAECOO Palembang — Admin News Management
 */

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NewsEditor } from './NewsEditor';

export const metadata = { title: 'News — JAECOO Admin' };
export const revalidate = 0;

interface NewsRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html?: string;
  category: string;
  cover_url?: string;
  published: boolean;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
}

async function getNews(): Promise<NewsRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('news')
      .select('id, slug, title, excerpt, body_html, category, cover_url, published, published_at, meta_title, meta_description')
      .order('published_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AdminNewsPage() {
  const news = await getNews();
  return <NewsEditor initialNews={news} />;
}
