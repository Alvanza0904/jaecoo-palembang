/**
 * JAECOO Palembang — Sitemap
 * Regenerated at most every 60 seconds, and immediately after CMS publish.
 */

import type { MetadataRoute } from "next";
import { buildSitemapEntries, getSitemapModels, getSitemapNews, getSitemapPromos } from "@/lib/seo/sitemap-data";

export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [models, news, promos] = await Promise.all([
    getSitemapModels(),
    getSitemapNews(),
    getSitemapPromos(),
  ]);

  return buildSitemapEntries({ models, news, promos });
}
