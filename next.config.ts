import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    useLightningcss: false,
  },
};

export default nextConfig;
