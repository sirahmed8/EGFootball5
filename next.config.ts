import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Use static export by default (for Firebase), unless running on Vercel
  output: process.env.VERCEL === '1' ? undefined : 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default withNextIntl(nextConfig);
