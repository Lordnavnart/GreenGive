import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    allowedDevOrigins: ["http://192.168.1.28:3000"],
  },
};

export default {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};
