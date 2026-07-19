import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server actions allowed by default in Next.js 16
  // Experimental features needed for the app
  serverExternalPackages: ["bcryptjs"],
  // Standalone output required for Docker deployment
  output: "standalone",
  typescript: {
    // Don't block dev on type errors during rapid iteration
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
