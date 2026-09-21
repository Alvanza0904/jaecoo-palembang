/**
 * JAECOO Palembang — Admin Preview: Homepage Section
 *
 * Halaman ini di-load dalam iframe oleh HomepagePreviewFrame.
 * Menerima postMessage berisi { sectionId, data, device } dan
 * merender HomepageSectionRenderer secara real-time.
 *
 * Kenapa iframe?
 * - CSS media queries dievaluasi terhadap lebar iframe (390px / full),
 *   bukan lebar browser admin (biasanya >1024px).
 * - Preview Mobile benar-benar berperilaku seperti browser 390px.
 * - Tidak ada transform/scale yang mengacaukan font size dan layout.
 *
 * FIX 2026-09-21: Delegasi ke HomepagePreviewClient (satu implementasi,
 * tidak duplikat) agar logika postMessage terpusat dan maintainable.
 */

import { HomepagePreviewClient } from './preview-client'

export default function AdminPreviewHomepage() {
  return <HomepagePreviewClient />
}
