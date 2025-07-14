import fs from "fs";
import path from "path";

/**
 * Prepare static build by temporarily moving API routes
 */
async function prepareStaticBuild() {
  try {
    console.log("🔧 Preparing static build...");

    const apiDir = path.join(process.cwd(), "src", "app", "api");
    const tempApiDir = path.join(process.cwd(), "temp-api");

    // Move API routes to temp directory
    if (fs.existsSync(apiDir)) {
      console.log("📁 Moving API routes to temp directory...");
      fs.renameSync(apiDir, tempApiDir);
    }

    console.log("✅ Static build preparation completed");
  } catch (error) {
    console.error("❌ Failed to prepare static build:", error);
    throw error;
  }
}

/**
 * Restore API routes after static build
 */
async function restoreApiRoutes() {
  try {
    console.log("🔄 Restoring API routes...");

    const apiDir = path.join(process.cwd(), "src", "app", "api");
    const tempApiDir = path.join(process.cwd(), "temp-api");

    // Restore API routes from temp directory
    if (fs.existsSync(tempApiDir)) {
      fs.renameSync(tempApiDir, apiDir);
      console.log("✅ API routes restored");
    }
  } catch (error) {
    console.error("❌ Failed to restore API routes:", error);
    throw error;
  }
}

// Export functions for use in other scripts
export { prepareStaticBuild, restoreApiRoutes };

// Run if called directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === "prepare") {
    prepareStaticBuild();
  } else if (command === "restore") {
    restoreApiRoutes();
  } else {
    console.log("Usage: tsx scripts/prepare-static-build.ts [prepare|restore]");
    process.exit(1);
  }
}
