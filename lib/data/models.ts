/**
 * JAECOO Palembang — Model Data
 *
 * Static fallback used when Supabase has no row for a field.
 * Figures below are taken from omodajaecoopalembang.web.id.
 * J7 SHS and J7 SIVP are separate models — do not share feature copy.
 *
 * Slugs: jaecoo-j5-ev | jaecoo-j7-shs | jaecoo-j7-sivp | jaecoo-j8-shs
 */

import type { ModelData, ModelSpecCategory } from "@/lib/types/model";

export const MODEL_PRICES = {
  "jaecoo-j5-ev": 354_900_000,
  "jaecoo-j7-shs": 534_900_000,
  "jaecoo-j8-shs": 865_000_000,
} as const;

const emptyImage = (alt: string) => ({ desktop: undefined, alt });

/**
 * Vehicle specifications shared by J7 SHS and J7 SIVP.
 * SIVP does not invent a second powertrain sheet — Super Intelligent
 * Valet Parking, LiDAR, and the 27-sensor suite live on the Technology page.
 */
const J7_SHS_SPECIFICATIONS: ModelSpecCategory[] = [
  {
    label: "Dimensi",
    specs: [
      { label: "Wheelbase", value: "2.672 mm" },
      { label: "Ground clearance", value: "200 mm" },
    ],
  },
  {
    label: "Super Hybrid System",
    specs: [
      { label: "Mesin", value: "Fifth-generation 1.5TGDI DHE" },
      { label: "Transmisi", value: "Dedicated Hybrid Transmission (DHT)" },
      { label: "Tenaga mesin", value: "140 hp" },
      { label: "Tenaga listrik", value: "201 hp" },
      { label: "Efisiensi termal", value: "44,5%" },
      { label: "Efisiensi EV maksimal", value: "98,5%" },
      { label: "Baterai", value: "18,3 kWh · IP68" },
      { label: "EV range", value: "100 km" },
      { label: "Jarak kombinasi", value: "1.300 km" },
      { label: "0–100 km/jam", value: "7,3 detik" },
      { label: "Mode berkendara", value: "ECO · STANDARD · SPORT" },
    ],
  },
  {
    label: "Kabin & Keselamatan",
    specs: [
      { label: "ADAS", value: "19 fitur" },
      { label: "Airbag", value: "8 airbag" },
      { label: "Kamera", value: "540° HD surround view" },
      { label: "Pengisian AC", value: "7,7 kW" },
    ],
  },
];

