import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Build for GitHub Pages with optimized static generation
 */
async function buildForGitHubPages() {
  try {
    console.log("🔨 Building optimized static site for GitHub Pages...");

    // Build static site (API routes will be automatically excluded by Next.js static export)
    console.log("🏗️ Building static site with SSG...");
    execSync("next build", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "production" },
    });

    // Copy sources to out directory
    const sourcesDir = path.join(process.cwd(), "sources");
    const outDir = path.join(process.cwd(), "out");
    if (fs.existsSync(sourcesDir)) {
      execSync(`cp -R "${sourcesDir}" "${outDir}/"`);
      console.log("✅ Copied sources to out/");
    }

    console.log("✅ GitHub Pages build completed!");
    console.log("📊 Build optimized for:");
    console.log("   - Static Site Generation (SSG) for all pages");
    console.log(
      "   - API routes automatically excluded by Next.js static export"
    );
    console.log(
      "   - Sources page shows development-only message in production"
    );
    console.log("   - Ready for free GitHub Pages deployment");
    return true;
  } catch (error) {
    console.error("❌ Build failed:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  buildForGitHubPages()
    .then(() => {
      console.log("🎉 GitHub Pages build completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 GitHub Pages build failed:", error);
      process.exit(1);
    });
}

export { buildForGitHubPages };
