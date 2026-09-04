/**
 * JAECOO Palembang — Admin Layout
 *
 * Protected area — noindex.
 * Auth will be added via Supabase in a later phase.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin — JAECOO Palembang",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100svh", background: "#f9f8f7" }}>
      {/* Admin shell — navigation and auth will be added in Phase: Admin */}
      {children}
    </div>
  );
}
