import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep browser-test builds separate from a running development server.
  distDir: process.env.PLAYWRIGHT_TEST === "1" ? ".next-e2e" : ".next",
  webpack(config, { dev }) {
    // Polling keeps development reliable on hosts with limited file watchers.
    if (dev) config.watchOptions = { ...config.watchOptions, poll: 1000, aggregateTimeout: 300 };
    return config;
  },
};

export default nextConfig;
