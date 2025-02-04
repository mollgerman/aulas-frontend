import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // This disables ESLint during builds
  },
  typescript: {
    ignoreBuildErrors: true, // This skips type-checking errors during builds
  },
};

export default nextConfig;
