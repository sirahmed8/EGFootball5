import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Only use static export when building for Firebase locally
  output: process.env.FIREBASE_BUILD === '1' ? 'export' : undefined,
  images: {
    unoptimized: true
  }
};

export default withNextIntl(nextConfig);
