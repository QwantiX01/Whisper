import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // for audio uploads
    },
  },
  allowedDevOrigins: ["95.47.56.14"],
};

export default nextConfig;
