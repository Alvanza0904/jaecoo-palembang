import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils/seo";
import { createSupabasePublicClient } from "@/lib/supabase/server";

export interface DatedSlug {
  slug: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
}

const MODEL_SUBPATHS = ["", "/technology", "/specifications"] as const;

export function indexableSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  if (!slug || slug.includes("/") || slug.includes(" ") || slug.includes("\\") || slug.includes("..")) return null;
  return slug;
}

export function contentLastModified(row: Pick<DatedSlug, "updatedAt" | "publishedAt">): Date | undefined {
  for (const value of [row.updatedAt, row.publishedAt]) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}

function route(path: string, lastModified: Date | undefined, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number): MetadataRoute.Sitemap[number] {
  return {
    url: path ? `${SITE_URL}${path}` : SITE_URL,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  };
}

export function buildSitemapEntries(input: {
  models: DatedSlug[];
  news: DatedSlug[];
  promos: DatedSlug[];
}): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  const add = (entry: MetadataRoute.Sitemap[number]) => {
    if (!entry.url.startsWith(`${SITE_URL}/`) && entry.url !== SITE_URL) return;
    if (entry.url.includes("www.") || seen.has(entry.url)) return;
    seen.add(entry.url);
    entries.push(entry);
  };

  const staticRoutes: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/promo", changeFrequency: "weekly", priority: 0.8 },
    { path: "/berita", changeFrequency: "weekly", priority: 0.7 },
    { path: "/gallery", changeFrequency: "monthly", priority: 0.6 },
    { path: "/sales-jaecoo-palembang", changeFrequency: "monthly", priority: 0.8 },
  ];

  for (const item of staticRoutes) {
    add(route(item.path, undefined, item.changeFrequency, item.priority));
  }

  for (const model of input.models) {
    const slug = indexableSlug(model.slug);
    if (!slug) continue;
    const modified = contentLastModified(model);
    add(route(`/model/${slug}`, modified, "weekly", 0.9));
    for (const subpath of MODEL_SUBPATHS) {
      if (!subpath) continue;
      add(route(`/model/${slug}${subpath}`, modified, "monthly", 0.7));
    }
  }

  for (const article of input.news) {
    const slug = indexableSlug(article.slug);
    if (!slug) continue;
    add(route(`/berita/${slug}`, contentLastModified(article), "monthly", 0.6));
  }

  for (const promo of input.promos) {
    const slug = indexableSlug(promo.slug);
    if (!slug) continue;
    add(route(`/promo/${slug}`, contentLastModified(promo), "weekly", 0.7));
  }

  return entries;
}

export async function getSitemapModels(): Promise<DatedSlug[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("models")
      .select("slug, updated_at")
      .eq("published", true)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).flatMap((row) => {
      const slug = indexableSlug(row.slug);
      return slug ? [{ slug, updatedAt: row.updated_at }] : [];
    });
  } catch (error) {
    console.warn("[sitemap] models query failed:", error);
    return [];
  }
}

export async function getSitemapNews(): Promise<DatedSlug[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("news")
      .select("slug, updated_at, published_at")
      .eq("published", true);
    if (error) throw error;
    return (data ?? []).flatMap((row) => {
      const slug = indexableSlug(row.slug);
      return slug ? [{ slug, updatedAt: row.updated_at, publishedAt: row.published_at }] : [];
    });
  } catch (error) {
    console.warn("[sitemap] news query failed:", error);
    return [];
  }
}

export async function getSitemapPromos(): Promise<DatedSlug[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("promos")
      .select("slug, updated_at, created_at")
      .eq("status", "published");
    if (error) throw error;
    return (data ?? []).flatMap((row) => {
      const slug = indexableSlug(row.slug);
      return slug ? [{ slug, updatedAt: row.updated_at, publishedAt: row.created_at }] : [];
    });
  } catch (error) {
    console.warn("[sitemap] promos query failed:", error);
    return [];
  }
}
