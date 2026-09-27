/**
 * JAECOO Palembang — Sitemap
 * Regenerated at most every 60 seconds, and immediately after CMS publish.
 */

import type { MetadataRoute } from "next";
import { buildSitemapEntries, getSitemapModels, getSitemapNews, getSitemapPromos } from "@/lib/seo/sitemap-data";
import { SITE_URL } from "@/lib/utils/seo";

export const revalidate = 60;

const J7_SIVP_THUMBNAIL =
  "https://ztmlqoiqpzatyfetrqwe.supabase.co/storage/v1/object/public/jaecoo-media/system/img_9285-1790411447473.jpeg";
const J8_THUMBNAIL =
  "https://ztmlqoiqpzatyfetrqwe.supabase.co/storage/v1/object/public/jaecoo-media/system/img_7847-1790426340576.png";

const PAGE_VIDEOS: Record<string, NonNullable<MetadataRoute.Sitemap[number]["videos"]>> = {
  [`${SITE_URL}/model/jaecoo-j7-sivp/technology`]: [
    {
      title: "27 sensor dan kamera",
      thumbnail_loc: J7_SIVP_THUMBNAIL,
      description:
        "Jaringan sensor dan kamera JAECOO J7 SIVP memetakan lingkungan secara real-time, termasuk LiDAR, radar, dan kamera 540°.",
      content_loc:
        "https://ztmlqoiqpzatyfetrqwe.supabase.co/storage/v1/object/public/jaecoo-media/system/compressed_hd-1790407144555.mp4",
    },
    {
      title: "Platform SHS-P",
      thumbnail_loc: J7_SIVP_THUMBNAIL,
      description:
        "Platform SHS-P JAECOO J7 SIVP: baterai 18,3 kWh, jarak listrik 100 km, jarak kombinasi 1.300 km, dan pengisian AC 7,7 kW.",
      content_loc:
        "https://ztmlqoiqpzatyfetrqwe.supabase.co/storage/v1/object/public/jaecoo-media/system/-r07qxo-r-download-1790411039220.mp4",
    },
  ],
  [`${SITE_URL}/model/jaecoo-j8-shs/technology`]: [
    {
      title: "AWD · 7 mode ARDIS",
      thumbnail_loc: J8_THUMBNAIL,
      description:
        "Sistem ARDIS all-wheel drive JAECOO J8 dengan tujuh mode berkendara, termasuk karakter untuk jalan yang berubah.",
      content_loc:
        "https://ztmlqoiqpzatyfetrqwe.supabase.co/storage/v1/object/public/jaecoo-media/system/-r07qxo-r-download-1790427727774.mp4",
    },
  ],
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [models, news, promos] = await Promise.all([
    getSitemapModels(),
    getSitemapNews(),
    getSitemapPromos(),
  ]);

  return buildSitemapEntries({ models, news, promos }).map((entry) => {
    const videos = PAGE_VIDEOS[entry.url];
    return videos ? { ...entry, videos } : entry;
  });
}
