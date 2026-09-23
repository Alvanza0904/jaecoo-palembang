import { createSupabaseServerClient } from "./server";
import type {
  ModelData,
  ModelVariant,
  ModelColor,
  ModelSpecCategory,
  ModelTechnologySection,
  ModelPageCopy,
  ModelSectionCopy,
  ModelHighlight,
  PriceStatus,
} from "@/lib/types/model";
import type { PresentationSettings } from "@/lib/types/presentation";
import type { ResponsiveImage } from "@/lib/types/media";
import {
  contentMediaKey,
  getContentMedia,
  MODEL_MEDIA_SLOTS,
  mediaAssetToImage,
} from "./media";
import {
  getModels as getStaticModels,
  getModelBySlug as getStaticModelBySlug,
  getModelSlugs as getStaticModelSlugs,
} from "@/lib/data/models";

interface SupabaseModel {
  id: string;
  slug: string;
  name: string;
  short_name: string;
  tagline: string;
  description: string;
  published: boolean;
  sort_order: number;
  updated_at: string;
  model_variants: SupabaseVariant[];
  model_colors: SupabaseColor[];
  model_specifications: SupabaseSpec[];
  model_content: SupabaseContent[];
}

interface SupabaseVariant {
  id: string;
  variant_key: string;
  name: string;
  label: string | null;
  price_status: string;
  price_idr: number | null;
  price_display: string | null;
  price_display_override: string | null;
  price_region: string;
  is_default: boolean;
}

interface SupabaseColor {
  id: string;
  color_key: string;
  name: string;
  hex: string;
  image_path: string | null;
  media_asset_id: string | null;
  sort_order: number;
}

interface SupabaseSpec {
  id: string;
  category: string;
  spec_label: string;
  spec_value: string;
  sort_order: number;
}

interface SupabaseContent {
  section: string;
  content: Record<string, unknown>;
}

interface SupabaseMediaRow {
  id: string;
  public_url: string | null;
  variants: Record<string, string> | null;
  width: number | null;
  height: number | null;
  filename: string | null;
  alt_text?: string | null;
  presentation_settings: unknown;
  cutout_url: string | null;
  focal_x: number | null;
  focal_y: number | null;
}

function mediaRowToImage(asset: SupabaseMediaRow | undefined, fallbackAlt: string): ResponsiveImage | undefined {
  if (!asset) return undefined;
  return mediaAssetToImage(
    {
      id: asset.id,
      public_url: asset.public_url,
      variants: asset.variants,
      filename: asset.filename,
      width: asset.width,
      height: asset.height,
      alt_text: asset.alt_text ?? null,
      focal_x: asset.focal_x,
      focal_y: asset.focal_y,
      cutout_url: asset.cutout_url,
      // PENTING: teruskan presentation_settings agar Visual Editor settings
      // (position, scale, desktop/mobile) diterapkan di browser.
      presentation_settings: asset.presentation_settings as import("@/lib/types/presentation").PresentationSettings | undefined,
    },
    fallbackAlt,
  );
}

async function getMediaAssets(ids: string[]): Promise<Map<string, SupabaseMediaRow>> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (!uniqueIds.length) return new Map();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("media_assets")
    .select(
      "id, public_url, variants, width, height, filename, alt_text, presentation_settings, cutout_url, focal_x, focal_y",
    )
    .in("id", uniqueIds);

  if (error) throw error;

  return new Map(
    ((data ?? []) as SupabaseMediaRow[]).map((asset) => [asset.id, asset]),
  );
}

function remoteImageUrl(value: unknown): string | undefined {
  return typeof value === "string" && /^https:\/\//i.test(value) ? value : undefined;
}

function readMediaId(content: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = content?.[key];
  return typeof value === "string" && value ? value : undefined;
}

/** Legacy seed copy that contradicts the reference site. Newer admin copy is kept. */
const LEGACY_DESCRIPTIONS = new Set([
  "JAECOO J5 EV hadir sebagai SUV elektrik yang menggabungkan performa modern dengan desain premium — siap mengubah cara Anda berkendara di Palembang dan sekitarnya.",
  "JAECOO J7 SHS menggabungkan keiritan hybrid dengan performa SUV sejati dan kemampuan AWD — pilihan sempurna untuk jiwa petualang yang tidak mau kompromi.",
  "JAECOO J7 SHS menggabungkan keiritan hybrid dengan performa SUV sejati dan kemampuan AWD — pilihan sempurna untuk jiwa petualang yang tidak mau kompromi antara efisiensi dan tenaga.",
]);

