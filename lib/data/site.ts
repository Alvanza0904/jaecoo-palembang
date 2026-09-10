/**
 * Public site settings — transitional configuration layer.
 *
 * Keep global contact/dealer identity in one place until a dedicated
 * Supabase site-settings schema is approved. Components should consume this
 * object instead of duplicating values. No Admin UI is implied by this file.
 */

export const SITE_SETTINGS = {
  brandName: "JAECOO Palembang",
  dealerName: "Dealer Resmi Omoda Jaecoo Palembang",
  salesName: "Alvan",
  whatsappNumber: "6285183145926",
  instagram: "https://instagram.com/jaecoopalembang",
  tiktok: "https://tiktok.com/@jaecoopalembang",
  facebook: "https://facebook.com/jaecoopalembang",
  dealerAddress: {
    street: "Komp. Graha Maju, Jl. Mayor HM. Rasyad Nawawi No.506 - 509",
    locality: "9 Ilir, Kec. Ilir Tim. II, Kota Palembang",
    region: "Sumatera Selatan",
    postalCode: "30113",
  },
} as const;
