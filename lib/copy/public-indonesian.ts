/**
 * Replaces known English marketing lines that are still stored in CMS.
 * Official names (JAECOO, ARDIS, SHS, SIVP, LiDAR, AWD) are left untouched
 * unless the whole string is a marketing slogan.
 */
const PHRASES: Record<string, string> = {
  "this is the real suv.": "SUV listrik untuk sehari-hari.",
  "your suv. your personal valet.": "Valet pribadi untuk perjalanan Anda.",
  "from classic, beyound classic": "SUV unggulan dengan AWD ARDIS.",
  "from classic, beyond classic": "SUV unggulan dengan AWD ARDIS.",
  "explore now": "Lihat J5 EV",
  "form classic beyond classic": "JAECOO Palembang",
  "unrivaled experience": "Satu lini. Tiga karakter.",
  "designed for the fearless.": "JAECOO J5 EV, J7 SHS, J7 SIVP, dan J8 ARDIS untuk kebutuhan yang berbeda.",
  "teknologi masa depan": "Teknologi yang terasa saat dipakai",
  "test drive mobil impianmu.": "Jadwalkan test drive di Palembang.",
  "jaecoo palembang | official dealer": "JAECOO Palembang | SUV Listrik & Hybrid",
  "smart where it matters.": "Teknologi yang terasa dekat.",
  "crafted in every detail.": "Detail yang dikerjakan rapi.",
  "sculpted in motion.": "Garis yang terasa bergerak.",
  "intelligence at your fingertips.": "Kontrol di ujung jari.",
  "super hybrid. super experience.": "Super Hybrid. Nyaman dipakai.",
  "intelligence, in every detail.": "Detail yang terasa pintar.",
  "find. park. leave.": "Cari. Parkir. Tinggalkan.",
  "intelligence that sees.": "Persepsi yang membaca sekitar.",
  "see. understand. act.": "Melihat. Memahami. Bertindak.",
  "plug-in hybrid. intelligent by design.": "Plug-in hybrid yang tenang dipakai.",
  "built to perceive.": "Dibangun untuk membaca sekitar.",
  "ready to experience sivp?": "Siap mencoba SIVP?",
  "intelligence in confined spaces.": "Cerdas di ruang sempit.",
  "built around intelligence": "Teknologi yang bekerja dekat",
};

function keyOf(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function localizePhrase(value: string | undefined | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return value;
  return PHRASES[keyOf(trimmed)] ?? value;
}
