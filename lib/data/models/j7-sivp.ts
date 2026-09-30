import type { ModelData } from "@/lib/types/model";
import { MODEL_PRICES, emptyImage, J7_SHS_SPECIFICATIONS } from "./shared";

export const MODEL_J7_SIVP: ModelData = {
  slug: "jaecoo-j7-sivp",
  sort_order: 3,
  name: "JAECOO J7 SHS-P SIVP",
  short_name: "J7 SIVP",
  tagline: "YOUR SUV. YOUR PERSONAL VALET.",
  description:
    "Super Intelligent Valet Parking: J7 bisa mencari tempat parkir, memarkir sendiri, lalu datang kembali saat dipanggil — tanpa pengemudi di dalam mobil.",
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
      heading: "SUV Anda.\nValet pribadinya.",
      body: "Cukup pilih area parkir, turun, lalu biarkan J7 bekerja. Sistem mencari slot, memarkir, dan bisa dipanggil kembali saat Anda siap.",
    },
    design: {
      label: "Cara kerja",
      heading: "Cari.\nParkir.\nTinggalkan.",
      body: "Dari smartphone, pilih zona parkir lalu turun. Sistem mendeteksi pejalan kaki dan hambatan, lalu manuver sendiri sampai posisi parkir.",
    },
    profile: {
      label: "Persepsi",
      heading: "Persepsi yang\nmembaca sekitar.",
    },
    interior: {
      label: "Kendali",
      heading: "Pantau dari\ngenggaman.",
      body: "Proses parkir bisa dipantau real-time dari aplikasi. Empat langkah sederhana: pilih area, deteksi hambatan, pantau, lalu biarkan J7 selesai.",
    },
    cockpit: {
      label: "Keputusan",
      heading: "Melihat.\nMemahami.\nBertindak.",
      body: "Domain controller memproses data sensor secara bersamaan, menghitung jalur, lalu mengeksekusi kemudi, gas, dan rem tanpa intervensi pengemudi.",
    },
    performance: {
      label: "Platform",
      heading: "Plug-in hybrid\nyang tenang dipakai.",
      body: "Di balik SIVP, platform hybrid-nya sama nyaman dipakai: pure EV untuk kota, hybrid untuk perjalanan lebih jauh.",
    },
    adas: {
      label: "Persepsi",
      stat: "27",
      unit: "SENSOR",
      heading: "Dibangun untuk\nmembaca sekitar.",
      body: "27 sensor dan kamera, LiDAR 128-channel dToF, radar, plus kamera 540° — paket persepsi khusus untuk Super Intelligent Valet Parking.",
    },
    cta: {
      label: "JAECOO J7 SIVP · Palembang",
      heading: "Siap mencoba\nSIVP?",
      body: "Harga resmi J7 SIVP belum diumumkan di halaman referensi — status pre-book. Hubungi Alvan untuk informasi dan test drive di Palembang.",
    },
    tech_intelligence: {
      label: "SIVP",
      heading: "Cerdas di\nruang sempit.",
      body: "Basement sempit, tikungan ketat, atau pilar yang menyempit justru jadi area kerja SIVP. Di ruang terbuka, sistem tetap bekerja dengan tenang.",
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
      "J7 memetakan lingkungan, memilih jalur, lalu memarkir sendiri. Platform-nya tetap plug-in hybrid; yang membedakan di halaman ini adalah Super Intelligent Valet Parking.",
    features: [
      {
        id: "j7-sivp-see",
        title: "27 sensor dan kamera",
        description:
          "Sensor dan kamera memetakan sekitar secara real-time. LiDAR 128-channel dToF mengukur jarak, radar membaca objek, kamera 540° memberi konteks visual.",
        tag: "Persepsi",
      },
      {
        id: "j7-sivp-spaces",
        title: "Ruang sempit maupun terbuka",
        description:
          "Basement sempit, tikungan ketat, dan pilar ditangani dengan lebih presisi. Di ruang terbuka, sistem tetap bekerja tanpa perlu setting khusus.",
        tag: "SIVP",
      },
      {
        id: "j7-sivp-steps",
        title: "Pilih, deteksi, pantau, parkir",
        description:
          "Tentukan zona parkir dari smartphone, lalu turun. Sistem mendeteksi objek bergerak dan diam, prosesnya dipantau dari aplikasi sampai parkir selesai.",
        tag: "Alur",
      },
      {
        id: "j7-sivp-platform",
        title: "Platform SHS-P",
        description:
          "Platform hybrid sama dengan J7 SHS: baterai 18,3 kWh, EV range 100 km, jarak kombinasi 1.300 km, dan pengisian AC 7,7 kW.",
        tag: "Platform",
      },
    ],
  },
  specifications: J7_SHS_SPECIFICATIONS,
  meta_title: "JAECOO J7 SIVP Palembang | Smart Valet Parking & Spesifikasi",
  meta_description:
    "JAECOO J7 SIVP di Palembang menambahkan Smart Valet Parking pada platform hybrid J7. Lihat cara kerjanya dan spesifikasi lengkapnya.",
  published: true,
  updated_at: "2026-09-23T00:00:00Z",
};
