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
    // useCache: true,
    // cacheComponents: true,
  },
  // Externalize packages for server components (moved from experimental)
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  /* config options here */
};

export default nextConfig;
