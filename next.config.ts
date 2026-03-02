import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  turbopack: {
    // Ensure Turbopack uses the project root (silences multi-lockfile warning)
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