export const MODELS: ModelData[] = [
  {
    slug: "jaecoo-j5-ev",
    sort_order: 1,
    name: "JAECOO J5 EV",
    short_name: "J5 EV",
    tagline: "THIS IS THE REAL SUV.",
    description:
      "SUV listrik premium yang membawa karakter JAECOO ke gaya hidup urban—clean, bold, dan siap diajak ke mana saja.",
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
        body: "JAECOO J5 EV menggabungkan proporsi SUV yang tegas dengan powertrain listrik yang praktis untuk mobilitas harian.",
      },
      design: {
        label: "Detail",
        heading: "Karakter yang\nberbicara.",
        body: "Detail lampu, garis bodi, desain pelek, dan proporsi SUV berpadu menjadi karakter yang terlihat modern dari setiap sudut.",
      },
      profile: {
        label: "Karakter",
        heading: "Tegas secara\nalami.",
      },
      interior: {
        label: "Interior",
        heading: "Lebih dari\nsekadar kabin.",
        body: "Kabin modern dengan kokpit yang terasa terhubung, ruang yang nyaman, dan detail yang membuat perjalanan harian lebih menyenangkan.",
      },
      cockpit: {
        label: "Kokpit",
        heading: "Pusat kendali\ndigital.",
        body: "Layar, kontrol, ruang penyimpanan, kursi, dan pandangan luas bekerja bersama tanpa membuat kabin terasa penuh.",
      },
      performance: {
        label: "Performa",
        heading: "Angka yang\npunya tujuan.",
      },
      adas: {
        label: "Keselamatan",
        stat: "17",
        unit: "ADAS",
        heading: "Bantuan pengemudi\nyang terukur.",
        body: "17 fitur ADAS, tiga level regenerasi energi, dan pengisian daya DC hingga 130 kW.",
      },
      cta: {
        label: "JAECOO J5 EV · Palembang",
        heading: "Siap melangkah\nbersama J5?",
        body: "Hubungi Alvan untuk harga terbaru, simulasi kredit, informasi unit, dan jadwal test drive JAECOO J5 EV di Palembang.",
      },
      tech_intelligence: {
        label: "Teknologi",
        heading: "Smart where\nit matters.",
        body: "J5 memadukan antarmuka digital dengan berkendara listrik yang praktis: AC wall mount 7.700 W dan pengisian DC hingga 130 kW, sekitar 28 menit.",
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
      headline: "Smart where it matters.",
      subheadline:
        "Teknologi yang terasa dekat dengan pengemudi — dari antarmuka digital sampai berkendara listrik yang praktis.",
      features: [
        {
          id: "j5-ev-range",
          title: "Jangkauan 461 km NEDC",
          description:
            "Baterai 60,9 kWh CATL LFP menghadirkan jarak tempuh 461 km NEDC untuk mobilitas harian maupun luar kota.",
          tag: "Baterai",
        },
        {
          id: "j5-ev-charge",
          title: "Pengisian DC sekitar 28 menit",
          description:
            "Pengisian daya DC hingga 130 kW, sekitar 28 menit. AC wall mount 7.700 W dan pengisian portabel 2.200 W.",
          tag: "Pengisian",
        },
        {
          id: "j5-ev-drive",
          title: "130 kW / 210 PS",
          description:
            "Motor listrik 130 kW / 210 PS, torsi 288 Nm, 0–100 km/jam 7,3 detik. Mode Eco, Normal, dan Sport, dengan 3 level regenerasi.",
          tag: "Performa",
        },
        {
          id: "j5-ev-adas",
          title: "17 fitur ADAS",
          description:
            "17 fitur bantuan pengemudi untuk penggunaan sehari-hari. Pengemudi tetap memegang kendali kendaraan.",
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
    meta_title: "JAECOO J5 EV — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J5 EV Rp354.900.000 OTR Palembang. Baterai 60,9 kWh, 461 km NEDC, 130 kW / 210 PS, 17 fitur ADAS.",
    published: true,
    updated_at: "2026-09-23T00:00:00Z",
  },
  {
    slug: "jaecoo-j7-shs",
    sort_order: 2,
    name: "JAECOO J7 SHS",
    short_name: "J7 SHS",
    tagline: "SUPER HYBRID SYSTEM",
    description:
      "JAECOO J7 SHS hadir dengan Super Hybrid System — perpaduan mesin 1.5TGDI generasi kelima dan powertrain listrik melalui DHT. SUV premium untuk perjalanan kota maupun jarak jauh, tanpa klaim fitur SIVP.",
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
        body: "Proporsi SUV premium — siluet tegas, lampu LED, dan stance yang percaya diri. Ini halaman J7 SHS, bukan J7 SIVP.",
      },
      design: {
        label: "Detail",
        heading: "Crafted in\nevery detail.",
        body: "Grille horizontal, lampu LED signature, dan garis bodi yang mengalir. Wheelbase 2.672 mm dan ground clearance 200 mm.",
      },
      profile: {
        label: "Karakter",
        heading: "Sculpted\nin motion.",
      },
      interior: {
        label: "Interior",
        heading: "Kokpit yang\nberkarakter.",
        body: "Kokpit berorientasi pengemudi, layar informasi, dan ambient lighting. 540° HD, 8 airbag, serta mode ECO, STANDARD, dan SPORT.",
      },
      cockpit: {
        label: "Kokpit",
        heading: "Intelligence at\nyour fingertips.",
        body: "Layout kokpit J7 SHS menempatkan layar dan kontrol agar perhatian tetap ke jalan. Bukan sistem valet parking SIVP.",
      },
      performance: {
        label: "Performa",
        heading: "Super hybrid.\nSuper experience.",
      },
      adas: {
        label: "Keselamatan",
        stat: "19",
        unit: "ADAS",
        heading: "Dibekali\n19 fitur ADAS.",
        body: "Adaptive Cruise Control, Traffic Jam Assist, Blind Spot Detection, Driver Monitoring, Rear Cross Traffic Alert & Braking, Forward Collision Warning & AEB, Emergency Lane Keeping, dan Lane Changing Assistance.",
      },
      cta: {
        label: "JAECOO J7 SHS · Palembang",
        heading: "Siap merasakan\nJ7 SHS?",
        body: "Jadwalkan test drive JAECOO J7 SHS di Palembang. Untuk Super Intelligent Valet Parking, lihat J7 SIVP.",
      },
      tech_intelligence: {
        label: "Teknologi",
        heading: "Intelligence,\nin every detail.",
        body: "19 fitur ADAS dan kamera 540° HD bekerja mendukung pengemudi. Pengemudi tetap bertanggung jawab penuh atas kendaraan.",
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
        "Mesin 1.5TGDI DHE generasi kelima dan motor listrik melalui Dedicated Hybrid Transmission. Efisiensi termal 44,5% dan efisiensi EV maksimal 98,5%.",
      features: [
        {
          id: "j7-shs-powertrain",
          title: "1.5TGDI DHE + DHT",
          description:
            "Tenaga mesin 140 hp dan tenaga listrik 201 hp. Baterai 18,3 kWh bersertifikasi IP68. Pure EV mode hingga 100 km.",
          tag: "SHS",
        },
        {
          id: "j7-shs-range",
          title: "1.300 km jarak kombinasi",
          description:
            "Sistem hybrid menggabungkan mesin dan listrik untuk jarak tempuh kombinasi 1.300 km. 0–100 km/jam dalam 7,3 detik.",
          tag: "Jarak",
        },
        {
          id: "j7-shs-modes",
          title: "ECO · STANDARD · SPORT",
          description:
            "Tiga mode berkendara: ECO untuk efisiensi, STANDARD untuk keseimbangan harian, dan SPORT untuk respons powertrain hybrid.",
          tag: "Mode",
        },
        {
          id: "j7-shs-adas",
          title: "19 fitur ADAS",
          description:
            "Mencakup Adaptive Cruise Control, Traffic Jam Assist, Blind Spot Detection, Driver Monitoring System, Rear Cross Traffic Alert & Braking, Forward Collision Warning & AEB, Emergency Lane Keeping, dan Lane Changing Assistance. Kamera 540° HD dan 8 airbag.",
          tag: "Keselamatan",
        },
      ],
    },
    specifications: J7_SHS_SPECIFICATIONS,
    meta_title: "JAECOO J7 SHS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J7 SHS Rp534.900.000 OTR Palembang. Super Hybrid 1.5TGDI, EV range 100 km, jarak kombinasi 1.300 km, 19 ADAS. Bukan varian SIVP.",
    published: true,
    updated_at: "2026-09-23T00:00:00Z",
  },
  {
    slug: "jaecoo-j7-sivp",
    sort_order: 3,
    name: "JAECOO J7 SHS-P SIVP",
    short_name: "J7 SIVP",
    tagline: "YOUR SUV. YOUR PERSONAL VALET.",
    description:
      "Super Intelligent Valet Parking memungkinkan J7 mencari tempat parkir, memarkirkan diri, lalu datang kembali saat dipanggil — tanpa pengemudi di dalam mobil.",
    hero_media: {
      image: {
        desktop: undefined,
        tablet: undefined,
        mobile: undefined,
        cutout: undefined,
        alt: "JAECOO J7 SIVP — Super Intelligent Valet Parking",
      },
    },
    highlights: [
      { value: "27", label: "Sensors & cameras" },
      { value: "128-ch", label: "dToF LiDAR" },
      { value: "540°", label: "Camera coverage" },
      { value: "100 km", label: "EV range" },
    ],
    page_copy: {
      exterior: {
        label: "SIVP",
        heading: "Your SUV.\nYour personal valet.",
        body: "J7 mencari tempat parkir, memarkirkan diri, lalu datang kembali saat dipanggil. Tanpa pengemudi. Tanpa khawatir.",
      },
      design: {
        label: "Cara kerja",
        heading: "Find.\nPark.\nLeave.",
        body: "Pilih area parkir dari smartphone, lalu turun. Sistem mendeteksi pejalan kaki dan hambatan, dan manuver dilakukan otomatis sampai posisi parkir.",
      },
      profile: {
        label: "Persepsi",
        heading: "Intelligence\nthat sees.",
      },
      interior: {
        label: "Kendali",
        heading: "Pantau dari\ngenggaman.",
        body: "Ikuti proses parkir secara real-time lewat aplikasi di smartphone. Empat langkah: pilih area, deteksi hambatan, pantau, lalu biarkan J7 bekerja.",
      },
      cockpit: {
        label: "Keputusan",
        heading: "See.\nUnderstand.\nAct.",
        body: "Intelligent Driving Domain Controller memproses sensor secara bersamaan dan menghitung jalur parkir. Kemudi, gas, dan rem dieksekusi tanpa intervensi pengemudi.",
      },
      performance: {
        label: "Platform",
        heading: "Plug-in hybrid.\nIntelligent by design.",
      },
      adas: {
        label: "Persepsi",
        stat: "27",
        unit: "SENSOR",
        heading: "Built to\nperceive.",
        body: "27 sensor dan kamera, LiDAR 128-channel dToF, radar, dan kamera 540°. Ini paket SIVP, bukan daftar fitur J7 SHS standar.",
      },
      cta: {
        label: "JAECOO J7 SIVP · Palembang",
        heading: "Ready to\nexperience SIVP?",
        body: "Harga resmi J7 SIVP belum diumumkan di halaman referensi — status pre-book. Hubungi Alvan untuk informasi dan test drive di Palembang.",
      },
      tech_intelligence: {
        label: "SIVP",
        heading: "Intelligence\nin confined spaces.",
        body: "Basement sempit, tikungan ketat, dan pilar yang menyempit justru menjadi area kerja SIVP. Sistem yang sama juga tetap beroperasi di ruang terbuka.",
      },
      tech_stats: [
        { value: "27", label: "Sensors & cameras" },
        { value: "128-ch", label: "dToF LiDAR" },
        { value: "540°", label: "Camera coverage" },
        { value: "7,7 kW", label: "AC charging" },
      ],
    },
    default_variant: {
      id: "j7-sivp",
      name: "JAECOO J7 SHS-P SIVP",
      label: "SIVP",
      price_status: "prebook",
      price_idr: null,
      price_display: null,
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j7-sivp",
        name: "JAECOO J7 SHS-P SIVP",
        label: "SIVP",
        price_status: "prebook",
        price_idr: null,
        price_display: null,
        price_region: "OTR Palembang",
      },
    ],
    colors: [
      { id: "sivp-white", name: "Pristine White", hex: "#F5F5F5", image: emptyImage("JAECOO J7 SIVP Pristine White") },
      { id: "sivp-stone", name: "Stone Gray", hex: "#8D8F91", image: emptyImage("JAECOO J7 SIVP Stone Gray") },
      { id: "sivp-silver", name: "Moonlight Silver", hex: "#C0C4C8", image: emptyImage("JAECOO J7 SIVP Moonlight Silver") },
      { id: "sivp-black", name: "Jet Black", hex: "#111111", image: emptyImage("JAECOO J7 SIVP Jet Black") },
    ],
    technology: {
      headline: "Super Intelligent Valet Parking",
      subheadline:
        "J7 memetakan lingkungan, memilih jalur, lalu memarkirkan diri. Platform SHS-P tetap plug-in hybrid — fitur yang dijual di halaman ini adalah SIVP.",
      features: [
        {
          id: "j7-sivp-see",
          title: "27 sensor dan kamera",
          description:
            "Jaringan sensor dan kamera memetakan lingkungan secara real-time. LiDAR 128-channel dToF mengukur jarak, radar mendeteksi objek, kamera 540° membaca konteks visual.",
          tag: "Persepsi",
        },
        {
          id: "j7-sivp-spaces",
          title: "Ruang sempit maupun terbuka",
          description:
            "Basement, tikungan ketat, dan pilar ditangani dengan presisi lebih tinggi saat ruang terbatas. Di ruang terbuka sistem tetap beroperasi.",
          tag: "SIVP",
        },
        {
          id: "j7-sivp-steps",
          title: "Pilih, deteksi, pantau, parkir",
          description:
            "Tentukan zona parkir dari smartphone lalu turun. Sistem mendeteksi objek bergerak dan statis. Prosesnya dipantau dari aplikasi sampai posisi parkir tercapai.",
          tag: "Alur",
        },
        {
          id: "j7-sivp-platform",
          title: "Platform SHS-P",
          description:
            "Angka platform yang sama dengan J7 SHS: baterai 18,3 kWh, EV range 100 km, jarak kombinasi 1.300 km, dan pengisian AC 7,7 kW.",
          tag: "Platform",
        },
      ],
    },
    specifications: J7_SHS_SPECIFICATIONS,
    meta_title: "JAECOO J7 SIVP — Super Intelligent Valet Parking | JAECOO Palembang",
    meta_description:
      "JAECOO J7 SHS-P SIVP di Palembang. 27 sensor dan kamera, LiDAR 128-channel, kamera 540°. Harga resmi menyusul — pre-book.",
    published: true,
    updated_at: "2026-09-23T00:00:00Z",
  },
  {
    slug: "jaecoo-j8-shs",
    sort_order: 4,
    name: "JAECOO J8 SHS-P ARDIS",
    short_name: "J8 SHS-P ARDIS",
    tagline: "KEKUATAN YANG DISEMPURNAKAN.",
    description:
      "J8 SHS-P ARDIS menggabungkan Super Hybrid System, triple motor, dan ARDIS all-wheel drive. Tujuh tempat duduk, tujuh mode berkendara, dan tenaga gabungan 530 PS.",
    hero_media: {
      image: {
        desktop: undefined,
        tablet: undefined,
        mobile: undefined,
        cutout: undefined,
        alt: "JAECOO J8 SHS-P ARDIS",
      },
    },
    highlights: [
      { value: "530 PS", label: "Tenaga gabungan" },
      { value: "650 Nm", label: "Torsi gabungan" },
      { value: "5,4 dtk", label: "0–100 km/jam" },
      { value: "180 km", label: "EV range" },
    ],
    page_copy: {
      exterior: {
        label: "Desain",
        heading: "Desain yang kuat.\nDetail yang matang.",
        body: "Proporsi bodi yang tegas dipadukan dengan grille, lampu, dan velg 20 inci. Ini halaman J8 SHS-P ARDIS, bukan J7.",
      },
      design: {
        label: "Detail",
        heading: "Satu mobil,\nbanyak sudut.",
        body: "Side profile, signature grille, lampu depan, velg 20 inci, dan identitas PHEV di sisi bodi.",
      },
      profile: {
        label: "Karakter",
        heading: "Bukan cuma\ntampil gagah.",
      },
      interior: {
        label: "Interior",
        heading: "Kabin yang terasa\nseperti ruang sendiri.",
        body: "Tujuh penumpang dalam tiga baris. Baris pertama untuk pengemudi, baris kedua sebagai ruang utama, baris ketiga tetap tersedia.",
      },
      cockpit: {
        label: "Kokpit",
        heading: "Kontrol yang\nmudah dijangkau.",
        body: "Mode berkendara dan informasi penting diletakkan supaya tetap mudah diakses saat berkendara.",
      },
      performance: {
        label: "Performa",
        heading: "Tenaga besar,\ntetap enak dipakai.",
      },
      adas: {
        label: "Keselamatan",
        stat: "19",
        unit: "ADAS",
        heading: "Bantuan untuk\nperjalanan yang tenang.",
        body: "19 fitur ADAS, kamera 540° HD, dan 10 airbag.",
      },
      cta: {
        label: "JAECOO J8 · Palembang",
        heading: "Mau lihat J8\ndi Palembang?",
        body: "Tanya harga, promo, simulasi kredit, atau jadwalkan test drive JAECOO J8 SHS-P ARDIS.",
      },
      tech_intelligence: {
        label: "ARDIS",
        heading: "Tenaga besar\ntanpa kehilangan fleksibilitas.",
        body: "Triple motor dan AWD ARDIS menyesuaikan respons dengan kondisi perjalanan. Tujuh mode berkendara.",
      },
      tech_stats: [
        { value: "530 PS", label: "Tenaga gabungan" },
        { value: "650 Nm", label: "Torsi gabungan" },
        { value: "5,4 dtk", label: "0–100 km/jam" },
        { value: "7", label: "Driving modes" },
      ],
    },
    default_variant: {
      id: "j8-shs-ardis",
      name: "JAECOO J8 SHS-P ARDIS",
      price_status: "official",
      price_idr: MODEL_PRICES["jaecoo-j8-shs"],
      price_display: "Rp865.000.000",
      price_region: "OTR Palembang",
    },
    variants: [
      {
        id: "j8-shs-ardis",
        name: "JAECOO J8 SHS-P ARDIS",
        label: "SHS",
        price_status: "official",
        price_idr: MODEL_PRICES["jaecoo-j8-shs"],
        price_display: "Rp865.000.000",
        price_region: "OTR Palembang",
      },
    ],
    colors: [
      { id: "j8-stone", name: "Stone Grey", hex: "#8A8D8F", image: emptyImage("JAECOO J8 Stone Grey") },
      { id: "j8-white", name: "Pristine White", hex: "#F4F4F2", image: emptyImage("JAECOO J8 Pristine White") },
      { id: "j8-silver", name: "Lunar Silver", hex: "#C5C7C9", image: emptyImage("JAECOO J8 Lunar Silver") },
      { id: "j8-black", name: "Jet Black", hex: "#121212", image: emptyImage("JAECOO J8 Jet Black") },
    ],
    technology: {
      headline: "Super Hybrid System · ARDIS",
      subheadline:
        "J8 SHS-P ARDIS memakai triple motor dan AWD untuk menyesuaikan respons. Tujuh mode berkendara, tenaga gabungan 530 PS, torsi 650 Nm.",
      features: [
        {
          id: "j8-shs-output",
          title: "530 PS dan 650 Nm",
          description:
            "1.5L TGDI dengan triple motor PHEV. 0–100 km/jam 5,4 detik. Kecepatan maksimum 205 km/jam.",
          tag: "Performa",
        },
        {
          id: "j8-shs-ardis",
          title: "AWD · 7 mode ARDIS",
          description:
            "ARDIS all-wheel drive dengan tujuh mode, termasuk karakter untuk jalan yang berubah, water crossing, sand, dan trail.",
          tag: "ARDIS",
        },
        {
          id: "j8-shs-battery",
          title: "EV range hingga 180 km",
          description:
            "Baterai 34,46 kWh LFP. Total range klaim pabrikan di atas 1.400 km. V2L 6,6 kW. Regenerative braking 3 level.",
          tag: "Hybrid",
        },
        {
          id: "j8-shs-safety",
          title: "19 ADAS · 10 airbag",
          description:
            "19 fitur ADAS, kamera 540° HD, dan 10 airbag. Suspensi CDC magnetic, double wishbone / multi-link. Velg 20 inci, ban 265/45 R20.",
          tag: "Keselamatan",
        },
      ],
    },
    specifications: [
      {
        label: "Dimensi",
        specs: [
          { label: "P × L × T", value: "4.820 × 1.930 × 1.710 mm" },
          { label: "Wheelbase", value: "2.820 mm" },
          { label: "Ground clearance", value: "190 mm" },
          { label: "Kapasitas", value: "7 penumpang" },
          { label: "Ban", value: "265/45 R20" },
          { label: "Velg", value: "20 inci" },
        ],
      },
      {
        label: "SHS-P ARDIS",
        specs: [
          { label: "Powertrain", value: "1.5L TGDI + Triple Motor PHEV · AWD" },
          { label: "Tenaga", value: "530 PS" },
          { label: "Torsi", value: "650 Nm" },
          { label: "0–100 km/jam", value: "5,4 detik" },
          { label: "Kecepatan maksimum", value: "205 km/jam" },
          { label: "Penggerak", value: "AWD · ARDIS · 7 mode" },
          { label: "Suspensi", value: "CDC Magnetic Suspension · Double wishbone / Multi-link" },
          { label: "Baterai", value: "34,46 kWh LFP" },
          { label: "EV range", value: "hingga 180 km" },
          { label: "Total range", value: ">1.400 km" },
          { label: "V2L", value: "6,6 kW" },
          { label: "Regenerative braking", value: "3 level" },
        ],
      },
      {
        label: "Pengisian & Keselamatan",
        specs: [
          { label: "DC fast charging", value: "sekitar 20 menit (0–80%)" },
          { label: "AC wall mount", value: "7.700 W · sekitar 6 jam" },
          { label: "Portable charging", value: "2.200 W · sekitar 18 jam" },
          { label: "ADAS", value: "19 fitur" },
          { label: "Kamera", value: "540° HD" },
          { label: "Airbag", value: "10 airbag" },
          { label: "Wireless charging", value: "50 W" },
        ],
      },
    ],
    meta_title: "JAECOO J8 SHS-P ARDIS — Harga & Spesifikasi | JAECOO Palembang",
    meta_description:
      "JAECOO J8 SHS-P ARDIS Rp865.000.000 OTR Palembang. 530 PS, 650 Nm, 0–100 km/jam 5,4 detik, EV range hingga 180 km, 7 penumpang.",
    published: true,
    updated_at: "2026-09-23T00:00:00Z",
  },
];

export function getModels(): ModelData[] {
  return MODELS.filter((m) => m.published);
}

export function getModelBySlug(slug: string): ModelData | undefined {
  return MODELS.find((m) => m.slug === slug && m.published);
}

export function getModelSlugs(): string[] {
  return MODELS.filter((m) => m.published).map((m) => m.slug);
}

export function getModelPrice(slug: string): number | null {
  const model = getModelBySlug(slug);
  return model?.default_variant.price_idr ?? null;
}
