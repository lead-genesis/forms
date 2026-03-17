import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xmltlmvsgcvedxcobwsp.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
