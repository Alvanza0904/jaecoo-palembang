/**
 * JAECOO Palembang — Admin Shell (Client Component)
 * STEP 5A: Dashboard navigation + logout
 *
 * Renders sidebar nav + top bar.
 * Logout handled client-side via Supabase auth.signOut().
 */

'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import styles from './admin.module.css'

interface AdminUser {
  email: string
  id: string
}

interface AdminShellProps {
  user: AdminUser
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◈' },
  { href: '/admin/models', label: 'Models', icon: '◉' },
  { href: '/admin/media', label: 'Media', icon: '◈' },
  { href: '/admin/promo', label: 'Promo', icon: '◈' },
  { href: '/admin/news', label: 'News', icon: '◈' },
  { href: '/admin/gallery', label: 'Gallery', icon: '◈' },
  { href: '/admin/leads', label: 'Leads', icon: '◈' },
  { href: '/admin/settings', label: 'Settings', icon: '◈' },
]

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleLogout() {
    startTransition(async () => {
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    })
  }

  const initials = user.email.substring(0, 2).toUpperCase()

  return (
    <div className={styles.shell}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Brand */}
        <div className={styles.sidebarBrand}>
          <div className={styles.brandMark}>J</div>
          <div>
            <div className={styles.brandName}>JAECOO</div>
            <div className={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <div className={styles.goldDivider} />

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Admin navigation">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.href !== '/admin' && item.href !== '/admin/models' && item.href !== '/admin/media' && (
                      <span className={styles.navBadge}>Soon</span>
                    )}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>{initials}</div>
            <div className={styles.userDetails}>
              <div className={styles.userEmail}>{user.email}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className={styles.logoutBtn}
            aria-label="Logout"
          >
            {isPending ? '...' : '→'}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className={styles.main}>
        {/* Top bar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <span />
            <span />
            <span />
          </button>

          <div className={styles.topbarRight}>
            <div className={styles.statusDot} aria-label="Connected" title="Supabase connected" />
            <span className={styles.statusLabel}>Live</span>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  )
}
