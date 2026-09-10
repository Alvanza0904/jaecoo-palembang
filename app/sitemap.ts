/**
 * JAECOO Palembang — Sitemap
 */

import type { MetadataRoute } from "next";
import { getModelSlugs } from "@/lib/supabase/queries";
import { SITE_URL } from "@/lib/utils/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelSlugs = await getModelSlugs();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/promo`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/berita`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/sales-jaecoo-palembang`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  const modelRoutes: MetadataRoute.Sitemap = modelSlugs.flatMap((slug) => [
    { url: `${SITE_URL}/model/${slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${SITE_URL}/model/${slug}/technology`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${SITE_URL}/model/${slug}/specifications`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 },
  ]);

  return [...staticRoutes, ...modelRoutes];
}
