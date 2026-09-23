import { createSupabaseServerClient } from "./server";
import type { ResponsiveImage } from "@/lib/types/media";

export interface ContentMediaAssignment {
  content_type: string;
  content_key: string;
  slot_key: string;
  breakpoint: string | null;
  media_asset_id: string;
}

export interface ResolvedMediaAsset {
  id: string;
  public_url: string | null;
  variants: Record<string, string> | null;
  filename: string | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  focal_x: number | null;
  focal_y: number | null;
  cutout_url: string | null;
  presentation_settings?: import("@/lib/types/presentation").PresentationSettings;
}

type MediaRow = ResolvedMediaAsset;

export function mediaAssetToImage(
  asset: MediaRow | undefined,
  altFallback = "JAECOO",
): ResponsiveImage | undefined {
  if (!asset) return undefined;

  const variants = asset.variants ?? {};
  const base = asset.public_url ?? undefined;
  const image: ResponsiveImage = {
    desktop: variants["1920"] ?? variants["1440"] ?? base,
    tablet: variants["1024"] ?? variants["768"] ?? base,
    mobile: variants["768"] ?? variants["480"] ?? base,
    small_mobile: variants["480"] ?? base,
    alt: asset.alt_text ?? asset.filename ?? altFallback,
    width: asset.width ?? undefined,
    height: asset.height ?? undefined,
    presentation_settings: asset.presentation_settings,
    focal_x: asset.focal_x ?? undefined,
    focal_y: asset.focal_y ?? undefined,
    cutout: asset.cutout_url ?? undefined,
  };

  if (!image.desktop && !image.tablet && !image.mobile && !image.small_mobile) {
    return undefined;
  }

  return image;
}

/**
 * Central resolver for CMS image assignments.
 *
 * content_media is deliberately only a relation table: the binary and its
 * metadata remain in media_assets / Supabase Storage. This keeps one media
 * architecture for homepage, models, news and promos.
 */
export async function getContentMedia(
  assignments: Array<{
    content_type: string;
    content_key: string;
    slot_key: string;
  }>,
): Promise<Record<string, ResponsiveImage>> {
  if (!assignments.length) return {};

  try {
    const supabase = await createSupabaseServerClient();

    const orFilter = assignments
      .map(
        (a) =>
          `and(content_type.eq.${a.content_type},content_key.eq.${a.content_key},slot_key.eq.${a.slot_key})`,
      )
      .join(",");

    const { data, error } = await supabase
      .from("content_media")
      .select("content_type,content_key,slot_key,breakpoint,media_asset_id")
      .or(orFilter);

    if (error) throw error;

    const rows = (data ?? []) as ContentMediaAssignment[];
    const ids = Array.from(new Set(rows.map((row) => row.media_asset_id).filter(Boolean)));
    if (!ids.length) return {};

    const { data: mediaRows, error: mediaError } = await supabase
      .from("media_assets")
      .select(
        "id,public_url,variants,filename,width,height,alt_text,focal_x,focal_y,cutout_url,presentation_settings",
      )
      .in("id", ids);

    if (mediaError) throw mediaError;

    const assets = new Map(
      ((mediaRows ?? []) as MediaRow[]).map((asset) => [asset.id, asset]),
    );

    const result: Record<string, ResponsiveImage> = {};

    for (const request of assignments) {
      const matching = rows.filter(
        (row) =>
          row.content_type === request.content_type &&
          row.content_key === request.content_key &&
          row.slot_key === request.slot_key,
      );

      if (!matching.length) continue;

      const byBreakpoint = new Map<string | null, MediaRow>();
      for (const row of matching) {
        const asset = assets.get(row.media_asset_id);
        if (asset) byBreakpoint.set(row.breakpoint, asset);
      }

      const universal = byBreakpoint.get(null);
      const desktop = byBreakpoint.get("desktop") ?? universal;
      const tablet = byBreakpoint.get("tablet") ?? universal;
      const mobile = byBreakpoint.get("mobile") ?? universal;
      const smallMobile = byBreakpoint.get("small_mobile") ?? mobile ?? universal;

      const desktopImage = mediaAssetToImage(desktop);
      const tabletImage = mediaAssetToImage(tablet);
      const mobileImage = mediaAssetToImage(mobile);
      const smallImage = mediaAssetToImage(smallMobile);

      const primary = desktopImage ?? tabletImage ?? mobileImage ?? smallImage;
      if (!primary) continue;

      result[`${request.content_type}:${request.content_key}:${request.slot_key}`] = {
        desktop: desktopImage?.desktop ?? primary.desktop,
        tablet: tabletImage?.tablet ?? desktopImage?.tablet ?? primary.tablet,
        mobile: mobileImage?.mobile ?? tabletImage?.mobile ?? primary.mobile,
        small_mobile:
          smallImage?.small_mobile ??
          mobileImage?.small_mobile ??
          tabletImage?.small_mobile ??
          primary.small_mobile,
        alt: primary.alt,
        width: primary.width,
        height: primary.height,
        presentation_settings: primary.presentation_settings,
        presentation_settings_mobile: mobileImage?.presentation_settings ?? primary.presentation_settings,
        focal_x: primary.focal_x,
        focal_y: primary.focal_y,
        cutout: primary.cutout,
        cutout_presentation_settings: primary.cutout_presentation_settings,
        cutout_focal_x: primary.cutout_focal_x,
        cutout_focal_y: primary.cutout_focal_y,
      };
    }

    return result;
  } catch (error) {
    // Public pages must remain renderable while CMS assignments are empty or
    // the database is temporarily unavailable. Callers render placeholders.
    console.warn("[Supabase] getContentMedia() failed:", error);
    return {};
  }
}

