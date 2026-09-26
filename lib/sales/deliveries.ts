import type { ResponsiveImage } from "@/lib/types/media";

export interface SalesDeliveryInput {
  id: string;
  media_asset_id: string;
  title: string;
  model: string;
  variant: string;
  caption: string;
  location: string;
  alt: string;
  sort: number;
  published: boolean;
}

export interface SalesDelivery extends SalesDeliveryInput {
  image?: ResponsiveImage;
}

const PREFIX = "delivery:";

export function encodeDeliverySlot(input: SalesDeliveryInput) {
  const payload = Buffer.from(JSON.stringify({
    title: input.title,
    model: input.model,
    variant: input.variant,
    caption: input.caption,
    location: input.location,
    alt: input.alt,
    sort: input.sort,
    published: input.published,
  }), "utf8").toString("base64url");
  return `${PREFIX}${input.id}:${payload}`;
}

export function decodeDeliverySlot(slotKey: string): Omit<SalesDeliveryInput, "media_asset_id"> | null {
  const match = /^delivery:([0-9a-f-]{36}):(.+)$/i.exec(slotKey);
  if (!match) return null;
  try {
    const raw = JSON.parse(Buffer.from(match[2], "base64url").toString("utf8")) as Partial<SalesDeliveryInput>;
    return {
      id: match[1],
      title: String(raw.title ?? ""),
      model: String(raw.model ?? ""),
      variant: String(raw.variant ?? ""),
      caption: String(raw.caption ?? ""),
      location: String(raw.location ?? ""),
      alt: String(raw.alt ?? ""),
      sort: Number(raw.sort ?? 0) || 0,
      published: raw.published !== false,
    };
  } catch {
    return null;
  }
}

export function deliveryAlt(item: Pick<SalesDeliveryInput, "alt" | "title" | "model" | "location">) {
  const custom = item.alt.trim();
  if (custom) return custom;
  const parts = [item.title.trim(), item.model.trim(), item.location.trim() ? `di ${item.location.trim()}` : ""].filter(Boolean);
  if (parts.length === 0) return "Serah terima JAECOO";
  return parts.join(" ").replace(/\s+/g, " ");
}

export const DELIVERY_MODELS = [
  "JAECOO J5 EV",
  "JAECOO J7 SHS",
  "JAECOO J7 SIVP",
  "JAECOO J8 ARDIS",
  "JAECOO J8 SHS-P ARDIS",
] as const;
