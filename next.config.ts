import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // serverActions: true, // Enabled by default in Next.js 15
  },
  // Ensure we don't have hydration mismatches from extensions/providers
  reactStrictMode: false,
};

export default withNextIntl(nextConfig);