export async function getHomeMedia(): Promise<Record<string, ResponsiveImage>> {
  const requests = HOME_MEDIA_SLOTS.map((slot) => ({
    content_type: "home",
    content_key: "home",
    slot_key: slot,
  }));
  return getContentMedia(requests);
}

export interface SiteBrandAssets {
  logo?: ResponsiveImage;
  logoLight?: ResponsiveImage;
  logoDark?: ResponsiveImage;
}

/**
 * Single source of truth for public website brand imagery.
 * Header and Footer consume the same resolved object so logo assignment is
 * controlled from one Supabase/data-layer namespace.
 */
export async function getSiteBrandAssets(): Promise<SiteBrandAssets> {
  const result = await getContentMedia(
    GLOBAL_MEDIA_SLOTS.map((slot) => ({
      content_type: "global",
      content_key: "site",
      slot_key: slot,
    })),
  );

  return {
    logo: result[contentMediaKey("global", "site", "logo")],
    logoLight: result[contentMediaKey("global", "site", "logo_light")],
    logoDark: result[contentMediaKey("global", "site", "logo_dark")],
  };
}

export async function getEntityMedia(
  contentType: "promo" | "news" | "global",
  contentKey: string,
  slotKey: string,
): Promise<ResponsiveImage | undefined> {
  const key = contentMediaKey(contentType, contentKey, slotKey);
  const result = await getContentMedia([
    { content_type: contentType, content_key: contentKey, slot_key: slotKey },
  ]);
  return result[key];
}

export function contentMediaKey(
  contentType: string,
  contentKey: string,
  slotKey: string,
) {
  return `${contentType}:${contentKey}:${slotKey}`;
}

export const GLOBAL_MEDIA_SLOTS = [
  "logo",
  "logo_light",
  "logo_dark",
] as const;

export const HOME_MEDIA_SLOTS = [
  "hero",
  "experience",
  "technology",
  "promo",
  "about",
  "final_cta",
  "dealer_location",
] as const;

export const MODEL_MEDIA_SLOTS = [
  "exterior",
  "exterior_mobile",
  "design_detail_main",
  "design_detail_wheel",
  "design_detail_rear",
  "profile",
  "interior",
  "interior_mobile",
  "cockpit_main",
  "cockpit_detail",
  "performance",
  "technology",
  "tech_intelligence",
  "technology_hero",
  "specifications_hero",
  "adas",
  "specs_visual",
  "final_cta",
  "tech_cta",
] as const;
