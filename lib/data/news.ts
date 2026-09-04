/**
 * JAECOO Palembang — Mock News Data
 */

import type { NewsData } from "@/lib/types/news";

export const NEWS: NewsData[] = [
  {
    id: "news-001",
    slug: "jaecoo-hadir-di-palembang",
    title: "JAECOO Resmi Hadir di Palembang",
    excerpt: "JAECOO membawa lineup SUV premium ke Palembang, menghadirkan pilihan kendaraan modern yang belum pernah ada sebelumnya di Sumatera Selatan.",
    cover: {
      desktop: "/images/news/hadir-desktop.jpg",
      mobile: "/images/news/hadir-mobile.jpg",
      alt: "JAECOO resmi hadir di Palembang",
    },
    category: "Brand",
    published_at: "2025-01-10T08:00:00Z",
    updated_at: "2025-01-10T08:00:00Z",
    published: true,
  },
];

export function getPublishedNews(limit?: number): NewsData[] {
  const sorted = NEWS.filter((n) => n.published).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  return limit ? sorted.slice(0, limit) : sorted;
}

export function getNewsBySlug(slug: string): NewsData | undefined {
  return NEWS.find((n) => n.slug === slug && n.published);
}
