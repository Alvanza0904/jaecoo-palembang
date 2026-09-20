/**
 * JAECOO Palembang — News Data Layer
 * Primary: Supabase news table
 * Fallback: static mock data
 */

import type { NewsData } from "@/lib/types/news";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getEntityMedia } from "@/lib/supabase/media";

// Static fallback — used when Supabase is unavailable
const FALLBACK_NEWS: Omit<NewsData, "cover">[] = [
  {
    id: "news-001",
    slug: "jaecoo-hadir-di-palembang",
    title: "JAECOO Resmi Hadir di Palembang",
    excerpt:
      "JAECOO membawa lineup SUV premium ke Palembang, menghadirkan pilihan kendaraan modern yang belum pernah ada sebelumnya di Sumatera Selatan.",
    body_html: undefined,
    category: "Brand",
    published_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z",
    published: true,
  },
];

/**
 * Try to fetch from Supabase news table.
 * Columns: id, slug, title, excerpt, body_html, category, published_at, updated_at, published, cover_url, meta_title, meta_description
 */
async function fetchNewsFromSupabase(limit?: number): Promise<NewsData[] | null> {
  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase
      .from("news")
      .select("id, slug, title, excerpt, body_html, category, published_at, updated_at, published, cover_url, meta_title, meta_description")
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      slug: row.slug as string,
      title: row.title as string,
      excerpt: (row.excerpt as string) ?? "",
      body_html: row.body_html as string | undefined,
      category: (row.category as string) ?? "News",
      published_at: row.published_at as string,
      updated_at: row.updated_at as string,
      published: Boolean(row.published),
      meta_title: row.meta_title as string | undefined,
      meta_description: row.meta_description as string | undefined,
      cover: {
        desktop: row.cover_url as string | undefined,
        mobile: row.cover_url as string | undefined,
        alt: row.title as string,
      },
    }));
  } catch {
    return null;
  }
}

export async function getPublishedNews(limit?: number): Promise<NewsData[]> {
  // Try Supabase first
  const supabaseData = await fetchNewsFromSupabase(limit);
  if (supabaseData && supabaseData.length > 0) return supabaseData;

  // Fallback to mock + media enrichment
  const sorted = FALLBACK_NEWS.filter((n) => n.published).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  const selected = limit ? sorted.slice(0, limit) : sorted;

  return Promise.all(
    selected.map(async (news) => ({
      ...news,
      cover: (await getEntityMedia("news", news.id, "cover")) ?? { alt: news.title },
    }))
  );
}

export async function getNewsBySlug(slug: string): Promise<NewsData | undefined> {
  // Try Supabase first
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("id, slug, title, excerpt, body_html, category, published_at, updated_at, published, cover_url, meta_title, meta_description")
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? "",
        body_html: data.body_html ?? undefined,
        category: data.category ?? "News",
        published_at: data.published_at,
        updated_at: data.updated_at,
        published: Boolean(data.published),
        meta_title: data.meta_title ?? undefined,
        meta_description: data.meta_description ?? undefined,
        cover: {
          desktop: data.cover_url ?? undefined,
          mobile: data.cover_url ?? undefined,
          alt: data.title,
        },
      };
    }
  } catch {
    // fallthrough
  }

  // Fallback to mock
  const news = FALLBACK_NEWS.find((n) => n.slug === slug && n.published);
  if (!news) return undefined;
  return {
    ...news,
    cover: (await getEntityMedia("news", news.id, "cover")) ?? { alt: news.title },
  };
}

// For generateStaticParams
export async function getAllNewsSlugs(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("news")
      .select("slug")
      .eq("published", true);
    if (data && data.length > 0) return data.map((r: { slug: string }) => r.slug);
  } catch {
    // fallthrough
  }
  return FALLBACK_NEWS.filter((n) => n.published).map((n) => n.slug);
}
