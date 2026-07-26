import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Use static export by default for static production builds, unless running dev server or Vercel
  output: process.env.NODE_ENV === 'development' || process.env.VERCEL === '1' ? undefined : 'export',
  trailingSlash: true,
  images: {
    unoptimized: process.env.VERCEL !== '1'
  }
};

export default withNextIntl(nextConfig);
