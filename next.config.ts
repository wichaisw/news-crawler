import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Support both server-side and static export
  output: process.env.NEXT_STATIC_EXPORT === "true" ? "export" : "standalone",

  // Static export configuration
  ...(process.env.NEXT_STATIC_EXPORT === "true" && {
    trailingSlash: true,
    basePath: process.env.NODE_ENV === "production" ? "/news-crawler" : "",
    images: {
      unoptimized: true, // Required for static export
    },
  }),
};

export default nextConfig;