function asSectionCopy(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const copy: ModelSectionCopy = {};
  for (const key of ["label", "heading", "body", "stat", "unit", "primary_label", "secondary_label"] as const) {
    if (typeof row[key] === "string") copy[key] = row[key];
  }
  return Object.keys(copy).length ? copy : undefined;
}

function asHighlights(value: unknown): ModelHighlight[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const rows: ModelHighlight[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.value !== "string" || typeof row.label !== "string") continue;
    rows.push({
      value: row.value,
      label: row.label,
      unit: typeof row.unit === "string" ? row.unit : undefined,
    });
  }
  return rows.length ? rows : undefined;
}

function mergePageCopy(
  fallback: ModelPageCopy | undefined,
  raw: Record<string, unknown> | undefined,
): ModelPageCopy | undefined {
  if (!raw) return fallback;
  const keys = [
    "exterior",
    "design",
    "profile",
    "interior",
    "cockpit",
    "performance",
    "adas",
    "hero_cta",
    "technology_hero",
    "specifications_hero",
    "cta",
    "tech_intelligence",
    "tech_close",
    "specs_cta",
  ] as const;
  const merged: ModelPageCopy = { ...(fallback ?? {}) };
  for (const key of keys) {
    const next = asSectionCopy(raw[key]);
    if (next) merged[key] = { ...(fallback?.[key] ?? {}), ...next };
  }
  const stats = asHighlights(raw.tech_stats);
  if (stats) merged.tech_stats = stats;
  return merged;
}

function mapTechnologyMedia(
  technology: ModelTechnologySection,
  assets: Map<string, SupabaseMediaRow>,
): ModelTechnologySection {
  return {
    ...technology,
    features: (technology.features ?? []).map((feature) => {
      const rawMedia = feature.media;
      const assetId = rawMedia?.media_asset_id;
      const asset = assetId ? assets.get(assetId) : undefined;
      const image = mediaRowToImage(asset, feature.title);
      if (!assetId) {
        // Prevent legacy/local content paths from becoming the public source.
        if (rawMedia?.image?.desktop?.startsWith("/images/")) {
          return { ...feature, media: undefined };
        }
        return feature;
      }
      return {
        ...feature,
        media: image
          ? { ...rawMedia, image, media_asset_id: assetId }
          : { ...rawMedia, image: { alt: feature.title }, media_asset_id: assetId },
      };
    }),
  };
}

