/**
 * Shared model constants for JAECOO Palembang static fallback.
 */
import type { ModelSpecCategory } from "@/lib/types/model";

export const MODEL_PRICES = {
  "jaecoo-j5-ev": 354_900_000,
  "jaecoo-j7-shs": 534_900_000,
  "jaecoo-j8-shs": 865_000_000,
} as const;

export const emptyImage = (alt: string) => ({ desktop: undefined, alt });

/** Specs shared by J7 SHS and J7 SIVP. */
export const J7_SHS_SPECIFICATIONS: ModelSpecCategory[] = [
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
