import type { NextConfig } from "next";

const isCloudflarePagesBuild =
  process.env.CLOUDFLARE_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isCloudflarePagesBuild
    ? { output: "export" }
    : {}),
  images: {
    unoptimized: true,
  },
  experimental: {
    useLightningcss: false,
  },
};

export default nextConfig;
