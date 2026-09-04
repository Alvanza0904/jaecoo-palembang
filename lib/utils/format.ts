/**
 * JAECOO Palembang — Formatting Utilities
 */

/**
 * Format IDR currency.
 * e.g. 354900000 → "Rp354.900.000"
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("Rp\u00a0", "Rp");
}

/**
 * Format a date string to Indonesian locale.
 * e.g. "2025-01-15" → "15 Januari 2025"
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
