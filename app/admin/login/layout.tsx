/**
 * Admin Login — Layout
 * Standalone layout — no sidebar, no auth check.
 * Must be separate from AdminLayout to avoid redirect loop.
 */

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
