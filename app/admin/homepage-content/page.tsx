/**
 * JAECOO Palembang — Admin: Homepage Content (Legacy Route)
 *
 * Step 8.7: Route ini di-keep agar tidak breaking change,
 * namun sekarang redirect ke unified editor di /admin/homepage.
 *
 * File UnifiedEditor.tsx, ContentEditor.tsx, actions.ts, module CSS
 * di folder ini dibiarkan di filesystem tapi tidak diimpor lagi.
 */
import { redirect } from 'next/navigation'

export default function AdminHomepageContentPage() {
  redirect('/admin/homepage')
}
