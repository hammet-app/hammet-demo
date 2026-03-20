// app/layout.tsx
// Replace your existing layout.tsx with this.
// Adds the manifest link, theme-color, and apple-touch meta tags
// that iOS and Android need to treat the app as installable.

import type { Metadata, Viewport } from 'next'
import './globals.css'
import { SWRegister } from '@/components/pwa'

export const metadata: Metadata = {
  title: 'AI Studies by Hammet',
  description: 'AI literacy curriculum for Nigerian secondary schools',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI Studies',
    // iOS does not read icons from manifest.json
    // You must declare them explicitly here
    startupImage: [
      { url: '/icons/icon-512x512.png' },
    ],
  },
  icons: {
    // Android reads these
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    // iOS reads this
    apple: [
      { url: '/icons/icon-192x192.png' },
    ],
  },
}

// theme-color must be in viewport export for Next.js 14+
export const viewport: Viewport = {
  themeColor: '#3B0764',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  // Prevents zoom on input focus — important for lesson forms on mobile
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body> <SWRegister /> {children}</body>
    </html>
  )
}
