const withSerwist = require('@serwist/next').default;
console.log(withSerwist)

const withPWA = withSerwist({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  scope: '/',
  swUrl: '/sw.js',
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        { key: 'Service-Worker-Allowed', value: '/' },
      ],
    },
  ],
};

module.exports = withPWA(nextConfig);