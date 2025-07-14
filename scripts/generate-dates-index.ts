import fs from "fs";
import path from "path";
import { FileStorage } from "../src/lib/storage/file-storage";

/**
 * Generate dates.json index file for static hosting
 * This replicates the logic from FileStorage.getAvailableDates() for all sources
 */
async function generateDatesIndex() {
  try {
    console.log("Generating dates index for static hosting...");

    const sources = ["theverge", "techcrunch", "blognone", "hackernews"];
    const allDates = new Set<string>();

    // Collect all available dates from all sources
    for (const source of sources) {
      try {
        const dates = await FileStorage.getAvailableDates(source);
        dates.forEach((date) => allDates.add(date));
        console.log(`Found ${dates.length} dates for ${source}`);
      } catch (error) {
        console.warn(`Failed to get dates for ${source}:`, error);
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
    };

    // Write to sources/dates.json
    const outputPath = path.join(process.cwd(), "sources", "dates.json");
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(datesIndex, null, 2)
    );

    console.log(`✅ Generated dates index with ${sortedDates.length} dates`);
    console.log(`📁 Written to: ${outputPath}`);

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
