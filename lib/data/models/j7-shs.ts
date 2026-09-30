import type { ModelData } from "@/lib/types/model";
import { MODEL_PRICES, emptyImage, J7_SHS_SPECIFICATIONS } from "./shared";

export const MODEL_J7_SHS: ModelData = {
  slug: "jaecoo-j7-shs",
  sort_order: 2,
  name: "JAECOO J7 SHS",
  short_name: "J7 SHS",
  tagline: "SUPER HYBRID SYSTEM",
  description:
    "SUV plug-in hybrid dengan Super Hybrid System: mesin 1.5TGDI generasi kelima dipadu powertrain listrik melalui DHT. Nyaman di kota, tenang untuk jarak jauh.",
  hero_media: {
    image: {
      desktop: undefined,
      tablet: undefined,
      mobile: undefined,
      cutout: undefined,
      alt: "JAECOO J7 SHS — tampak samping",
    },
  },
  highlights: [
    { value: "100 km", label: "EV Range" },
    { value: "1.300 km", label: "Jarak kombinasi" },
    { value: "7,3 det", label: "0–100 km/jam" },
    { value: "19", label: "Fitur ADAS" },
  ],
  page_copy: {
    exterior: {
      label: "Desain",
      heading: "Desain yang\nberbicara.",
      body: "Siluet SUV yang tegas dengan lampu LED signature dan stance yang percaya diri. Proporsinya terasa matang dari depan sampai samping.",
    },
    design: {
      label: "Detail",
      heading: "Detail yang\ndikerjakan rapi.",
      body: "Grille horizontal dan lampu LED signature memberi wajah yang tegas. Garis bodi mengalir rapi, wheelbase 2.672 mm dan ground clearance 200 mm.",
    },
    profile: {
      label: "Karakter",
      heading: "Garis yang\nterasa bergerak.",
    },
    interior: {
      label: "Interior",
      heading: "Kokpit yang\nberkarakter.",
      body: "Kokpit berorientasi pengemudi dengan layar yang jelas dibaca. Ambient lighting, kamera 540° HD, dan delapan airbag membuat kabin terasa tenang dipakai.",
    },
    cockpit: {
      label: "Kokpit",
      heading: "Kontrol di\njung jari.",
      body: "Layar dan kontrol diletakkan supaya perhatian tetap ke jalan. Informasi penting mudah dibaca tanpa harus mencari-cari.",
    },
    performance: {
      label: "Performa",
      heading: "Super Hybrid.\nNyaman dipakai.",
      body: "Bisa jalan murni listrik di kota, lalu mesin ikut bekerja saat perjalanan lebih jauh. Transisi terasa halus, tanpa drama.",
    },
    adas: {
      label: "Keselamatan",
      stat: "19",
      unit: "ADAS",
      heading: "Dibekali\n19 fitur ADAS.",
      body: "Dari adaptive cruise hingga peringatan titik buta dan pengereman darurat — 19 fitur ADAS yang membantu tanpa mengambil alih kendali.",
    },
    cta: {
      label: "JAECOO J7 SHS · Palembang",
      heading: "Siap merasakan\nJ7 SHS?",
      body: "Jadwalkan test drive JAECOO J7 SHS di Palembang. Untuk Super Intelligent Valet Parking, lihat J7 SIVP.",
    },
    tech_intelligence: {
      label: "Teknologi",
      heading: "Detail yang\nterasa pintar.",
      body: "Kamera 540° HD dan 19 fitur ADAS membantu membaca situasi di sekitar. Pengemudi tetap yang memutuskan.",
    },
    tech_stats: [
      { value: "19", label: "Fitur ADAS" },
      { value: "540°", label: "HD surround camera" },
      { value: "8", label: "Airbag" },
      { value: "44,5%", label: "Efisiensi termal" },
    ],
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
  ],
  colors: [
    { id: "j7-white", name: "Pristine White", hex: "#F5F5F5", image: emptyImage("JAECOO J7 SHS Pristine White") },
    { id: "j7-stone", name: "Stone Gray", hex: "#8D8F91", image: emptyImage("JAECOO J7 SHS Stone Gray") },
    { id: "j7-silver", name: "Moonlight Silver", hex: "#C0C4C8", image: emptyImage("JAECOO J7 SHS Moonlight Silver") },
    { id: "j7-two-tone", name: "Pristine White Two Tone", hex: "#E7E7E4", image: emptyImage("JAECOO J7 SHS Pristine White Two Tone") },
    { id: "j7-black", name: "Jet Black", hex: "#111111", image: emptyImage("JAECOO J7 SHS Jet Black") },
  ],
  technology: {
    headline: "Super Hybrid System",
    subheadline:
      "Mesin 1.5TGDI DHE generasi kelima dipadu motor listrik melalui DHT. Efisiensi termal 44,5%, efisiensi EV hingga 98,5%.",
    features: [
      {
        id: "j7-shs-powertrain",
        title: "1.5TGDI DHE + DHT",
        description:
          "Mesin 140 hp dipadu motor listrik 201 hp. Baterai 18,3 kWh (IP68) memungkinkan pure EV mode hingga 100 km untuk perjalanan kota.",
        tag: "SHS",
      },
      {
        id: "j7-shs-range",
        title: "1.300 km jarak kombinasi",
        description:
          "Mesin dan listrik bekerja bersama untuk jarak kombinasi hingga 1.300 km. Akselerasi 0–100 km/jam 7,3 detik terasa cukup untuk jalanan harian.",
        tag: "Jarak",
      },
      {
        id: "j7-shs-modes",
        title: "ECO · STANDARD · SPORT",
        description:
          "ECO untuk hemat, STANDARD untuk keseimbangan harian, SPORT saat butuh respons lebih cepat dari powertrain hybrid.",
        tag: "Mode",
      },
      {
        id: "j7-shs-adas",
        title: "19 fitur ADAS",
        description:
          "Adaptive cruise, traffic jam assist, blind spot, AEB, dan lane assist termasuk di dalamnya. Dilengkapi kamera 540° HD dan delapan airbag.",
        tag: "Keselamatan",
      },
    ],
  },
  specifications: J7_SHS_SPECIFICATIONS,
  meta_title: "JAECOO J7 SHS Palembang | SUV Plug-in Hybrid & Spesifikasi",
  meta_description:
    "JAECOO J7 SHS di Palembang adalah SUV plug-in hybrid dengan Super Hybrid System. Lihat harga, spesifikasi, dan jadwalkan test drive.",
  published: true,
  updated_at: "2026-09-23T00:00:00Z",
};
