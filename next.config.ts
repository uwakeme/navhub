import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure Node.js runtime for API routes (required for Prisma)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Use Node.js runtime for server components (required for Prisma)
    // Exclude @prisma/client from bundling to avoid Node.js built-in module issues
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
};

export default withNextIntl(nextConfig);