function mapModel(
  row: SupabaseModel,
  staticFallback?: ModelData,
  mediaAssets: Map<string, SupabaseMediaRow> = new Map(),
): ModelData {
  const variantRows = (row.model_variants ?? []).filter(
    (variant) => !(row.slug === "jaecoo-j7-shs" && variant.variant_key === "j7-sivp"),
  );

  const variants: ModelVariant[] = variantRows.map((v) => ({
    id: v.variant_key,
    name: v.name,
    label: v.label ?? undefined,
    price_status: (v.price_status ?? "official") as PriceStatus,
    price_idr: v.price_idr ?? null,
    price_display: v.price_display ?? null,
    price_display_override: v.price_display_override ?? null,
    price_region: v.price_region,
  }));

  const defaultVariant =
    variantRows.find((v) => v.is_default) ??
    variantRows[0];

  const colors: ModelColor[] = (row.model_colors ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((c) => {
      const asset = c.media_asset_id ? mediaAssets.get(c.media_asset_id) : undefined;
      const image = mediaRowToImage(asset, `${row.name} — ${c.name}`);
      const legacyRemoteImage =
        !image && /^https:\/\//i.test(c.image_path ?? "")
          ? { desktop: c.image_path!, tablet: c.image_path!, mobile: c.image_path!, alt: `${row.name} — ${c.name}` }
          : undefined;

      return {
        id: c.color_key,
        name: c.name,
        hex: c.hex,
        image: image ?? legacyRemoteImage ?? { alt: `${row.name} — ${c.name}` },
      };
    });

  const specMap = new Map<string, Array<{ label: string; value: string }>>();
  for (const spec of (row.model_specifications ?? []).sort(
    (a, b) => a.sort_order - b.sort_order,
  )) {
    if (!specMap.has(spec.category)) specMap.set(spec.category, []);
    specMap.get(spec.category)!.push({
      label: spec.spec_label,
      value: spec.spec_value,
    });
  }

  const specifications: ModelSpecCategory[] = Array.from(specMap.entries()).map(
    ([label, specs]) => ({ label, specs }),
  );

  const techContent = (row.model_content ?? []).find(
    (c) => c.section === "technology",
  );
  const technologyRaw =
    (techContent?.content as unknown as ModelTechnologySection) ?? {
      headline: "",
      features: [],
    };
  const staticTechnology = staticFallback?.technology;
  const dbFeatures = technologyRaw.features ?? [];
  const technologyBase: ModelTechnologySection = {
    headline: technologyRaw.headline || staticTechnology?.headline || "",
    subheadline: technologyRaw.subheadline || staticTechnology?.subheadline,
    features: dbFeatures.length > 0 ? dbFeatures : staticTechnology?.features ?? [],
  };
  const technology = mapTechnologyMedia(technologyBase, mediaAssets);

  const heroContent = (row.model_content ?? []).find((c) => c.section === "hero");
  const heroRaw = heroContent?.content as Record<string, unknown> | undefined;
  const storedImage =
    (heroRaw?.image as Record<string, unknown> | undefined) ?? {};

  const heroMediaId = readMediaId(heroRaw, "media_asset_id");
  const cutoutMediaId = readMediaId(heroRaw, "cutout_media_id");
  const heroMedia = heroMediaId ? mediaAssets.get(heroMediaId) : undefined;
  const cutoutMedia = cutoutMediaId ? mediaAssets.get(cutoutMediaId) : undefined;

  const heroImage = heroMedia
    ? {
        desktop:
          heroMedia.variants?.["1920"] ??
          heroMedia.variants?.["1440"] ??
          heroMedia.public_url ??
          undefined,
        tablet:
          heroMedia.variants?.["1024"] ??
          heroMedia.variants?.["768"] ??
          heroMedia.public_url ??
          undefined,
        mobile:
          heroMedia.variants?.["768"] ??
          heroMedia.variants?.["480"] ??
          heroMedia.public_url ??
          undefined,
        small_mobile:
          heroMedia.variants?.["480"] ?? heroMedia.public_url ?? undefined,
        alt:
          (storedImage.alt as string | undefined) ??
          heroMedia.alt_text ??
          heroMedia.filename ??
          row.name,
        width: heroMedia.width ?? undefined,
        height: heroMedia.height ?? undefined,
      }
    : {
        desktop: remoteImageUrl(storedImage.desktop),
        tablet: remoteImageUrl(storedImage.tablet),
        mobile: remoteImageUrl(storedImage.mobile),
        small_mobile: remoteImageUrl(storedImage.small_mobile),
        alt: (storedImage.alt as string | undefined) ?? row.name,
        width: storedImage.width as number | undefined,
        height: storedImage.height as number | undefined,
      };

  const hero_media: ModelData["hero_media"] = {
    image: {
      ...heroImage,
      cutout:
        cutoutMedia?.cutout_url ??
        heroMedia?.cutout_url ??
        (heroRaw?.cutout_url as string | undefined) ??
        remoteImageUrl(storedImage.cutout) ??
        undefined,
    },
    media_asset_id: heroMediaId,
    cutout_media_id: cutoutMediaId,
    presentation_settings:
      heroMedia?.presentation_settings as PresentationSettings | undefined,
    cutout_presentation_settings:
      cutoutMedia?.presentation_settings as PresentationSettings | undefined,
    focal_x: typeof heroMedia?.focal_x === "number" ? heroMedia.focal_x : undefined,
    focal_y: typeof heroMedia?.focal_y === "number" ? heroMedia.focal_y : undefined,
    cutout_focal_x:
      typeof cutoutMedia?.focal_x === "number" ? cutoutMedia.focal_x : undefined,
    cutout_focal_y:
      typeof cutoutMedia?.focal_y === "number" ? cutoutMedia.focal_y : undefined,
    art_direction:
      (heroRaw?.art_direction as ModelData["hero_media"]["art_direction"]) ??
      undefined,
  };

  const image_slots: Record<string, ResponsiveImage> = {};
  for (const slot of MODEL_MEDIA_SLOTS) {
    const assetId = readMediaId(heroRaw, `media_${slot}_asset_id`);
    if (assetId) {
      const image = mediaRowToImage(mediaAssets.get(assetId), `${row.name} — ${slot}`);
      if (image) image_slots[slot] = image;
    }
  }

  let colorsOut = colors;
  const colorsHaveMedia = colors.some((color) => !!color.image?.desktop || !!color.image?.mobile);
  if (
    staticFallback &&
    (row.slug === "jaecoo-j7-shs" || row.slug === "jaecoo-j8-shs") &&
    !colorsHaveMedia
  ) {
    // Unillustrated seed palettes disagreed with the reference site.
    // Once a color image is assigned in Admin, the database palette is kept.
    colorsOut = staticFallback.colors;
  }

  const pageContent = (row.model_content ?? []).find((c) => c.section === "page");
  const pageRaw = pageContent?.content as Record<string, unknown> | undefined;
  const description =
    row.description && LEGACY_DESCRIPTIONS.has(row.description.trim()) && staticFallback?.description
      ? staticFallback.description
      : row.description;

  // Section images are assigned through content_media, not hardcoded in JSX.
  // This property is hydrated by getModelBySlug/getModels below.
  return {
    slug: row.slug as ModelData["slug"],
    sort_order: row.sort_order,
    name: row.name,
    short_name: row.short_name?.trim() || staticFallback?.short_name || row.name,
    tagline: row.tagline?.trim() || staticFallback?.tagline || row.name,
    description,
    hero_media,
    image_slots,
    highlights: asHighlights(pageRaw?.highlights) ?? staticFallback?.highlights,
    page_copy: mergePageCopy(staticFallback?.page_copy, pageRaw),
    default_variant: defaultVariant
      ? {
          id: defaultVariant.variant_key,
          name: defaultVariant.name,
          label: defaultVariant.label ?? undefined,
          price_status: (defaultVariant.price_status ?? "official") as PriceStatus,
          price_idr: defaultVariant.price_idr ?? null,
          price_display: defaultVariant.price_display ?? null,
          price_display_override: defaultVariant.price_display_override ?? null,
          price_region: defaultVariant.price_region,
        }
      : staticFallback!.default_variant,
    variants: variants.length > 0 ? variants : staticFallback?.variants ?? [],
    colors: colorsOut.length > 0 ? colorsOut : staticFallback?.colors ?? [],
    technology,
    specifications:
      specifications.length > 0
        ? specifications
        : staticFallback?.specifications ?? [],
    published: row.published,
    updated_at: row.updated_at,
    meta_title:
      (typeof pageRaw?.meta_title === "string" && pageRaw.meta_title.trim()) ||
      staticFallback?.meta_title,
    meta_description:
      (typeof pageRaw?.meta_description === "string" && pageRaw.meta_description.trim()) ||
      staticFallback?.meta_description,
  };
}

const MODEL_SELECT = `
  *,
  model_variants(*),
  model_colors(*),
  model_specifications(*),
  model_content(section, content)
`;

async function hydrateModelImages(
  model: ModelData,
  slug: string,
): Promise<ModelData> {
  const requests = MODEL_MEDIA_SLOTS.map((slot) => ({
    content_type: "model",
    content_key: slug,
    slot_key: slot,
  }));

  const resolved = await getContentMedia(requests);
  const image_slots = { ...(model.image_slots ?? {}) };

  for (const slot of MODEL_MEDIA_SLOTS) {
    const image = resolved[contentMediaKey("model", slug, slot)];
    if (image) image_slots[slot] = image;
  }

  return { ...model, image_slots };
}

async function buildModelsFromRows(rows: SupabaseModel[]): Promise<ModelData[]> {
  const staticModels = getStaticModels();

  // Hero + color assets are already relationally attached to the model rows.
  const ids = rows.flatMap((row) => {
    const hero = (row.model_content ?? []).find((c) => c.section === "hero");
    const raw = hero?.content as Record<string, unknown> | undefined;
    const heroId = readMediaId(raw, "media_asset_id");
    const cutoutId = readMediaId(raw, "cutout_media_id");
    const colorIds = (row.model_colors ?? [])
      .map((color) => color.media_asset_id)
      .filter((id): id is string => !!id);
    const technology = (row.model_content ?? []).find((c) => c.section === "technology")?.content as ModelTechnologySection | undefined;
    const technologyIds = (technology?.features ?? [])
      .map((feature) => {
        return feature.media?.media_asset_id;
      })
      .filter((id): id is string => !!id);
    return [heroId, cutoutId, ...colorIds, ...technologyIds];
  });

  const assets = await getMediaAssets(ids.filter((id): id is string => !!id));

  const mapped = rows.map((row) => {
    const fallback = staticModels.find((m) => m.slug === row.slug);
    return mapModel(row, fallback, assets);
  });

  const hydrated = await Promise.all(
    mapped.map((model) => hydrateModelImages(model, model.slug)),
  );

  const merged = applySharedJ7Specifications([...hydrated, ...missingStaticModels(hydrated)]);
  const lineup = ["jaecoo-j5-ev", "jaecoo-j7-shs", "jaecoo-j7-sivp", "jaecoo-j8-shs"];
  return merged.sort((a, b) => {
    const left = lineup.indexOf(a.slug);
    const right = lineup.indexOf(b.slug);
    const leftRank = left === -1 ? 100 + (a.sort_order ?? 0) : left;
    const rightRank = right === -1 ? 100 + (b.sort_order ?? 0) : right;
    return leftRank - rightRank;
  });
}

function missingStaticModels(present: ModelData[]): ModelData[] {
  const slugs = new Set(present.map((model) => model.slug));
  return getStaticModels().filter((model) => !slugs.has(model.slug));
}

function applySharedJ7Specifications(models: ModelData[]): ModelData[] {
  const shs = models.find((model) => model.slug === "jaecoo-j7-shs");
  if (!shs?.specifications?.length) return models;
  return models.map((model) =>
    model.slug === "jaecoo-j7-sivp"
      ? { ...model, specifications: shs.specifications }
      : model,
  );
}

export async function getModels(): Promise<ModelData[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("models")
      .select(MODEL_SELECT)
      .eq("published", true)
      .order("sort_order");

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No models returned");

    return buildModelsFromRows(data as SupabaseModel[]);
  } catch (err) {
    console.warn("[Supabase] getModels() failed — using image-safe static fallback:", err);
    return getStaticModels();
  }
}

