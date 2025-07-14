import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Build static site by temporarily removing server-only directories
 */
async function buildStaticOnly() {
  const appDir = path.join(process.cwd(), "src", "app");
  const apiDir = path.join(appDir, "api");
  // const sourcesDir = path.join(appDir, "sources"); // No longer needed

  // Track what we removed for restoration
  const removedDirs: Array<{ path: string; name: string }> = [];

  try {
    console.log("🔨 Preparing static build...");

    // Remove server-only directories
    if (fs.existsSync(apiDir)) {
      console.log("📁 Temporarily removing API directory...");
      execSync(`rm -rf "${apiDir}"`);
      removedDirs.push({ path: apiDir, name: "api" });
    }

    // Do NOT remove sourcesDir from src/app

    // Build static site
    console.log("🏗️ Building static site...");
    execSync("next build", {
      stdio: "inherit",
      env: { ...process.env, NEXT_STATIC_EXPORT: "true" },
    });

    // Copy sources directory to out
    const outDir = path.join(process.cwd(), "out");
    const rootSourcesDir = path.join(process.cwd(), "sources");
    if (fs.existsSync(rootSourcesDir)) {
      execSync(`cp -R "${rootSourcesDir}" "${outDir}/"`);
      console.log("✅ Copied sources/ to out/");
    }

    console.log("✅ Static build completed!");
    return true;
  } finally {
    // Always restore from git
    console.log("🔄 Restoring server directories from git...");

    for (const dir of removedDirs) {
      try {
        execSync(`git checkout HEAD -- "${dir.path}"`);
        console.log(`✅ Restored ${dir.name} directory`);
      } catch (error) {
        console.warn(`⚠️ Could not restore ${dir.name} from git:`, error);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  buildStaticOnly()
    .then(() => {
      console.log("🎉 Static build completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Static build failed:", error);
      process.exit(1);
    });
}

export { buildStaticOnly };
