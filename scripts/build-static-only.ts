import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Build static site without API routes
 */
async function buildStaticOnly() {
  try {
    console.log("🔨 Building static site (API routes excluded)...");

    // Create a temporary Next.js config for static build
    const tempConfig = `
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/news-crawler' : '',
  images: {
    unoptimized: true,
  },
  // Exclude API routes from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'].filter(ext => ext !== 'api'),
};

export default nextConfig;
`;

    const configPath = path.join(process.cwd(), "next.config.static.ts");
    fs.writeFileSync(configPath, tempConfig);

    // Build with temporary config
    execSync(
      "NEXT_STATIC_EXPORT=true next build --config next.config.static.ts",
      {
        stdio: "inherit",
        env: { ...process.env, NEXT_STATIC_EXPORT: "true" },
      }
    );

    // Clean up temporary config
    fs.unlinkSync(configPath);

    console.log("✅ Static build completed successfully!");
  } catch (error) {
    console.error("❌ Static build failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  buildStaticOnly()
    .then(() => {
      console.log("🎉 Static build completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Static build failed:", error);
      process.exit(1);
    });
}

export { buildStaticOnly };
