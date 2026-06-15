import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@countdown/db"],
};

export default nextConfig;
