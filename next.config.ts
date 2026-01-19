import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Ensure Turbopack uses the project root (silences multi-lockfile warning)
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
