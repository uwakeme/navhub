import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude @prisma/client from bundling (moved from experimental in Next.js 16)
  serverExternalPackages: ['@prisma/client', 'prisma'],
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default withNextIntl(nextConfig);
