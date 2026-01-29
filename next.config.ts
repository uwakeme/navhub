import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output for smaller deployment bundles
  output: 'standalone',
  // Externalize heavy packages to reduce SSR bundle size
  // Note: next-auth cannot be externalized as it imports from next/server
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'pg',
    '@prisma/adapter-pg',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withNextIntl(nextConfig);
