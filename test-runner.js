const { execSync } = require("child_process");

console.log("🧪 Running Feed Crawler Tests...\n");

try {
  // Run Jest with verbose output
  execSync("npx jest --verbose --passWithNoTests", {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  console.log("\n✅ All tests passed!");
} catch (error) {
  console.error("\n❌ Some tests failed!");
  process.exit(1);
}
