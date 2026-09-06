/**
 * JAECOO Palembang — Admin Login Page
 * STEP 5A: Authentication
 *
 * Email + password login via Supabase Auth.
 * Server Action handles auth — no client-side secret exposure.
 */

'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import styles from './login.module.css'

export default function AdminLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Email atau password salah.')
        return
      }

      router.push(next)
      router.refresh()
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <span className={styles.brandMark}>J</span>
          <div>
            <div className={styles.brandName}>JAECOO Palembang</div>
            <div className={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <div className={styles.goldLine} />

        <h1 className={styles.heading}>Masuk ke Dashboard</h1>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="admin@example.com"
              disabled={isPending}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>

          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={isPending || !email || !password}
          >
            {isPending ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className={styles.note}>
          Akses terbatas. Hubungi administrator untuk mendapatkan akun.
        </p>
      </div>
    </div>
  )
}
