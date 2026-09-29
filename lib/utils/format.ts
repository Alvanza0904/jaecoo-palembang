/**
 * JAECOO Palembang — Formatting Utilities
 *
 * Dates and currency are formatted without relying on the runtime timezone
 * or ICU differences between Node (SSR) and the browser. A mismatch here
 * causes React hydration error #418.
 */

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/**
 * Format IDR currency.
 * e.g. 354900000 → "Rp354.900.000"
 */
export function formatIDR(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Rp${sign}${grouped}`;
}

/**
 * Format a date string in Asia/Jakarta, identical on the server and every client.
 * e.g. "2025-01-15" → "15 Januari 2025"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);

  const day = Number(parts.find((part) => part.type === "day")?.value ?? "");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const monthName = MONTHS_ID[month - 1] ?? "";
  return `${day} ${monthName} ${year}`.trim();
}

/** Calendar year in Asia/Jakarta, stable across SSR and the browser. */
export function currentYearJakarta(now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(now);
}