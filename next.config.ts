// next.config.js
const { withSerwist } = require('@serwist/next').default;

const withPWA = withSerwist({
  // Source service worker file you author
  swSrc: 'src/app/sw.ts',
  // Compiled output — must live in /public so the browser can fetch it
  swDest: 'public/sw.js',
  // Disable in development — stale cache makes hot reload painful
  disable: process.env.NODE_ENV === 'development',
  scope: '/',
  swUrl: '/sw.js',
  reloadOnOnline: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      // The service worker file itself must never be cached by the browser
      // It must always be fetched fresh so updates deploy immediately
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
  ],
}

module.exports = withPWA(nextConfig)
