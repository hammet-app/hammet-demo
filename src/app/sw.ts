// app/sw.ts
// This file is compiled by Serwist into public/sw.js at build time.
// It runs in the browser's service worker context — not in React, not in Node.
// Do not import React or Next.js here.

/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry } from '@serwist/precaching'
import { installSerwist } from '@serwist/sw'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from '@serwist/strategies'
import { ExpirationPlugin } from '@serwist/expiration'
import { BackgroundSyncPlugin } from '@serwist/background-sync'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

// ── 1. PRECACHE (App Shell) ───────────────────────────────────────────────────
// Serwist automatically injects the list of built assets into __SW_MANIFEST.
// These are cached on install — the app shell is always available offline.
installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,           // activate new SW immediately on update
  clientsClaim: true,          // take control of all open tabs immediately
  navigationPreload: false,    // disabled — we're fully offline-first
  runtimeCaching: [

    /// ── 2. LESSON PAGE ─────────────────────────────────────────────────
    // Strategy: NetworkFirst (fallback to cache)
    // Ensures lessons page loads even without network
    {
      matcher: ({ request }) => request.mode === 'navigate',
      handler: new NetworkFirst({
        cacheName: 'pages',
        networkTimeoutSeconds: 5,
      }),
    },

    // ── 3. LESSON MODULE JSON ─────────────────────────────────────────────────
    // Strategy: StaleWhileRevalidate
    // Serve instantly from cache. Revalidate in background.
    // Students never wait for network to see their lessons.
    {
      matcher: /^https?:\/\/.*\/api\/v1\/modules/,
      handler: new StaleWhileRevalidate({
        cacheName: 'lesson-modules',
        plugins: [
          new ExpirationPlugin({
            // Keep up to 200 modules cached (full term = ~36 modules for SSS1)
            maxEntries: 200,
            // Modules valid for 7 days — force refresh on curriculum update
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },

    // ── 4. STUDENT SUBMISSIONS (writes) ──────────────────────────────────────
    // Strategy: Background Sync
    // POST requests to /api/v1/sync/submissions that fail (no internet)
    // are queued and replayed automatically when connectivity restores.
    // This is the core offline write contract.
    {
      matcher: /^https?:\/\/.*\/api\/v1\/sync\/submissions/,
      method: 'POST',
      handler: new NetworkFirst({
        cacheName: 'submissions-sync',
        plugins: [
          new BackgroundSyncPlugin('submissions-queue', {
            maxRetentionTime: 7 * 24 * 60, // retry for up to 7 days (minutes)
          }),
        ],
      }),
    },

    // ── 5. API CALLS (general) ────────────────────────────────────────────────
    // Strategy: NetworkFirst with cache fallback
    // Try the network. If it fails (power cut, no data), serve cached response.
    // 10 second timeout before falling back — generous for Nigerian 3G.
    {
      matcher: /^https?:\/\/.*\/api\/v1\//,
      handler: new NetworkFirst({
        cacheName: 'api-responses',
        networkTimeoutSeconds: 10,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          }),
        ],
      }),
    },

    // ── 6. SUPABASE STORAGE (student artefact files) ─────────────────────────
    // Strategy: CacheFirst
    // Once a file is cached, serve it immediately without hitting the network.
    // Student uploads don't change — safe to cache aggressively.
    {
      matcher: /^https:\/\/.*\.supabase\.co\/storage\//,
      handler: new CacheFirst({
        cacheName: 'student-artefacts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },

    // ── 7. GOOGLE FONTS ───────────────────────────────────────────────────────
    // Strategy: CacheFirst
    // Fonts never change once loaded — cache them permanently.
    // This ensures typography renders correctly offline.
    {
      matcher: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
      handler: new CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          }),
        ],
      }),
    },

    // ── 8. NEXT.JS DEFAULT CACHE ─────────────────────────────────────────────
    // Serwist's built-in defaults handle _next/static assets (JS, CSS chunks).
    // These are already fingerprinted by Next.js so CacheFirst is safe.
    ...defaultCache,
  ],
})
