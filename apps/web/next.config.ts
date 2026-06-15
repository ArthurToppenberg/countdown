import type { NextConfig } from "next";

const requireEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

requireEnv("RESEND_FROM_EMAIL");

const nextConfig: NextConfig = {
  transpilePackages: ["@countdown/db", "@countdown/ui"],
};

export default nextConfig;
