/**
 * Editorial copy for the public-facing JAECOO Palembang experience.
 * Product facts remain in the model/CMS data; this file controls the
 * storytelling layer so each model page has a distinct voice and flow.
 */

export type ModelEditorial = {
  intro: string;
  exterior: { heading: string; body: string };
  detail: { heading: string; body: string };
  presence: { heading: string; body: string };
  interior: { heading: string; body: string };
  cockpit: { heading: string; body: string };
  performance: { heading: string; body: string };
  safety: { heading: string; body: string };
  colors: { heading: string; body: string };
  specs: { heading: string; body: string };
  cta: { heading: string; body: string };
};

export const MODEL_EDITORIAL: Record<string, ModelEditorial> = {
  "jaecoo-j5-ev": {
    intro: "SUV listrik premium dengan proporsi tegas, kabin modern, dan karakter yang terasa siap untuk keseharian.",
    exterior: {
      heading: "Electric. With SUV attitude.",
      body: "J5 membawa bahasa desain JAECOO ke era elektrifikasi: proporsi yang tegas, permukaan bodi yang clean, dan detail yang memberi karakter tanpa terlihat berlebihan.",
    },
    detail: {
      heading: "Every detail, deliberately bold.",
      body: "Dari signature lighting hingga garis bodi dan detail roda, setiap elemen bekerja membentuk siluet J5 yang mudah dikenali dari kejauhan.",
    },
    presence: {
      heading: "Made to stand apart.",
      body: "Siluet SUV yang proporsional memberi J5 kehadiran yang kuat, sekaligus tetap terasa ringan dan modern saat digunakan di dalam kota.",
    },
    interior: {
      heading: "A cabin that keeps up.",
      body: "Ruang kabin J5 dirancang untuk perjalanan sehari-hari yang lebih nyaman: modern, praktis, dan terhubung dengan kebutuhan pengemudi serta penumpang.",
    },
    cockpit: {
      heading: "Everything within reach.",
      body: "Tata letak kokpit dibuat intuitif agar informasi penting dan fungsi berkendara terasa mudah dijangkau tanpa mengganggu fokus di jalan.",
    },
    performance: {
      heading: "Electric power, naturally responsive.",
      body: "Motor listrik menghadirkan respons instan dan karakter berkendara yang halus—cocok untuk ritme kota maupun perjalanan yang lebih jauh.",
    },
    safety: {
      heading: "Confidence in every direction.",
      body: "Teknologi bantuan pengemudi membantu memperluas awareness di sekitar kendaraan, memberi dukungan tambahan saat berkendara dan bermanuver.",
    },
    colors: {
      heading: "Your J5. Your expression.",
      body: "Pilihan warna mempertegas karakter J5—dari tampilan yang understated hingga nuansa yang lebih berani.",
    },
    specs: {
      heading: "J5, clearly defined.",
      body: "Lihat data utama J5 EV, harga OTR Palembang, dan detail spesifikasi sebelum menentukan pilihan Anda.",
    },
    cta: {
      heading: "Ready to make the switch?",
      body: "Kenali JAECOO J5 EV lebih dekat bersama Alvan. Konsultasikan harga, unit, simulasi kredit, dan jadwal test drive di Palembang.",
    },
  },
  "jaecoo-j7-shs": {
    intro: "Super Hybrid SUV yang memadukan tenaga listrik, mesin bensin, dan teknologi pintar untuk menghadirkan fleksibilitas berkendara dalam satu karakter yang matang.",
    exterior: {
      heading: "A stronger expression of SUV.",
      body: "J7 SHS membawa proporsi SUV yang tegas dengan detail modern yang memberi kesan kokoh, premium, dan siap menghadapi perjalanan yang lebih panjang.",
    },
    detail: {
      heading: "Purpose in every line.",
      body: "Detail pencahayaan, grille, roda, dan permukaan bodi disusun untuk menciptakan identitas yang kuat tanpa kehilangan keseimbangan desain.",
    },
    presence: {
      heading: "Presence with purpose.",
      body: "Ground clearance dan postur SUV memberi J7 SHS kepercayaan diri di berbagai kondisi jalan, sementara desainnya tetap cocok untuk mobilitas perkotaan.",
    },
    interior: {
      heading: "Premium where it matters.",
      body: "Kabin J7 SHS memadukan ruang, material, teknologi, dan posisi duduk yang nyaman untuk perjalanan harian maupun perjalanan jauh.",
    },
    cockpit: {
      heading: "Technology, naturally integrated.",
      body: "Informasi kendaraan dan fungsi digital ditempatkan dalam antarmuka yang mudah dipahami, menjaga pengalaman berkendara tetap fokus dan intuitif.",
    },
    performance: {
      heading: "Two worlds. One powertrain.",
      body: "Super Hybrid System memungkinkan tenaga listrik dan mesin bekerja sesuai kebutuhan—senyap dan responsif di mode EV, sekaligus fleksibel untuk perjalanan jauh.",
    },
    safety: {
      heading: "Awareness built in.",
      body: "Rangkaian ADAS J7 SHS dirancang untuk membantu pengemudi membaca situasi di sekitar kendaraan dan memberi dukungan pada momen yang tepat.",
    },
    colors: {
      heading: "Choose your character.",
      body: "Warna eksterior memberi ruang untuk mengekspresikan karakter J7 SHS—dari tampilan elegan hingga nuansa yang lebih berani.",
    },
    specs: {
      heading: "Everything, clearly defined.",
      body: "Lihat harga OTR Palembang dan data teknis J7 SHS untuk memahami powertrain, dimensi, kenyamanan, dan teknologi yang dibawanya.",
    },
    cta: {
      heading: "Experience the Super Hybrid.",
      body: "Jadwalkan test drive JAECOO J7 SHS di Palembang dan rasakan sendiri perpaduan tenaga listrik, efisiensi, dan karakter SUV-nya.",
    },
  },
  "jaecoo-j8-shs": {
    intro: "Flagship JAECOO yang mempertemukan performa tinggi, kemewahan, dan kecerdasan teknologi dalam satu SUV premium.",
    exterior: {
      heading: "Designed to command attention.",
      body: "Proporsi besar, signature grille, pencahayaan premium, dan stance yang tegas membentuk kehadiran J8 yang kuat tanpa perlu berlebihan.",
    },
    detail: {
      heading: "Luxury lives in the details.",
      body: "Setiap garis, permukaan, dan detail eksterior dirancang untuk memperlihatkan kualitas flagship J8 dari dekat maupun dari kejauhan.",
    },
    presence: {
      heading: "Commanding from every angle.",
      body: "J8 membawa proporsi flagship yang terasa mantap di jalan, dengan desain yang menyatukan kekuatan SUV dan ketenangan sebuah kendaraan premium.",
    },
    interior: {
      heading: "A sanctuary on the road.",
      body: "Kabin J8 dirancang sebagai ruang perjalanan premium—lapang, nyaman, dan dipenuhi detail yang membuat perjalanan jauh terasa lebih istimewa.",
    },
    cockpit: {
      heading: "Intelligence, beautifully integrated.",
      body: "Kokpit J8 menyatukan informasi, kontrol, dan konektivitas dalam pengalaman digital yang terasa modern tanpa menghilangkan fokus pada berkendara.",
    },
    performance: {
      heading: "Power at flagship level.",
      body: "Pada J8 SHS-P ARDIS, tenaga gabungan 530 PS dan torsi 650 Nm berpadu dengan triple motor dan ARDIS AWD untuk menghasilkan respons yang kuat dan percaya diri.",
    },
    safety: {
      heading: "See more. Know more.",
      body: "Teknologi ADAS, kamera 540°, dan sistem intelligent driving membantu J8 membangun awareness yang lebih menyeluruh terhadap lingkungan di sekitarnya.",
    },
    colors: {
      heading: "A flagship in your color.",
      body: "Pilihan warna J8 memperkuat karakter flagship—dari nuansa gelap yang tegas hingga warna terang yang menonjolkan detail desainnya.",
    },
    specs: {
      heading: "Every detail, clearly defined.",
      body: "Lihat harga OTR Palembang dan spesifikasi lengkap J8 untuk membandingkan powertrain, performa, dimensi, teknologi, dan perlengkapannya.",
    },
    cta: {
      heading: "Ready to experience the flagship?",
      body: "Hubungi Alvan untuk mengenal JAECOO J8 lebih dekat, mendapatkan informasi unit dan harga, atau menjadwalkan test drive di Palembang.",
    },
  },
};

export function getModelEditorial(slug: string): ModelEditorial {
  return MODEL_EDITORIAL[slug] ?? MODEL_EDITORIAL["jaecoo-j5-ev"];
}
