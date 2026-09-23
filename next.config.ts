import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@opentelemetry/api"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
