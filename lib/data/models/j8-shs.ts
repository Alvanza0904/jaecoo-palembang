import type { ModelData } from "@/lib/types/model";
import { MODEL_PRICES, emptyImage } from "./shared";

export const MODEL_J8_SHS: ModelData = {
  slug: "jaecoo-j8-shs",
  sort_order: 4,
  name: "JAECOO J8 SHS-P ARDIS",
  short_name: "J8 SHS-P ARDIS",
  tagline: "KEKUATAN YANG DISEMPURNAKAN.",
  description:
    "SUV flagship dengan Super Hybrid System, triple motor, dan AWD ARDIS. Tujuh tempat duduk, tujuh mode berkendara, tenaga gabungan 530 PS.",
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
      body: "Proporsi bodi yang tegas, grille yang kuat, lampu signature, dan velg 20 inci. Dari samping, J8 terasa lebih besar dan matang.",
    },
    design: {
      label: "Detail",
      heading: "Satu mobil,\nbanyak sudut.",
      body: "Grille signature, lampu depan yang tajam, velg 20 inci, dan detail PHEV di sisi bodi — setiap sudut punya karakter sendiri.",
    },
    profile: {
      label: "Karakter",
      heading: "Bukan cuma\ntampil gagah.",
    },
    interior: {
      label: "Interior",
      heading: "Kabin yang terasa\nseperti ruang sendiri.",
      body: "Tujuh penumpang dalam tiga baris. Baris depan fokus pengemudi, baris kedua lega untuk penumpang utama, baris ketiga siap dipakai saat dibutuhkan.",
    },
    cockpit: {
      label: "Kokpit",
      heading: "Kontrol yang\nmudah dijangkau.",
      body: "Mode berkendara dan informasi penting diletakkan dalam jangkauan. Saat jalan, yang dibutuhkan tetap mudah dibaca tanpa mengalihkan fokus terlalu lama.",
    },
    performance: {
      label: "Performa",
      heading: "Tenaga besar,\ntetap enak dipakai.",
      body: "530 PS dan 650 Nm terasa saat dibutuhkan, tetap tenang saat dipakai santai. 0–100 km/jam 5,4 detik tanpa terasa kasar.",
    },
    adas: {
      label: "Keselamatan",
      stat: "19",
      unit: "ADAS",
      heading: "Bantuan untuk\nperjalanan yang tenang.",
      body: "19 fitur ADAS, kamera 540° HD, dan 10 airbag — bantuan yang bekerja di latar belakang supaya perjalanan terasa lebih tenang.",
    },
    cta: {
      label: "JAECOO J8 · Palembang",
      heading: "Mau lihat J8\ndi Palembang?",
      body: "Tanya harga, promo, simulasi kredit, atau jadwalkan test drive JAECOO J8 SHS-P ARDIS.",
    },
    tech_intelligence: {
      label: "ARDIS",
      heading: "Tenaga besar\ntanpa kehilangan fleksibilitas.",
      body: "Triple motor dan AWD ARDIS menyesuaikan respons dengan kondisi jalan. Tujuh mode berkendara siap dipilih sesuai medan.",
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
    {
      id: "jaecoo-j8-ardis",
      name: "JAECOO J8 ARDIS",
      label: "2.0T",
      price_status: "official",
      price_idr: 719_900_000,
      price_display: "Rp719.900.000",
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
      "Triple motor dan AWD ARDIS menyesuaikan respons dengan medan. Tujuh mode berkendara, tenaga gabungan 530 PS, torsi 650 Nm.",
    features: [
      {
        id: "j8-shs-output",
        title: "530 PS dan 650 Nm",
        description:
          "Mesin 1.5L TGDI dipadu triple motor PHEV. 0–100 km/jam 5,4 detik, kecepatan maksimum 205 km/jam — tenaga yang terasa saat dibutuhkan.",
        tag: "Performa",
      },
      {
        id: "j8-shs-ardis",
        title: "AWD · 7 mode ARDIS",
        description:
          "AWD ARDIS dengan tujuh mode — dari jalan berubah, water crossing, sand, hingga trail — supaya traksi menyesuaikan medan.",
        tag: "ARDIS",
      },
      {
        id: "j8-shs-battery",
        title: "EV range hingga 180 km",
        description:
          "Baterai 34,46 kWh LFP, EV range hingga 180 km, total range klaim di atas 1.400 km. Ada V2L 6,6 kW dan regenerasi tiga level.",
        tag: "Hybrid",
      },
      {
        id: "j8-shs-safety",
        title: "19 ADAS · 10 airbag",
        description:
          "19 fitur ADAS, kamera 540° HD, dan 10 airbag. Suspensi CDC magnetic dengan setup double wishbone / multi-link, velg 20 inci.",
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
    {
      label: "J8 ARDIS — Dimensi & Berat",
      specs: [
        { label: "P × L × T", value: "4.820 × 1.930 × 1.710 mm" },
        { label: "Wheelbase", value: "2.820 mm" },
        { label: "Ground clearance", value: "190 mm" },
        { label: "Berat kosong", value: "1.929 kg" },
        { label: "Kapasitas", value: "6 penumpang" },
        { label: "Kapasitas bagasi", value: "738 L / maksimal 2.021 L" },
        { label: "Kapasitas tangki", value: "70 L" },
      ],
    },
    {
      label: "J8 ARDIS — Powertrain",
      specs: [
        { label: "Tipe sistem", value: "2.0L Turbo · 8-speed AT" },
        { label: "Tenaga", value: "245 HP" },
        { label: "Torsi", value: "385 Nm" },
        { label: "Transmisi", value: "8-speed AT" },
        { label: "0–100 km/jam", value: "8,8 detik" },
        { label: "Sistem penggerak", value: "AWD · ARDIS" },
        { label: "Driving Modes", value: "7 mode" },
      ],
    },
    {
      label: "J8 ARDIS — Suspensi & Handling",
      specs: [
        { label: "Suspensi depan", value: "CDC Magnetic Suspension · Double wishbone" },
        { label: "Suspensi belakang", value: "CDC Magnetic Suspension · Multi-link" },
        { label: "Rem depan / belakang", value: "Disc / Disc" },
        { label: "Ukuran ban", value: "265/45 R20" },
        { label: "Velg", value: "20 inci" },
      ],
    },
    {
      label: "J8 ARDIS — Keselamatan",
      specs: [
        { label: "Airbag", value: "10 airbag" },
        { label: "ADAS", value: "19 fitur" },
        { label: "Kamera", value: "540° HD" },
        { label: "ABS / EBD / ESC", value: "Standar" },
      ],
    },
    {
      label: "J8 ARDIS — Kenyamanan & Konektivitas",
      specs: [
        { label: "Wireless charging", value: "50 W" },
        { label: "Kursi baris 1", value: "Elektrik · Ventilasi · Pemanas" },
        { label: "Panoramic Sunroof", value: "Ada" },
      ],
    },
    {
      label: "J8 ARDIS — Warna",
      specs: [
        { label: "Stone Gray", value: "Tersedia" },
        { label: "Pristine White Two Tone", value: "Tersedia" },
        { label: "Lunar Silver", value: "Tersedia" },
        { label: "Jet Black", value: "Tersedia" },
      ],
    },
  ],
  meta_title: "JAECOO J8 Palembang | ARDIS & SHS-P ARDIS",
  meta_description:
    "JAECOO J8 di Palembang hadir sebagai J8 ARDIS bensin dan J8 SHS-P ARDIS plug-in hybrid, keduanya dengan AWD ARDIS. Lihat harga dan spesifikasi.",
  published: true,
  updated_at: "2026-09-23T00:00:00Z",
};
