'use client'

// components/pwa/InstallPrompt.tsx
//
// Handles the "Add to Home Screen" experience on both platforms:
//
// Android: The browser fires a `beforeinstallprompt` event.
//          We intercept it, hide the default banner, and show our own
//          branded prompt at the right moment (after the student has
//          loaded their first lesson).
//
// iOS Safari: Does not fire beforeinstallprompt — ever.
//             We detect iOS and show manual instructions instead.
//             "Tap the Share button, then Add to Home Screen."

import { useEffect, useState } from 'react'
import styles from './InstallPrompt.module.css'

type Platform = 'android' | 'ios' | 'other'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iphone|ipad|ipod/i.test(ua)) return 'ios'
  return 'other'
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS standalone check
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  )
}

export default function InstallPrompt() {
  const [platform, setPlatform] = useState<Platform>('other')
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return

    // Don't show if user dismissed it before (persisted in localStorage)
    if (localStorage.getItem('pwa-install-dismissed') === 'true') return

    const p = detectPlatform()
    setPlatform(p)

    if (p === 'android') {
      // Intercept the native install prompt
      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e)
        // Wait 30 seconds before showing — let the student load at least one lesson
        setTimeout(() => setShowPrompt(true), 30_000)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    if (p === 'ios') {
      // Show iOS instructions after 30 seconds
      const timer = setTimeout(() => setShowPrompt(true), 30_000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return
    // Trigger the native install dialog
    ;(deferredPrompt as { prompt: () => void }).prompt()
    setShowPrompt(false)
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setDismissed(true)
    // Remember dismissal for this session only
    // Use localStorage.setItem('pwa-install-dismissed', 'true') to persist
  }

  if (!showPrompt || dismissed) return null

  // ── Android install banner ───────────────────────────────────────────────
  if (platform === 'android') {
    return (
      <div className={styles.banner}>
        <div className={styles.bannerIcon}>
          <img src="/icons/icon-72x72.png" alt="AI Studies" width={36} height={36} />
        </div>
        <div className={styles.bannerText}>
          <p className={styles.bannerTitle}>Add to Home Screen</p>
          <p className={styles.bannerMeta}>Use AI Studies offline, like an app</p>
        </div>
        <div className={styles.bannerActions}>
          <button className={styles.btnInstall} onClick={handleAndroidInstall}>Install</button>
          <button className={styles.btnDismiss} onClick={handleDismiss}>Not now</button>
        </div>
      </div>
    )
  }

  // ── iOS manual instructions ──────────────────────────────────────────────
  if (platform === 'ios') {
    return (
      <div className={styles.iosSheet}>
        <div className={styles.iosHandle} />
        <p className={styles.iosTitle}>Add AI Studies to your Home Screen</p>
        <p className={styles.iosMeta}>This lets you open the app without a browser, and use it offline during class.</p>
        <ol className={styles.iosList}>
          <li>Tap the <strong>Share</strong> button at the bottom of Safari</li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
          <li>Tap <strong>Add</strong> in the top right corner</li>
        </ol>
        <button className={styles.iosDismiss} onClick={handleDismiss}>Got it</button>
      </div>
    )
  }

  return null
}
