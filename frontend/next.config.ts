import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Turbopack's dev filesystem cache (on by default since Next 16.1) persists
    // a resolve graph under .next/. On this machine the project directory was
    // previously copied/moved (see report), which left that cache pointing at
    // stale module data and made Turbopack fail to resolve its own "next"
    // package on every request. Disable it so a fresh graph is built each run.
    turbopackFileSystemCacheForDev: false,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
