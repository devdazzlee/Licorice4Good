import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image configuration for external domains
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "licorice4good.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.licorice4good.com",
        port: "",
        pathname: "/**",
      },
    ],
    // Disable image optimization for uploaded images to prevent 400 errors
    unoptimized: true,
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // CORS is handled by the backend API, no need for frontend CORS headers
};

export default nextConfig;
