import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: process.env.NODE_ENV === "production" ? "/news-crawler" : "",
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
