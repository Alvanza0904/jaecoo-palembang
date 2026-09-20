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
      headline: "Kecerdasan Listrik. Tanpa Kompromi.",
      subheadline:
        "Teknologi kendaraan listrik yang dirancang untuk menghadirkan respons cepat, efisiensi tinggi, dan pengalaman berkendara yang intuitif di setiap perjalanan.",
      features: [
        {
          id: "j5-ev-range",
          title: "Jangkauan Lebih Jauh",
          description:
            "Baterai 60,9 kWh berteknologi LFP menghadirkan jarak tempuh hingga 461 km berdasarkan siklus NEDC, memberi keleluasaan untuk perjalanan harian maupun luar kota.",
          tag: "Jarak Tempuh Listrik",
        },
        {
          id: "j5-ev-adas",
          title: "Keselamatan Aktif",
          description:
            "17 fitur ADAS membantu memantau potensi risiko dan mendukung pengemudi dalam berbagai situasi berkendara. Kamera 540° HD membantu memberikan pandangan lebih menyeluruh saat bermanuver.",
          tag: "Keselamatan",
        },
        {
          id: "j5-ev-connect",
          title: "Konektivitas Cerdas",
          description:
            "Layar dan konektivitas dirancang untuk membuat informasi, hiburan, dan fungsi kendaraan terasa lebih mudah dijangkau selama perjalanan.",
          tag: "Connectivity",
        },
        {
          id: "j5-ev-charge",
          title: "Pengisian Cepat",
          description:
            "Pengisian cepat DC hingga 130 kW memungkinkan pengisian 30–80% sekitar 28 menit berdasarkan data yang tersedia.",
          tag: "Pengisian Daya",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "Panjang", value: "4.380 mm" },
          { label: "Lebar", value: "1.860 mm" },
          { label: "Tinggi", value: "1.650 mm" },
          { label: "Wheelbase", value: "2.620 mm" },
          { label: "Ground Clearance", value: "200 mm" },
        ],
      },
      {
        label: "Performa",
        specs: [
          { label: "Tipe Motor", value: "Motor listrik 155 kW / 210 PS" },
          { label: "Transmisi", value: "Single-speed reducer" },
          { label: "Penggerak", value: "FWD" },
          { label: "Torsi maksimum", value: "288 Nm" },
          { label: "Kapasitas Baterai", value: "60,9 kWh · CATL · LFP" },
          { label: "Jangkauan NEDC", value: "461 km" },
          { label: "0–100 km/jam", value: "7,3 detik" },
          { label: "Pengisian DC", value: "130 kW · sekitar 28 menit" },
        ],
      },
      {
        label: "Kenyamanan & Keselamatan",
        specs: [
          { label: "ADAS", value: "17 fitur" },
          { label: "Airbag", value: "6 Airbag" },
          { label: "Layar Infotainment", value: "13,2 inci Full HD" },
          { label: "Pengisian AC", value: "7.700 W" },
          { label: "Kamera", value: "540° HD" },
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
    tagline: "SUPER HYBRID, DIDEFINISIKAN ULANG.",
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
      headline: "Sistem Super Hybrid",
      subheadline:
        "Sistem Super Hybrid memadukan mesin 1.5 TGDI dengan motor listrik melalui transmisi DHT untuk menghadirkan respons yang halus, efisiensi tinggi, dan fleksibilitas berkendara.",
      features: [
        {
          id: "j7-shs-powertrain",
          title: "Dua Sumber Tenaga, Satu Karakter",
          description:
            "Mesin 1.5 TGDI dan motor listrik bekerja melalui DHT untuk menghadirkan perpaduan tenaga yang responsif dan efisiensi yang terjaga.",
          tag: "SHS Powertrain",
        },
        {
          id: "j7-shs-awd",
          title: "Mode Berkendara Fleksibel",
          description:
            "Tiga mode berkendara ECO, STANDARD, dan SPORT memungkinkan karakter respons kendaraan disesuaikan dengan kebutuhan perjalanan.",
          tag: "AWD",
        },
        {
          id: "j7-shs-intelligent",
          title: "Kokpit Modern",
          description:
            "Kokpit modern menghadirkan informasi kendaraan, hiburan, dan fungsi penting dalam antarmuka yang mudah dijangkau pengemudi.",
          tag: "Kokpit",
        },
        {
          id: "j7-shs-adas",
          title: "19 Fitur Bantuan Pengemudi",
          description:
            "19 fitur ADAS membantu meningkatkan kewaspadaan pengemudi melalui bantuan seperti Adaptive Cruise Control, AEB, Lane Keeping, Blind Spot Detection, dan pemantauan pengemudi.",
          tag: "Keselamatan",
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
          { label: "Tenaga Mesin", value: "140 hp" },
          { label: "Tenaga Listrik", value: "201 hp" },
          { label: "Jarak Kombinasi", value: "hingga 1.300 km" },
          { label: "Transmisi", value: "3DHT" },
          { label: "Penggerak", value: "Super Hybrid" },
          { label: "Kapasitas Baterai", value: "18,3 kWh" },
          { label: "Jarak Tempuh Listrik", value: "100+ km" },
          { label: "0–100 km/jam", value: "7,3 detik" },
        ],
      },
      {
        label: "Kenyamanan & Keselamatan",
        specs: [
          { label: "ADAS", value: "19 fitur" },
          { label: "Airbag", value: "8 Airbag" },
          { label: "Kamera Surround", value: "540° HD" },
          { label: "Pengisian AC", value: "7.700 W" },
          { label: "Mode Berkendara", value: "ECO · STANDARD · SPORT" },
        ],
      },
    ],
    meta_title: "JAECOO J7 SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J7 SHS Rp534.900.000 OTR Palembang. SUV Super Hybrid dengan teknologi DHT dan efisiensi listrik terdepan. Tersedia varian SIVP. Test drive & konsultasi Sales JAECOO Palembang.",
    published: true,
    updated_at: "2025-09-01T00:00:00Z",
  },

  // ── J8 Ardis SHS ─────────────────────────────────────────────────────────
  {
    slug: "jaecoo-j8-shs",
    name: "JAECOO J8 Ardis SHS",
    short_name: "J8 Ardis",
    tagline: "KEKUATAN YANG DISEMPURNAKAN.",
    description:
      "JAECOO J8 Ardis SHS mendefinisikan ulang standar SUV unggulan — kemewahan tanpa kompromi, teknologi hybrid terdepan, dan performa AWD yang menghadirkan sensasi berkendara di level yang berbeda.",
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
      headline: "Kekuatan yang Disempurnakan.",
      subheadline:
        "JAECOO J8 SHS-P ARDIS memadukan performa 530 PS, sistem ARDIS, teknologi hybrid, dan kabin premium dalam satu SUV unggulan.",
      features: [
        {
          id: "j8-luxury-cabin",
          title: "Kabin Tanpa Kompromi",
          description:
            "Kabin premium dirancang untuk menghadirkan kenyamanan dan ketenangan, dengan detail yang mendukung pengalaman perjalanan jarak dekat maupun jauh.",
          tag: "Interior",
        },
        {
          id: "j8-adaptive-suspension",
          title: "Suspensi Adaptif Cerdas",
          description:
            "CDC Magnetic Suspension membantu menyesuaikan karakter redaman secara responsif untuk menjaga keseimbangan antara kenyamanan dan kendali.",
          tag: "Sasis",
        },
        {
          id: "j8-safety360",
          title: "Keamanan 360°",
          description:
            "19 fitur ADAS dan kamera 540° HD membantu meningkatkan kewaspadaan serta visibilitas di sekitar kendaraan.",
          tag: "Keselamatan",
        },
        {
          id: "j8-shs-flagship",
          title: "SHS Flagship",
          description:
            "Super Hybrid System dengan tiga motor listrik menghasilkan tenaga gabungan hingga 530 PS dan torsi 650 Nm untuk respons yang kuat dan cepat.",
          tag: "Performa SHS",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "Panjang", value: "4.820 mm" },
          { label: "Lebar", value: "1.930 mm" },
          { label: "Tinggi", value: "1.710 mm" },
          { label: "Wheelbase", value: "2.820 mm" },
          { label: "Ground Clearance", value: "190 mm" },
        ],
      },
      {
        label: "Powertrain",
        specs: [
          { label: "Sistem", value: "Super Hybrid System · Triple Motor" },
          { label: "Transmisi", value: "3DHT" },
          { label: "Penggerak", value: "AWD" },
          { label: "Baterai", value: "34,46 kWh · LFP" },
          { label: "Jarak Tempuh Listrik", value: "hingga 180 km" },
          { label: "Tenaga Gabungan", value: "530 PS" },
          { label: "Torsi Maksimum", value: "650 Nm" },
          { label: "0–100 km/jam", value: "5,4 detik" },
          { label: "Kecepatan Maksimum", value: "205 km/jam" },
        ],
      },
      {
        label: "Kenyamanan & Keselamatan",
        specs: [
          { label: "ADAS", value: "19 fitur" },
          { label: "Airbag", value: "10 Airbag" },
          { label: "Kamera", value: "540° HD" },
          { label: "Pengisian AC", value: "7.700 W" },
          { label: "V2L", value: "6,6 kW" },
          { label: "Pengisian DC", value: "sekitar 20 menit" },
          { label: "Mode Berkendara", value: "7 mode ARDIS" },
          { label: "Kapasitas", value: "7 penumpang" },
        ],
      },
    ],
    meta_title: "JAECOO J8 Ardis SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J8 Ardis SHS Rp865.000.000 OTR Palembang. SUV unggulan hybrid AWD dengan adaptive air suspension dan kabin premium. Jadwalkan test drive eksklusif bersama Sales JAECOO Palembang.",
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
