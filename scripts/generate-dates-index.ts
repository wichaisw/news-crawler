import fs from "fs";
import path from "path";

/**
 * Generate dates.json index file for static hosting
 * This directly scans the filesystem for actual JSON files to ensure accuracy
 * Only includes dates that actually exist as JSON files
 */
async function generateDatesIndex() {
  try {
    console.log("Generating dates index for static hosting...");

    const sources = ["theverge", "techcrunch", "blognone", "hackernews"];
    const sourceDates: Record<string, string[]> = {};

    // Collect all available dates by directly scanning directories
    for (const source of sources) {
      try {
        const sourceDir = path.join(process.cwd(), "sources", source);
        if (fs.existsSync(sourceDir)) {
          const files = fs.readdirSync(sourceDir);
          const jsonFiles = files.filter((file) => file.endsWith(".json"));
          const dates = jsonFiles.map((file) => file.replace(".json", ""));
          sourceDates[source] = dates;
          console.log(
            `Found ${dates.length} dates for ${source}: ${dates.join(", ")}`
          );
        } else {
          console.warn(`Source directory not found: ${sourceDir}`);
          sourceDates[source] = [];
        }
      } catch (error) {
        console.warn(`Failed to scan dates for ${source}:`, error);
        sourceDates[source] = [];
      }
    }

    // Find dates that exist for ANY source (more inclusive approach)
    const allDates = new Set<string>();
    for (const source of sources) {
      if (sourceDates[source]) {
        for (const date of sourceDates[source]) {
          allDates.add(date);
        }
      }
    }

    // Sort dates (newest first)
    const sortedDates = Array.from(allDates).sort().reverse();

    // Create the dates index object
    const datesIndex = {
      dates: sortedDates,
      lastUpdated: new Date().toISOString(),
      totalSources: sources.length,
      sources: sources,
      // Add metadata about date availability
      dateAvailability: Object.fromEntries(
        sources.map((source) => [source, sourceDates[source]?.length || 0])
      ),
    };

    // Write to sources/dates.json
    const outputPath = path.join(process.cwd(), "sources", "dates.json");
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(datesIndex, null, 2)
    );

    console.log(
      `✅ Generated dates index with ${sortedDates.length} dates (any source)`
    );
    console.log(`📁 Written to: ${outputPath}`);

    // Log date availability for debugging
    console.log("📊 Date availability per source:");
    Object.entries(datesIndex.dateAvailability).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} dates`);
    });

    // Log which dates are missing from which sources
    console.log("🔍 Missing dates per source:");
    for (const source of sources) {
      const missingDates = sortedDates.filter(
        (date) => !sourceDates[source].includes(date)
      );
      if (missingDates.length > 0) {
        console.log(`  ${source} missing: ${missingDates.join(", ")}`);
      }
    }

    return datesIndex;
  } catch (error) {
    console.error("❌ Failed to generate dates index:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generateDatesIndex()
    .then(() => {
      console.log("🎉 Dates index generation completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Dates index generation failed:", error);
      process.exit(1);
    });
}

export { generateDatesIndex };
