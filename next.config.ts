import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: true,

  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
