/**
 * JAECOO Palembang — Mock News Data
 */

import type { NewsData } from "@/lib/types/news";
import { getEntityMedia } from "@/lib/supabase/media";

export const NEWS: NewsData[] = [
  {
    id: "news-001",
    slug: "jaecoo-hadir-di-palembang",
    title: "JAECOO Resmi Hadir di Palembang",
    excerpt: "JAECOO membawa lineup SUV premium ke Palembang, menghadirkan pilihan kendaraan modern yang belum pernah ada sebelumnya di Sumatera Selatan.",
    cover: {
      desktop: undefined,
      mobile: undefined,
      alt: "JAECOO resmi hadir di Palembang",
    },
    category: "Brand",
    published_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z",
    published: true,
  },
];

export async function getPublishedNews(limit?: number): Promise<NewsData[]> {
  const sorted = NEWS.filter((n) => n.published).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );
  const selected = limit ? sorted.slice(0, limit) : sorted;

  return Promise.all(
    selected.map(async (news) => ({
      ...news,
      cover:
        (await getEntityMedia("news", news.id, "cover")) ??
        { alt: news.title },
    })),
  );
}

export async function getNewsBySlug(slug: string): Promise<NewsData | undefined> {
  const news = NEWS.find((n) => n.slug === slug && n.published);
  if (!news) return undefined;
  return {
    ...news,
    cover: (await getEntityMedia("news", news.id, "cover")) ?? { alt: news.title },
  };
}
