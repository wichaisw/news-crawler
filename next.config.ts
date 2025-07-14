import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",

  // Static export configuration
  ...(isStaticExport && {
    trailingSlash: true,
    basePath: process.env.NODE_ENV === "production" ? "/news-crawler" : "",
    images: {
      unoptimized: true, // Required for static export
    },
  }),
};

export default nextConfig;
