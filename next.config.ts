import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**', // Allows any path on lh3.googleusercontent.com
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
    // useCache: true,
    // cacheComponents: true,
  },
  // Avoid externalizing puppeteer-core so that chromium helper libs are fully traced.
  // (We already keep @sparticuz/chromium bundled via static import.)
  // serverExternalPackages: [],
};

export default nextConfig;
