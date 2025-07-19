import fs from "fs";
import path from "path";
import { FileStorage } from "../src/lib/storage/file-storage";

/**
 * Generate dates.json index file for static hosting
 * This replicates the logic from FileStorage.getAvailableDates() for all sources
 * Only includes dates that have data for ALL sources to prevent 404 errors
 */
async function generateDatesIndex() {
  try {
    console.log("Generating dates index for static hosting...");

    const sources = ["theverge", "techcrunch", "blognone", "hackernews"];
    const sourceDates: Record<string, string[]> = {};

    // Collect all available dates from all sources
    for (const source of sources) {
      try {
        const dates = await FileStorage.getAvailableDates(source);
        sourceDates[source] = dates;
        console.log(`Found ${dates.length} dates for ${source}`);
      } catch (error) {
        console.warn(`Failed to get dates for ${source}:`, error);
        sourceDates[source] = [];
      }
    }

    // Find dates that exist for ALL sources
    const allDates = new Set<string>();
    const firstSource = sources[0];
    if (firstSource && sourceDates[firstSource]) {
      for (const date of sourceDates[firstSource]) {
        const hasAllSources = sources.every(
          (source) => sourceDates[source] && sourceDates[source].includes(date)
        );
        if (hasAllSources) {
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
      `✅ Generated dates index with ${sortedDates.length} dates (all sources)`
    );
    console.log(`📁 Written to: ${outputPath}`);

    // Log date availability for debugging
    console.log("📊 Date availability per source:");
    Object.entries(datesIndex.dateAvailability).forEach(([source, count]) => {
      console.log(`  ${source}: ${count} dates`);
    });

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
