import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports for Electron (temporarily disabled)
  // output: 'export',
  // trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
