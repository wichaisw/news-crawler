import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export only in production for GitHub Pages deployment
  ...(process.env.NODE_ENV === "production" && {
    output: "export",
  }),
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? "/news-crawler" : "",
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