export async function getModelBySlug(
  slug: string,
): Promise<ModelData | undefined> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("models")
      .select(MODEL_SELECT)
      .eq("slug", slug)
      .eq("published", true)
      .single();

    if (error) throw error;
    if (!data) return undefined;

    const row = data as SupabaseModel;
    const staticFallback = getStaticModelBySlug(slug);

    const heroContent = (row.model_content ?? []).find(
      (c) => c.section === "hero",
    );
    const heroRaw = heroContent?.content as Record<string, unknown> | undefined;
    const heroId = readMediaId(heroRaw, "media_asset_id");
    const cutoutId = readMediaId(heroRaw, "cutout_media_id");
    const colorIds = (row.model_colors ?? [])
      .map((color) => color.media_asset_id)
      .filter((id): id is string => !!id);
    const technology = (row.model_content ?? []).find((c) => c.section === "technology")?.content as ModelTechnologySection | undefined;
    const technologyIds = (technology?.features ?? [])
      .map((feature) => {
        return feature.media?.media_asset_id;
      })
      .filter((id): id is string => !!id);

    const assets = await getMediaAssets([heroId, cutoutId, ...colorIds, ...technologyIds].filter((id): id is string => !!id));
    const model = await hydrateModelImages(mapModel(row, staticFallback, assets), slug);

    if (slug === "jaecoo-j7-sivp") {
      const shs = await getModelBySlug("jaecoo-j7-shs");
      if (shs?.specifications?.length) {
        return { ...model, specifications: shs.specifications };
      }
    }

    return model;
  } catch (err) {
    console.warn(`[Supabase] getModelBySlug(${slug}) failed — using image-safe static fallback:`, err);
    return getStaticModelBySlug(slug);
  }
}

export async function getModelSlugs(): Promise<string[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("models")
      .select("slug")
      .eq("published", true)
      .order("sort_order");

    if (error) throw error;
    if (!data || data.length === 0) throw new Error("No slugs returned");

    const fromDb = data.map((m: { slug: string }) => m.slug);
    const extras = getStaticModelSlugs().filter((slug) => !fromDb.includes(slug));
    return [...fromDb, ...extras];
  } catch (err) {
    console.warn("[Supabase] getModelSlugs() failed — using static fallback:", err);
    return getStaticModelSlugs();
  }
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("models").select("slug").limit(1);
    if (error) throw error;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
