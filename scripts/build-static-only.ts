import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Build static site by temporarily removing server-only directories
 */
async function buildStaticOnly() {
  const appDir = path.join(process.cwd(), "src", "app");
  const apiDir = path.join(appDir, "api");
  const rootPageFile = path.join(appDir, "page.tsx");
  // const sourcesDir = path.join(appDir, "sources"); // No longer needed

  // Track what we removed for restoration
  const removedDirs: Array<{ path: string; name: string }> = [];
  const removedFiles: Array<{ path: string; name: string }> = [];

  try {
    console.log("🔨 Preparing static build...");

    // Remove server-only directories
    if (fs.existsSync(apiDir)) {
      console.log("📁 Temporarily removing API directory...");
      execSync(`rm -rf "${apiDir}"`);
      removedDirs.push({ path: apiDir, name: "api" });
    }

    // Temporarily rename root page to exclude it from static build
    if (fs.existsSync(rootPageFile)) {
      console.log("📄 Temporarily excluding root page from static build...");
      const backupPath = rootPageFile + ".bak";
      execSync(`mv "${rootPageFile}" "${backupPath}"`);
      removedFiles.push({ path: backupPath, name: "root page backup" });
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

    // Restore removed files
    for (const file of removedFiles) {
      try {
        if (file.name === "root page backup") {
          execSync(`mv "${file.path}" "${rootPageFile}"`);
          console.log("✅ Restored root page");
        }
      } catch (error) {
        console.warn(`⚠️ Could not restore ${file.name}:`, error);
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
