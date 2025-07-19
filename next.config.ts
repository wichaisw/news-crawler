import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use static export for GitHub Pages deployment
  output: "export",
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? "/news-crawler" : "",
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
