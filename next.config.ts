import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [],
  },
  // experimental.optimizeCss dihapus — bug dengan route groups Next.js 15
};

export default nextConfig;
