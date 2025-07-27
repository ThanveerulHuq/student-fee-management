import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['src'] // Only lint src directory
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
