import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // for audio uploads
    },
  },
  allowedDevOrigins: ["*"],
};

export default nextConfig;
