import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@countdown/db", "@countdown/ui"],
};

export default nextConfig;
