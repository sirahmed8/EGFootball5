import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: process.env.VERCEL !== '1'
  }
};

export default withNextIntl(nextConfig);
