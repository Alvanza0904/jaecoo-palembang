/**
 * JAECOO Palembang — Model Data
 *
 * SINGLE SOURCE OF TRUTH for all model data.
 *
 * STEP 4A: Corrected slugs, taglines, prices, and descriptions.
 * Architecture designed for Supabase integration — interface stays
 * identical when switching from static data to DB queries.
 *
 * Slugs: jaecoo-j5-ev | jaecoo-j7-shs | jaecoo-j8-shs
 * J7 SIVP is a VARIANT of jaecoo-j7-shs — not a separate model/URL.
 */

import type { ModelData } from "@/lib/types/model";

// ─── Price constants — single source of truth ───────────────────────────────
// Calculator MUST import from here, never hardcode prices.

export const MODEL_PRICES = {
  "jaecoo-j5-ev": 354_900_000,
  "jaecoo-j7-shs": 534_900_000,
  "jaecoo-j8-shs": 865_000_000,
} as const;

// ─── Model Data ─────────────────────────────────────────────────────────────

export const MODELS: ModelData[] = [
  // ── J5 EV ────────────────────────────────────────────────────────────────
  {
    slug: "jaecoo-j5-ev",
    name: "JAECOO J5 EV",
    short_name: "J5 EV",
    tagline: "THIS IS THE REAL SUV.",
    description:
      "JAECOO J5 EV hadir sebagai SUV elektrik yang menggabungkan performa modern dengan desain premium — siap mengubah cara Anda berkendara di Palembang dan sekitarnya.",
    hero_media: {
      image: {
        desktop: undefined,
        tablet: undefined,
        mobile: undefined,
        cutout: undefined,
        alt: "JAECOO J5 EV — tampak depan tiga perempat",
      },
      art_direction: {
        desktop: { focal_x: 50, focal_y: 45, mode: "auto" },
        mobile: { focal_x: 60, focal_y: 50, mode: "auto" },
      },
    },
    default_variant: {
      id: "j5-ev-standard",
      name: "JAECOO J5 EV",
      price_status: "official",
      price_idr: MODEL_PRICES["jaecoo-j5-ev"],
      price_display: "Rp354.900.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j5-ev-standard",
        name: "JAECOO J5 EV",
        price_status: "official",
        price_idr: MODEL_PRICES["jaecoo-j5-ev"],
        price_display: "Rp354.900.000",
        price_region: "OTR Palembang",
      },
    ],
    colors: [
      {
        id: "j5-white",
        name: "Crystal White",
        hex: "#f0f0f0",
        image: {
          desktop: undefined,
          alt: "JAECOO J5 EV Crystal White",
        },
      },
      {
        id: "j5-black",
        name: "Midnight Black",
        hex: "#1a1a1a",
        image: {
          desktop: undefined,
          alt: "JAECOO J5 EV Midnight Black",
        },
      },
      {
        id: "j5-blue",
        name: "Ocean Blue",
        hex: "#1e3a5f",
        image: {
          desktop: undefined,
          alt: "JAECOO J5 EV Ocean Blue",
        },
      },
      {
        id: "j5-silver",
        name: "Stellar Silver",
        hex: "#c0c0c0",
        image: {
          desktop: undefined,
          alt: "JAECOO J5 EV Stellar Silver",
        },
      },
    ],
    technology: {
      headline: "Electric Intelligence. Uncompromised.",
      subheadline:
        "Teknologi EV terdepan yang dirancang untuk memberikan pengalaman berkendara lebih intuitif, lebih aman, dan lebih efisien di setiap perjalanan.",
      features: [
        {
          id: "j5-ev-range",
          title: "Jangkauan Lebih Jauh",
          description:
            "Baterai berkapasitas tinggi dirancang untuk perjalanan sehari-hari dengan efisiensi daya yang optimal — kota maupun luar kota.",
          tag: "Electric Range",
        },
        {
          id: "j5-ev-adas",
          title: "Keselamatan Aktif",
          description:
            "Sistem ADAS generasi terbaru memantau kondisi jalan secara real-time dengan sensor dan kamera 360° untuk ketenangan berkendara.",
          tag: "Safety",
        },
        {
          id: "j5-ev-connect",
          title: "Konektivitas Cerdas",
          description:
            "Layar sentuh besar dengan integrasi smartphone mulus — Apple CarPlay, Android Auto, dan OTA update langsung dari JAECOO.",
          tag: "Connectivity",
        },
        {
          id: "j5-ev-charge",
          title: "Pengisian Cepat",
          description:
            "Dukung fast charging DC untuk pengisian daya signifikan dalam waktu singkat — siap melanjutkan perjalanan lebih cepat.",
          tag: "Charging",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "Panjang", value: "4.330 mm" },
          { label: "Lebar", value: "1.830 mm" },
          { label: "Tinggi", value: "1.620 mm" },
          { label: "Wheelbase", value: "2.600 mm" },
          { label: "Ground Clearance", value: "175 mm" },
        ],
      },
      {
        label: "Performa",
        specs: [
          { label: "Tipe Motor", value: "Permanent Magnet Synchronous" },
          { label: "Transmisi", value: "Single-speed Reducer" },
          { label: "Penggerak", value: "FWD" },
          { label: "Kapasitas Baterai", value: "Hubungi dealer untuk detail" },
          { label: "Jangkauan NEDC", value: "Hubungi dealer untuk detail" },
        ],
      },
      {
        label: "Kenyamanan & Keselamatan",
        specs: [
          { label: "ADAS", value: "Ya — Level 2" },
          { label: "Airbag", value: "6 Airbag" },
          { label: "Layar Infotainment", value: "Touchscreen besar" },
          { label: "Apple CarPlay / Android Auto", value: "Ya (Wireless)" },
          { label: "Kamera Mundur", value: "Ya" },
        ],
      },
    ],
    meta_title: "JAECOO J5 EV — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "Dapatkan JAECOO J5 EV Rp354.900.000 OTR Palembang. SUV elektrik premium dengan teknologi ADAS dan fast charging. Hubungi Sales JAECOO Palembang untuk test drive.",
    published: true,
    updated_at: "2025-09-01T00:00:00Z",
  },

  // ── J7 SHS ───────────────────────────────────────────────────────────────
  {
    slug: "jaecoo-j7-shs",
    name: "JAECOO J7 SHS",
    short_name: "J7 SHS",
    tagline: "SUPER HYBRID, REDEFINED.",
    description:
      "JAECOO J7 SHS menggabungkan keiritan hybrid dengan performa SUV sejati dan kemampuan AWD — pilihan sempurna untuk jiwa petualang yang tidak mau kompromi antara efisiensi dan tenaga.",
    hero_media: {
      image: {
        desktop: undefined,
        tablet: undefined,
        mobile: undefined,
        cutout: undefined,
        alt: "JAECOO J7 SHS — tampak samping dinamis",
      },
      art_direction: {
        desktop: { focal_x: 50, focal_y: 45, mode: "auto" },
        mobile: { focal_x: 55, focal_y: 50, mode: "auto" },
      },
    },
    default_variant: {
      id: "j7-shs-standard",
      name: "JAECOO J7 SHS",
      price_status: "official",
      price_idr: MODEL_PRICES["jaecoo-j7-shs"],
      price_display: "Rp534.900.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j7-shs-standard",
        name: "JAECOO J7 SHS",
        price_status: "official",
        price_idr: MODEL_PRICES["jaecoo-j7-shs"],
        price_display: "Rp534.900.000",
        price_region: "OTR Palembang",
      },
      {
        // J7 SIVP adalah VARIAN — bukan model terpisah, bukan URL terpisah
        id: "j7-sivp",
        name: "JAECOO J7 SHS-P",
        label: "SIVP",
        price_status: "official",
        price_idr: MODEL_PRICES["jaecoo-j7-shs"],
        price_display: "Rp534.900.000",
        price_region: "OTR Palembang",
      },
    ],
    colors: [
      {
        id: "j7-white",
        name: "Pearl White",
        hex: "#f5f5f5",
        image: {
          desktop: undefined,
          alt: "JAECOO J7 SHS Pearl White",
        },
      },
      {
        id: "j7-silver",
        name: "Titanium Silver",
        hex: "#9ca3af",
        image: {
          desktop: undefined,
          alt: "JAECOO J7 SHS Titanium Silver",
        },
      },
      {
        id: "j7-black",
        name: "Cosmic Black",
        hex: "#1a1a1a",
        image: {
          desktop: undefined,
          alt: "JAECOO J7 SHS Cosmic Black",
        },
      },
      {
        id: "j7-green",
        name: "Forest Green",
        hex: "#2d4a3e",
        image: {
          desktop: undefined,
          alt: "JAECOO J7 SHS Forest Green",
        },
      },
    ],
    technology: {
      headline: "Super Hybrid System",
      subheadline:
        "Sistem hybrid generasi terbaru yang secara otomatis mengoptimalkan penggunaan daya — memberikan efisiensi terbaik dan tenaga yang selalu tersedia kapan pun dibutuhkan.",
      features: [
        {
          id: "j7-shs-powertrain",
          title: "Dual Power, Satu Tujuan",
          description:
            "Mesin bensin dan motor listrik bekerja secara harmonis melalui DHT transmission — performa responsif sekaligus konsumsi BBM yang efisien.",
          tag: "SHS Powertrain",
        },
        {
          id: "j7-shs-awd",
          title: "AWD Adaptif",
          description:
            "Sistem penggerak 4 roda adaptif memberikan distribusi torsi optimal di setiap kondisi — aspal basah, berbatu, atau medan off-road ringan.",
          tag: "AWD",
        },
        {
          id: "j7-shs-intelligent",
          title: "Kokpit Digital",
          description:
            "Panel instrumen digital luas dengan AI assistant, navigasi terintegrasi, dan antarmuka yang merespons setiap perintah dengan presisi tinggi.",
          tag: "Cockpit",
        },
        {
          id: "j7-shs-adas",
          title: "ADAS Generasi Terbaru",
          description:
            "Adaptive Cruise Control, Lane Keep Assist, Automatic Emergency Braking, dan Blind Spot Monitoring melindungi setiap momen berkendara.",
          tag: "Safety",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "Panjang", value: "4.544 mm" },
          { label: "Lebar", value: "1.895 mm" },
          { label: "Tinggi", value: "1.720 mm" },
          { label: "Wheelbase", value: "2.710 mm" },
          { label: "Ground Clearance", value: "200 mm" },
        ],
      },
      {
        label: "Powertrain",
        specs: [
          { label: "Sistem", value: "Super Hybrid System (SHS)" },
          { label: "Transmisi", value: "DHT (Dedicated Hybrid Transmission)" },
          { label: "Penggerak", value: "AWD" },
          { label: "Kapasitas Mesin", value: "Hubungi dealer untuk detail" },
          { label: "Kapasitas Tangki", value: "Hubungi dealer untuk detail" },
        ],
      },
      {
        label: "Kenyamanan & Keselamatan",
        specs: [
          { label: "ADAS", value: "Ya — Level 2+" },
          { label: "Airbag", value: "8 Airbag" },
          { label: "Layar Infotainment", value: "Dual touchscreen" },
          { label: "Apple CarPlay / Android Auto", value: "Ya (Wireless)" },
          { label: "Sunroof", value: "Panoramic Sunroof" },
          { label: "Kamera 360°", value: "Ya" },
        ],
      },
    ],
    meta_title: "JAECOO J7 SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J7 SHS Rp534.900.000 OTR Palembang. SUV Super Hybrid AWD dengan teknologi DHT terdepan. Tersedia varian SIVP. Test drive & konsultasi Sales JAECOO Palembang.",
    published: true,
    updated_at: "2025-09-01T00:00:00Z",
  },

  // ── J8 Ardis SHS ─────────────────────────────────────────────────────────
  {
    slug: "jaecoo-j8-shs",
    name: "JAECOO J8 Ardis SHS",
    short_name: "J8 Ardis",
    tagline: "POWER, REFINED.",
    description:
      "JAECOO J8 Ardis SHS mendefinisikan ulang standar SUV flagship — kemewahan tanpa kompromi, teknologi hybrid terdepan, dan performa AWD yang menghadirkan sensasi berkendara di level yang berbeda.",
    hero_media: {
      image: {
        desktop: undefined,
        tablet: undefined,
        mobile: undefined,
        cutout: undefined,
        alt: "JAECOO J8 Ardis SHS — tampak depan premium",
      },
      art_direction: {
        desktop: { focal_x: 50, focal_y: 40, mode: "auto" },
        mobile: { focal_x: 50, focal_y: 50, mode: "auto" },
      },
    },
    default_variant: {
      id: "j8-ardis-shs-standard",
      name: "JAECOO J8 Ardis SHS",
      price_status: "official",
      price_idr: MODEL_PRICES["jaecoo-j8-shs"],
      price_display: "Rp865.000.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j8-ardis-shs-standard",
        name: "JAECOO J8 Ardis SHS",
        price_status: "official",
        price_idr: MODEL_PRICES["jaecoo-j8-shs"],
        price_display: "Rp865.000.000",
        price_region: "OTR Palembang",
      },
    ],
    colors: [
      {
        id: "j8-obsidian",
        name: "Obsidian Black",
        hex: "#111111",
        image: {
          desktop: undefined,
          alt: "JAECOO J8 Ardis SHS Obsidian Black",
        },
      },
      {
        id: "j8-gold",
        name: "Champagne Gold",
        hex: "#c8a96e",
        image: {
          desktop: undefined,
          alt: "JAECOO J8 Ardis SHS Champagne Gold",
        },
      },
      {
        id: "j8-white",
        name: "Alpine White",
        hex: "#f8f8f6",
        image: {
          desktop: undefined,
          alt: "JAECOO J8 Ardis SHS Alpine White",
        },
      },
      {
        id: "j8-silver",
        name: "Platinum Silver",
        hex: "#d4d4d4",
        image: {
          desktop: undefined,
          alt: "JAECOO J8 Ardis SHS Platinum Silver",
        },
      },
    ],
    technology: {
      headline: "Power, Refined.",
      subheadline:
        "Setiap detail JAECOO J8 Ardis SHS dirancang untuk melampaui ekspektasi — dari suspensi adaptif cerdas hingga kabin yang menenangkan dengan material premium.",
      features: [
        {
          id: "j8-luxury-cabin",
          title: "Kabin Tanpa Kompromi",
          description:
            "Material premium pilihan, tata suara audiophile berkelas, pencahayaan ambien 64 warna, dan kursi berpendingin yang menciptakan suasana eksklusif di setiap perjalanan.",
          tag: "Interior",
        },
        {
          id: "j8-adaptive-suspension",
          title: "Suspensi Adaptif Cerdas",
          description:
            "Sistem suspensi air adaptive yang secara real-time membaca dan menyesuaikan kondisi jalan — kenyamanan luxury di jalan apapun.",
          tag: "Chassis",
        },
        {
          id: "j8-safety360",
          title: "Keamanan 360°",
          description:
            "Ekosistem sensor, radar, dan kamera menyeluruh dengan Night Vision — melindungi penumpang dari segala arah, siang maupun malam.",
          tag: "Safety",
        },
        {
          id: "j8-shs-flagship",
          title: "SHS Flagship",
          description:
            "Super Hybrid System generasi terbaru dengan output tenaga tertinggi di lini JAECOO — performa instan motor listrik berpadu torsi mesin bensin.",
          tag: "SHS Performance",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "Panjang", value: "4.820 mm" },
          { label: "Lebar", value: "1.960 mm" },
          { label: "Tinggi", value: "1.755 mm" },
          { label: "Wheelbase", value: "2.800 mm" },
          { label: "Ground Clearance", value: "210 mm (adjustable)" },
        ],
      },
      {
        label: "Powertrain",
        specs: [
          { label: "Sistem", value: "Super Hybrid System (SHS) Flagship" },
          { label: "Transmisi", value: "DHT (Dedicated Hybrid Transmission)" },
          { label: "Penggerak", value: "AWD" },
          { label: "Kapasitas Mesin", value: "Hubungi dealer untuk detail" },
          { label: "Kapasitas Tangki", value: "Hubungi dealer untuk detail" },
        ],
      },
      {
        label: "Kenyamanan & Keselamatan",
        specs: [
          { label: "ADAS", value: "Ya — Level 2+ (dengan Night Vision)" },
          { label: "Airbag", value: "10 Airbag" },
          { label: "Layar Infotainment", value: "Triple display flagship" },
          { label: "Apple CarPlay / Android Auto", value: "Ya (Wireless)" },
          { label: "Panoramic Sunroof", value: "Ya (Electrochromic)" },
          { label: "Kamera 360°", value: "Ya (HD dengan Night Vision)" },
          { label: "Suspensi", value: "Adaptive Air Suspension" },
          { label: "Kursi Pengemudi", value: "10-way electric + massage + ventilated" },
        ],
      },
    ],
    meta_title: "JAECOO J8 Ardis SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J8 Ardis SHS Rp865.000.000 OTR Palembang. SUV flagship hybrid AWD dengan adaptive air suspension dan kabin premium. Jadwalkan test drive eksklusif bersama Sales JAECOO Palembang.",
    published: true,
    updated_at: "2025-09-01T00:00:00Z",
  },
];

// ─── Query helpers — same interface for both static and Supabase ─────────────

/** Get all published models */
export function getModels(): ModelData[] {
  return MODELS.filter((m) => m.published);
}

/** Get a single model by slug */
export function getModelBySlug(slug: string): ModelData | undefined {
  return MODELS.find((m) => m.slug === slug && m.published);
}

/** Get all model slugs (for generateStaticParams) */
export function getModelSlugs(): string[] {
  return MODELS.filter((m) => m.published).map((m) => m.slug);
}

/**
 * Get price for a model slug — use this in calculator to avoid hardcoding.
 * Returns the default variant price_idr.
 */
export function getModelPrice(slug: string): number | null {
  const model = getModelBySlug(slug);
  return model?.default_variant.price_idr ?? null;
}
