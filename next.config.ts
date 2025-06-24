import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'] // Only lint src directory
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
