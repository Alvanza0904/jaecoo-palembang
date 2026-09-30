/**
 * Build a visual gallery for one model from existing CMS media only.
 * Never invents paths. Sections without real assets are omitted.
 */

import type { ModelData } from "@/lib/types/model";
import type { ResponsiveImage } from "@/lib/types/media";
import type {
  GalleryItem,
  GalleryLayout,
  GallerySection,
  GallerySectionId,
  ModelGalleryData,
} from "@/lib/types/gallery";
import type { SalesDelivery } from "@/lib/sales/deliveries";

function imageSrc(image?: ResponsiveImage): string | undefined {
  const src = image?.desktop ?? image?.tablet ?? image?.mobile ?? image?.small_mobile;
  if (!src) return undefined;
  // Only accept real remote CMS URLs — no local placeholders.
  if (!/^https:\/\//i.test(src)) return undefined;
  return src;
}

function hasRealImage(image?: ResponsiveImage): boolean {
  return !!imageSrc(image);
}

function layoutFor(index: number, total: number): GalleryLayout {
  if (total === 1) return "full";
  if (index === 0) return "full";
  const cycle: GalleryLayout[] = ["wide", "portrait", "square", "wide"];
  return cycle[(index - 1) % cycle.length];
}

const SLOT_META: Record<
  string,
  { section: GallerySectionId; title: string; sort: number }
> = {
  exterior: { section: "exterior", title: "Exterior", sort: 10 },
  exterior_mobile: { section: "exterior", title: "Exterior", sort: 11 },
  profile: { section: "exterior", title: "Side profile", sort: 20 },
  design_detail_main: { section: "detail", title: "Body detail", sort: 30 },
  design_detail_wheel: { section: "detail", title: "Wheel", sort: 31 },
  design_detail_rear: { section: "detail", title: "Rear detail", sort: 32 },
  performance: { section: "exterior", title: "Stance", sort: 25 },
  interior: { section: "interior", title: "Interior", sort: 40 },
  interior_mobile: { section: "interior", title: "Interior", sort: 41 },
  cockpit_main: { section: "interior", title: "Cockpit", sort: 50 },
  cockpit_detail: { section: "detail", title: "Cockpit detail", sort: 51 },
  cargo: { section: "interior", title: "Cargo", sort: 60 },
  technology: { section: "technology", title: "Technology", sort: 70 },
  tech_intelligence: { section: "technology", title: "Intelligence", sort: 71 },
  adas: { section: "technology", title: "ADAS", sort: 72 },
  technology_hero: { section: "technology", title: "Technology", sort: 73 },
  specs_visual: { section: "technology", title: "Spec visual", sort: 74 },
  final_cta: { section: "exterior", title: "Overview", sort: 15 },
};

const SECTION_ORDER: GallerySectionId[] = [
  "exterior",
  "interior",
  "detail",
  "technology",
  "colors",
  "delivery",
];

function sectionCopy(slug: string, section: GallerySectionId): { heading: string; body: string } {
  const isJ5 = slug.includes("j5");
  const isSivp = slug.includes("sivp");
  const isJ8 = slug.includes("j8");

  if (section === "exterior") {
    if (isJ5) {
      return {
        heading: "Exterior",
        body: "Dari setiap sudut, proporsi J5 terasa tegas dan bersih — dibuat untuk terlihat rapi di jalan sehari-hari.",
      };
    }
    if (isSivp) {
      return {
        heading: "Exterior",
        body: "Bodi J7 SIVP tetap familiar sebagai SUV hybrid, dengan karakter yang siap menonjolkan sisi teknologinya.",
      };
    }
    if (isJ8) {
      return {
        heading: "Exterior",
        body: "Skala J8 terasa lebih matang: grille yang kuat, velg 20 inci, dan garis bodi yang tegas dari depan sampai belakang.",
      };
    }
    return {
      heading: "Exterior",
      body: "Siluet SUV yang tegas, lampu signature, dan stance yang percaya diri — karakter J7 terbaca dari setiap sudut.",
    };
  }

  if (section === "interior") {
    if (isJ5) {
      return {
        heading: "Interior",
        body: "Layout kabin dibuat sederhana dan lega, dengan kontrol yang mudah dijangkau untuk pemakaian harian.",
      };
    }
    if (isJ8) {
      return {
        heading: "Interior",
        body: "Tiga baris, fokus pada ruang. Kabin J8 terasa seperti ruang sendiri untuk perjalanan yang lebih jauh.",
      };
    }
    if (isSivp) {
      return {
        heading: "Interior",
        body: "Kabin tetap nyaman sebagai hybrid harian, dengan kendali yang mendukung pengalaman valet pintar di luar mobil.",
      };
    }
    return {
      heading: "Interior",
      body: "Kokpit berorientasi pengemudi, layar yang jelas dibaca, dan kabin yang terasa tenang dipakai setiap hari.",
    };
  }

  if (section === "detail") {
    return {
      heading: "Detail",
      body: "Detail kecil pada lampu, velg, dan material membentuk karakter mobil secara keseluruhan.",
    };
  }

  if (section === "technology") {
    if (isSivp) {
      return {
        heading: "Technology",
        body: "Sensor, LiDAR, dan kamera 540° — paket persepsi yang membuat Super Intelligent Valet Parking terasa nyata.",
      };
    }
    if (isJ8) {
      return {
        heading: "Technology",
        body: "Super Hybrid, AWD ARDIS, dan bantuan pengemudi — teknologi yang terasa saat mobil dipakai, bukan sekadar label.",
      };
    }
    if (isJ5) {
      return {
        heading: "Technology",
        body: "Antarmuka digital, pengisian daya, dan bantuan pengemudi yang terasa membantu di perjalanan harian.",
      };
    }
    return {
      heading: "Technology",
      body: "Super Hybrid System, kamera surround, dan ADAS — teknologi yang bekerja di latar tanpa mengganggu fokus ke jalan.",
    };
  }

  if (section === "colors") {
    return {
      heading: "Colors",
      body: "Pilihan warna resmi untuk model ini. Geser atau ketuk untuk melihat lebih dekat.",
    };
  }

  return {
    heading: "JAECOO di Palembang",
    body: "Momen serah terima dan unit nyata di Palembang — ketika mobil sudah berada di tangan pemiliknya.",
  };
}

function heroCaption(slug: string, shortName: string): string {
  if (slug.includes("sivp")) {
    return `Lihat lebih dekat ${shortName} — dari bodi sampai sistem valet pintarnya.`;
  }
  if (slug.includes("j8")) {
    return `Lihat lebih dekat setiap detail flagship ${shortName}.`;
  }
  if (slug.includes("j5")) {
    return `Lihat lebih dekat setiap detail ${shortName}.`;
  }
  return `Lihat lebih dekat setiap detail ${shortName}.`;
}

function pushUnique(
  map: Map<string, GalleryItem>,
  item: GalleryItem,
) {
  const key = imageSrc(item.image);
  if (!key) return;
  // Deduplicate by image URL so the same asset is not shown twice.
  if (map.has(key)) return;
  map.set(key, item);
}

export function buildModelGallery(
  model: ModelData,
  deliveries: SalesDelivery[] = [],
): ModelGalleryData {
  const slots = model.image_slots ?? {};
  const bySection = new Map<GallerySectionId, Map<string, GalleryItem>>();

  const ensure = (id: GallerySectionId) => {
    if (!bySection.has(id)) bySection.set(id, new Map());
    return bySection.get(id)!;
  };

  for (const [slot, image] of Object.entries(slots)) {
    if (!hasRealImage(image)) continue;
    const meta = SLOT_META[slot];
    if (!meta) continue;
    const bag = ensure(meta.section);
    pushUnique(bag, {
      id: `${model.slug}-${slot}`,
      title: meta.title,
      image: image!,
      model_slug: model.slug,
      category: meta.section,
      published: true,
      sort_order: meta.sort,
    });
  }

  // Technology feature media (only when feature has a real image)
  for (const feature of model.technology?.features ?? []) {
    const image = feature.media?.image;
    if (!hasRealImage(image)) continue;
    const bag = ensure("technology");
    pushUnique(bag, {
      id: `${model.slug}-tech-${feature.id}`,
      title: feature.title,
      description: feature.tag,
      image: image!,
      model_slug: model.slug,
      category: "technology",
      published: true,
      sort_order: 80,
    });
  }

  // Colors — only those with real product images
  const colorBag = ensure("colors");
  let colorSort = 90;
  for (const color of model.colors ?? []) {
    if (!hasRealImage(color.image)) continue;
    pushUnique(colorBag, {
      id: `${model.slug}-color-${color.id}`,
      title: color.name,
      image: color.image,
      model_slug: model.slug,
      category: "colors",
      color_hex: color.hex,
      published: true,
      sort_order: colorSort++,
    });
  }

  // Delivery / customer moments matching this model name
  const deliveryBag = ensure("delivery");
  const nameHints = [model.name, model.short_name, model.name.replace(/^JAECOO\s+/i, "")];
  let dSort = 100;
  for (const d of deliveries) {
    if (!d.published || !hasRealImage(d.image)) continue;
    const hay = `${d.model} ${d.title} ${d.variant}`.toLowerCase();
    const match = nameHints.some((h) => h && hay.includes(h.toLowerCase().replace(/^jaecoo\s+/i, "")));
    // Also accept generic JAECOO deliveries without model tag when browsing any model
    // only if model field is empty — otherwise require match.
    if (!match && d.model.trim()) continue;
    if (!match && !d.model.trim()) continue;
    pushUnique(deliveryBag, {
      id: `delivery-${d.id}`,
      title: d.title || d.model,
      description: [d.location, d.caption].filter(Boolean).join(" · ") || undefined,
      image: d.image!,
      model_slug: model.slug,
      category: "delivery",
      published: true,
      sort_order: dSort++,
    });
  }

  const sections: GallerySection[] = [];
  for (const id of SECTION_ORDER) {
    const bag = bySection.get(id);
    if (!bag || bag.size === 0) continue;
    const items = Array.from(bag.values()).sort((a, b) => a.sort_order - b.sort_order);
    items.forEach((item, i) => {
      item.layout = layoutFor(i, items.length);
    });
    const copy = sectionCopy(model.slug, id);
    sections.push({
      id,
      heading: copy.heading,
      body: copy.body,
      items,
    });
  }

  const heroImage = model.hero_media?.image;
  const hero = hasRealImage(heroImage) ? heroImage : undefined;

  return {
    slug: model.slug,
    name: model.name,
    short_name: model.short_name,
    hero,
    hero_caption: heroCaption(model.slug, model.short_name),
    sections,
  };
}

/** Flat list of all gallery images for lightbox navigation. */
export function flattenGalleryItems(gallery: ModelGalleryData): GalleryItem[] {
  return gallery.sections.flatMap((s) => s.items);
}
