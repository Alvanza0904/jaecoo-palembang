import type { ModelData } from "@/lib/types/model";
import { MODEL_PRICES, emptyImage } from "./shared";

export const MODEL_J5_EV: ModelData = {
    slug: "jaecoo-j5-ev",
    sort_order: 1,
    name: "JAECOO J5 EV",
    short_name: "J5 EV",
    tagline: "THIS IS THE REAL SUV.",
    description:
      "SUV listrik untuk perjalanan harian di kota. Tenaga instan, ruang kabin yang nyaman, dan jarak tempuh yang cukup untuk aktivitas sehari-hari.",
    hero_media: {
      image: {
        desktop: undefined,
        tablet: undefined,
        mobile: undefined,
        cutout: undefined,
        alt: "JAECOO J5 EV — tampak depan tiga perempat",
      },
    },
    highlights: [
      { value: "60,9 kWh", label: "CATL · LFP" },
      { value: "461 km", label: "NEDC" },
      { value: "130 kW", label: "210 PS" },
      { value: "28 menit", label: "Pengisian DC" },
    ],
    page_copy: {
      exterior: {
        label: "Desain",
        heading: "Dirancang untuk\nkeseharian.",
        body: "Proporsi SUV yang tegas dengan garis bodi bersih. Dari depan, karakter J5 langsung terbaca tanpa terasa berlebihan.",
      },
      design: {
        label: "Detail",
        heading: "Karakter yang\nberbicara.",
        body: "Lampu depan yang tajam, pelek yang tegas, dan garis samping yang mengalir membuat J5 tetap terlihat rapi dari dekat maupun dari kejauhan.",
      },
      profile: {
        label: "Karakter",
        heading: "Tegas secara\nalami.",
      },
      interior: {
        label: "Interior",
        heading: "Lebih dari\nsekadar kabin.",
        body: "Masuk ke dalam, kabin terasa lega dengan layout yang simpel. Kursi nyaman, ruang kaki cukup, dan kontrol mudah dijangkau tanpa mengganggu fokus ke jalan.",
      },
      cockpit: {
        label: "Kokpit",
        heading: "Pusat kendali\ndigital.",
        body: "Layar digital dan kontrol utama berada dalam jangkauan tangan. Informasi yang dibutuhkan muncul jelas, tanpa membuat dashboard terasa ramai.",
      },
      performance: {
        label: "Performa",
        heading: "Angka yang\npunya tujuan.",
        body: "Respons motor listrik terasa langsung saat gas diinjak, tetap halus saat dipakai santai di lalu lintas kota.",
      },
      adas: {
        label: "Keselamatan",
        stat: "17",
        unit: "ADAS",
        heading: "Bantuan pengemudi\nyang terukur.",
        body: "17 fitur ADAS membantu menjaga jarak, menjaga jalur, dan memberi peringatan saat dibutuhkan — pengemudi tetap memegang kendali.",
      },
      cta: {
        label: "JAECOO J5 EV · Palembang",
        heading: "Siap melangkah\nbersama J5?",
        body: "Hubungi Alvan untuk harga terbaru, simulasi kredit, informasi unit, dan jadwal test drive JAECOO J5 EV di Palembang.",
      },
      tech_intelligence: {
        label: "Teknologi",
        heading: "Teknologi yang\nterasa dekat.",
        body: "Antarmuka digital yang mudah dibaca, regenerasi tiga level, dan pengisian DC hingga 130 kW — sekitar 28 menit untuk kembali siap jalan.",
      },
      tech_stats: [
        { value: "17", label: "Fitur ADAS" },
        { value: "3", label: "Level regenerasi" },
        { value: "130 kW", label: "Pengisian DC" },
        { value: "7.700 W", label: "AC wall mount" },
      ],
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
      { id: "j5-ivory", name: "Ivory Gray", hex: "#B8B8AE", image: emptyImage("JAECOO J5 EV Ivory Gray") },
      { id: "j5-forest", name: "Forest Green", hex: "#34483D", image: emptyImage("JAECOO J5 EV Forest Green") },
      { id: "j5-white", name: "White Pristine", hex: "#F7F7F5", image: emptyImage("JAECOO J5 EV White Pristine") },
      { id: "j5-black", name: "Jet Black", hex: "#111111", image: emptyImage("JAECOO J5 EV Jet Black") },
    ],
    technology: {
      headline: "Teknologi yang terasa dekat.",
      subheadline:
        "Dari antarmuka digital sampai pengisian daya — teknologi yang terasa membantu saat dipakai setiap hari.",
      features: [
        {
          id: "j5-ev-range",
          title: "Jangkauan 461 km NEDC",
          description:
            "Baterai 60,9 kWh CATL LFP dengan jarak tempuh 461 km NEDC. Cukup untuk aktivitas harian, masih longgar untuk perjalanan luar kota.",
          tag: "Baterai",
        },
        {
          id: "j5-ev-charge",
          title: "Pengisian DC sekitar 28 menit",
          description:
            "Isi daya DC hingga 130 kW sekitar 28 menit. Di rumah bisa pakai AC wall mount 7.700 W, atau charger portabel 2.200 W saat bepergian.",
          tag: "Pengisian",
        },
        {
          id: "j5-ev-drive",
          title: "130 kW / 210 PS",
          description:
            "Motor 130 kW / 210 PS dan torsi 288 Nm. 0–100 km/jam 7,3 detik, dengan mode Eco, Normal, Sport, plus tiga level regenerasi sesuai gaya berkendara.",
          tag: "Performa",
        },
        {
          id: "j5-ev-adas",
          title: "17 fitur ADAS",
          description:
            "17 fitur bantuan pengemudi untuk perjalanan harian — menjaga jarak, jalur, dan memberi peringatan. Kendali tetap di tangan pengemudi.",
          tag: "ADAS",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "Dimensi (P × L × T)", value: "4.380 × 1.860 × 1.650 mm" },
          { label: "Wheelbase", value: "2.620 mm" },
          { label: "Kapasitas", value: "5 penumpang" },
          { label: "Ban", value: "235/55 R18" },
        ],
      },
      {
        label: "Bagasi",
        specs: [
          { label: "Kapasitas bagasi", value: "480 L" },
          { label: "Dengan kursi belakang dilipat", value: "1.180 L" },
          { label: "Front trunk / bagasi depan", value: "35 L" },
        ],
      },
      {
        label: "Powertrain",
        specs: [
          { label: "Drivetrain", value: "BEV · FWD" },
          { label: "Motor", value: "130 kW / 210 PS" },
          { label: "Torsi maksimum", value: "288 Nm" },
          { label: "Baterai", value: "60,9 kWh · CATL · LFP" },
          { label: "Jarak tempuh", value: "461 km NEDC" },
          { label: "0–100 km/jam", value: "7,3 detik" },
          { label: "Mode berkendara", value: "Eco · Normal · Sport" },
          { label: "Regeneratif", value: "3 level" },
        ],
      },
      {
        label: "Pengisian & Keselamatan",
        specs: [
          { label: "Pengisian DC", value: "130 kW · sekitar 28 menit" },
          { label: "AC wall mount", value: "7.700 W" },
          { label: "Pengisian portabel", value: "2.200 W" },
          { label: "ADAS", value: "17 fitur" },
        ],
      },
    ],
    meta_title: "JAECOO J5 EV Palembang | SUV Listrik, Harga & Spesifikasi",
    meta_description:
      "Kenali JAECOO J5 EV di Palembang, SUV listrik untuk perjalanan harian. Lihat harga OTR, spesifikasi, dan jadwalkan test drive.",
    published: true,
    updated_at: "2026-09-23T00:00:00Z",
};
