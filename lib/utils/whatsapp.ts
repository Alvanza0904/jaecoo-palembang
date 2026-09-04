/**
 * JAECOO Palembang — WhatsApp Utility
 *
 * Single source of truth for WhatsApp number and URL generation.
 * Never write the phone number directly in components.
 */

import type { LeadContext } from "@/lib/types/lead";

export const WHATSAPP_NUMBER = "6285183145926";
export const SALES_NAME = "Alvan";

/**
 * Build a WhatsApp URL with pre-filled message context.
 */
export function buildWhatsAppUrl(context: LeadContext, customMessage?: string): string {
  const message = customMessage ?? buildDefaultMessage(context);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function buildDefaultMessage(context: LeadContext): string {
  const modelPart = context.model
    ? `JAECOO ${context.model}`
    : "kendaraan JAECOO";

  return `Halo ${SALES_NAME}, saya tertarik dengan ${modelPart}. Saya mendapatkan informasi dari website JAECOO Palembang dan ingin mendapatkan informasi lebih lanjut.`;
}
