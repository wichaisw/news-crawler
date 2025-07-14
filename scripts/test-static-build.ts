import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * Test static build locally
 */
async function testStaticBuild() {
  try {
    console.log("🧪 Testing static build...");

    // 1. Generate dates index
    console.log("📅 Generating dates index...");
    execSync("npm run generate-dates", { stdio: "inherit" });

    // 2. Build static site
    console.log("🔨 Building static site...");
    execSync("npm run build:static", { stdio: "inherit" });

    // 3. Check if out directory exists
    const outDir = path.join(process.cwd(), "out");
    if (!fs.existsSync(outDir)) {
      throw new Error("Static build failed: out directory not found");
    }

    // 4. Check if sources are copied
    const sourcesDir = path.join(outDir, "sources");
    if (!fs.existsSync(sourcesDir)) {
      console.log("📁 Copying sources to static build...");
      execSync(`cp -r sources ${outDir}/`, { stdio: "inherit" });
    }

    // 5. Check if dates.json exists
    const datesFile = path.join(sourcesDir, "dates.json");
    if (!fs.existsSync(datesFile)) {
      throw new Error("dates.json not found in static build");
    }

    console.log("✅ Static build test completed successfully!");
    console.log("📁 Static files are in: ./out/");
    console.log("🌐 You can serve them with: npx serve out/");
    console.log(
      "🔗 Static site will be available at: http://localhost:3000/static/"
    );
  } catch (error) {
    console.error("❌ Static build test failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  testStaticBuild();
}

export { testStaticBuild };
