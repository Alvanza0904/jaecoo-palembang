/**
 * JAECOO Palembang — Mock Model Data
 *
 * This is a temporary seed layer.
 * Replace with Supabase queries when ready — the interface stays identical.
 */

import type { ModelData } from "@/lib/types/model";

export const MODELS: ModelData[] = [
  {
    slug: "j5-ev",
    name: "JAECOO J5 EV",
    short_name: "J5",
    tagline: "Electric. Intelligent. Ready.",
    description:
      "JAECOO J5 EV hadir sebagai SUV elektrik yang menggabungkan performa modern dengan desain premium — siap mengubah cara Anda berkendara di Palembang dan sekitarnya.",
    hero_media: {
      image: {
        desktop: "/images/models/j5-ev/hero-desktop.jpg",
        tablet: "/images/models/j5-ev/hero-tablet.jpg",
        mobile: "/images/models/j5-ev/hero-mobile.jpg",
        cutout: "/images/models/j5-ev/cutout.png",
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
      price_idr: 354900000,
      price_display: "Rp354.900.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j5-ev-standard",
        name: "JAECOO J5 EV",
        price_idr: 354900000,
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
          desktop: "/images/models/j5-ev/color-white.jpg",
          alt: "JAECOO J5 EV Crystal White",
        },
      },
      {
        id: "j5-black",
        name: "Midnight Black",
        hex: "#1a1a1a",
        image: {
          desktop: "/images/models/j5-ev/color-black.jpg",
          alt: "JAECOO J5 EV Midnight Black",
        },
      },
    ],
    technology: {
      headline: "Intelligence in Motion",
      subheadline:
        "Teknologi terdepan yang dirancang untuk memberikan pengalaman berkendara yang lebih intuitif, lebih aman, dan lebih efisien.",
      features: [
        {
          id: "j5-ev-range",
          title: "Jangkauan Lebih Jauh",
          description:
            "Dirancang untuk perjalanan sehari-hari dengan efisiensi daya yang optimal.",
          tag: "Electric Range",
        },
        {
          id: "j5-ev-adas",
          title: "Keselamatan Aktif",
          description:
            "Sistem ADAS yang memantau kondisi jalan secara real-time untuk ketenangan berkendara.",
          tag: "Safety",
        },
        {
          id: "j5-ev-connect",
          title: "Konektivitas Cerdas",
          description:
            "Layar sentuh besar dengan integrasi smartphone yang mulus dan respons yang cepat.",
          tag: "Connectivity",
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
        ],
      },
      {
        label: "Performa",
        specs: [
          { label: "Tipe Motor", value: "Permanent Magnet Synchronous" },
          { label: "Kapasitas Baterai", value: "Lihat dealer untuk detail" },
          { label: "Transmisi", value: "Single-speed Reducer" },
          { label: "Penggerak", value: "FWD" },
        ],
      },
    ],
    meta_title: "JAECOO J5 EV — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "Dapatkan JAECOO J5 EV mulai Rp354.900.000 OTR Palembang. SUV elektrik premium dengan teknologi terdepan. Hubungi Sales JAECOO Palembang.",
    published: true,
    updated_at: "2025-01-01T00:00:00Z",
  },

  {
    slug: "j7-shs",
    name: "JAECOO J7 SHS",
    short_name: "J7",
    tagline: "Hybrid. Powerful. Unstoppable.",
    description:
      "JAECOO J7 SHS menggabungkan keiritan hybrid dengan performa SUV sejati — pilihan tepat untuk jiwa petualang yang tidak mau kompromi.",
    hero_media: {
      image: {
        desktop: "/images/models/j7-shs/hero-desktop.jpg",
        tablet: "/images/models/j7-shs/hero-tablet.jpg",
        mobile: "/images/models/j7-shs/hero-mobile.jpg",
        cutout: "/images/models/j7-shs/cutout.png",
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
      price_idr: 534900000,
      price_display: "Rp534.900.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j7-shs-standard",
        name: "JAECOO J7 SHS",
        price_idr: 534900000,
        price_display: "Rp534.900.000",
        price_region: "OTR Palembang",
      },
      {
        id: "j7-sivp",
        name: "JAECOO J7 SHS-P",
        label: "SIVP",
        price_idr: 534900000,
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
          desktop: "/images/models/j7-shs/color-white.jpg",
          alt: "JAECOO J7 SHS Pearl White",
        },
      },
      {
        id: "j7-silver",
        name: "Titanium Silver",
        hex: "#9ca3af",
        image: {
          desktop: "/images/models/j7-shs/color-silver.jpg",
          alt: "JAECOO J7 SHS Titanium Silver",
        },
      },
    ],
    technology: {
      headline: "Smart Hybrid System",
      subheadline:
        "Sistem hybrid cerdas yang secara otomatis mengoptimalkan penggunaan daya untuk efisiensi maksimal di setiap kondisi jalan.",
      features: [
        {
          id: "j7-shs-powertrain",
          title: "Dual Power, Satu Tujuan",
          description:
            "Mesin bensin dan motor listrik bekerja secara harmonis untuk performa yang responsif sekaligus efisien.",
          tag: "Hybrid System",
        },
        {
          id: "j7-shs-awd",
          title: "Kendali di Setiap Medan",
          description:
            "Sistem penggerak yang adaptif memberikan traksi optimal di berbagai kondisi permukaan jalan.",
          tag: "Drivetrain",
        },
        {
          id: "j7-shs-intelligent",
          title: "Kokpit Digital",
          description:
            "Panel instrumen digital luas dengan AI assistant yang memahami kebutuhan berkendara Anda.",
          tag: "Cockpit",
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
        ],
      },
      {
        label: "Powertrain",
        specs: [
          { label: "Sistem", value: "Super Hybrid System (SHS)" },
          { label: "Transmisi", value: "DHT" },
          { label: "Penggerak", value: "AWD" },
          { label: "Kapasitas Tangki", value: "Lihat dealer untuk detail" },
        ],
      },
    ],
    meta_title: "JAECOO J7 SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J7 SHS mulai Rp534.900.000 OTR Palembang. SUV hybrid AWD dengan Smart Hybrid System. Test drive & konsultasi dengan Sales JAECOO Palembang.",
    published: true,
    updated_at: "2025-01-01T00:00:00Z",
  },

  {
    slug: "j8-ardis-shs",
    name: "JAECOO J8 Ardis SHS",
    short_name: "J8",
    tagline: "Flagship. Redefined.",
    description:
      "JAECOO J8 Ardis SHS mendefinisikan ulang standar SUV flagship — kemewahan, teknologi, dan performa dalam satu wujud yang tak tertandingi.",
    hero_media: {
      image: {
        desktop: "/images/models/j8-ardis/hero-desktop.jpg",
        tablet: "/images/models/j8-ardis/hero-tablet.jpg",
        mobile: "/images/models/j8-ardis/hero-mobile.jpg",
        cutout: "/images/models/j8-ardis/cutout.png",
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
      price_idr: 865000000,
      price_display: "Rp865.000.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j8-ardis-shs-standard",
        name: "JAECOO J8 Ardis SHS",
        price_idr: 865000000,
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
          desktop: "/images/models/j8-ardis/color-black.jpg",
          alt: "JAECOO J8 Ardis SHS Obsidian Black",
        },
      },
      {
        id: "j8-gold",
        name: "Champagne Gold",
        hex: "#c8a96e",
        image: {
          desktop: "/images/models/j8-ardis/color-gold.jpg",
          alt: "JAECOO J8 Ardis SHS Champagne Gold",
        },
      },
    ],
    technology: {
      headline: "Beyond Expectation",
      subheadline:
        "Setiap detail JAECOO J8 Ardis SHS dirancang untuk melampaui ekspektasi — dari suspensi adaptif hingga kabin yang menenangkan.",
      features: [
        {
          id: "j8-luxury-cabin",
          title: "Kabin Tanpa Kompromi",
          description:
            "Material premium, tata suara berkelas, dan pencahayaan ambien yang menciptakan suasana eksklusif di setiap perjalanan.",
          tag: "Interior",
        },
        {
          id: "j8-adaptive",
          title: "Suspensi Adaptif",
          description:
            "Sistem suspensi yang secara real-time menyesuaikan dengan kondisi jalan untuk kenyamanan optimal.",
          tag: "Chassis",
        },
        {
          id: "j8-safety360",
          title: "Keamanan 360°",
          description:
            "Ekosistem sensor dan kamera menyeluruh yang melindungi Anda dari segala arah.",
          tag: "Safety",
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
        ],
      },
      {
        label: "Powertrain",
        specs: [
          { label: "Sistem", value: "Super Hybrid System (SHS)" },
          { label: "Transmisi", value: "DHT" },
          { label: "Penggerak", value: "AWD" },
          { label: "Kapasitas Tangki", value: "Lihat dealer untuk detail" },
        ],
      },
    ],
    meta_title: "JAECOO J8 Ardis SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J8 Ardis SHS mulai Rp865.000.000 OTR Palembang. SUV flagship hybrid AWD terbaik. Jadwalkan test drive eksklusif bersama Sales JAECOO Palembang.",
    published: true,
    updated_at: "2025-01-01T00:00:00Z",
  },
];

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
