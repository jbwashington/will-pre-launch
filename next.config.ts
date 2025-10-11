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

  // Webpack configuration for @xenova/transformers
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fix for @xenova/transformers in browser
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};

      // Prevent Node.js modules from being bundled for browser
      config.resolve.alias.fs = false;
      config.resolve.alias.path = false;
      config.resolve.alias.url = false;

      // Handle ONNX runtime for transformers.js
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
