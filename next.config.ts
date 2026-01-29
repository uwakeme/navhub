import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externalize heavy packages to reduce SSR bundle size
  serverExternalPackages: [
    '@prisma/client',
    'prisma',
    'pg',
    '@prisma/adapter-pg',
    '@auth/prisma-adapter',
    'next-auth',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withNextIntl(nextConfig);
