import { CrawlerEngine } from "../src/lib/crawler/crawler-engine";
import { FileStorage } from "../src/lib/storage/file-storage";
import fs from "fs";
import path from "path";

/**
 * Crawl all sources and save data
 * This script is used by GitHub Actions for automated crawling
 */
async function crawlAllSources() {
  try {
    console.log("🚀 Starting automated crawl of all sources...");

    // Get all site configurations
    const configs = CrawlerEngine.getSiteConfigs();
    console.log(`📊 Found ${configs.length} sources to crawl`);

    // Crawl all sources
    const results = await CrawlerEngine.crawlAllSources();

    // Log results
    let totalArticles = 0;
    let successfulSources = 0;

    for (const result of results) {
      if (result.success) {
        console.log(
          `✅ ${result.source}: ${result.articles.length} articles, ${result.pagesProcessed} pages`
        );
        totalArticles += result.articles.length;
        successfulSources++;
      } else {
        console.log(`❌ ${result.source}: Failed - ${result.error}`);
      }
    }

    console.log(`\n📈 Crawl Summary:`);
    console.log(
      `   Sources: ${successfulSources}/${results.length} successful`
    );
    console.log(`   Total Articles: ${totalArticles}`);
    console.log(`   Timestamp: ${new Date().toISOString()}`);

    // Generate dates index for static hosting
    console.log("\n📅 Generating dates index...");
    await generateDatesIndex();

    console.log("✅ Crawl completed successfully!");
    return results;
  } catch (error) {
    console.error("❌ Crawl failed:", error);
    process.exit(1);
  }
}

/**
 * Generate dates.json index file for static hosting
 * This replicates the logic from FileStorage.getAvailableDates() for all sources
 * Only includes dates that have data for ALL sources to prevent 404 errors
 */
async function generateDatesIndex() {
  try {
    const sources = ["theverge", "techcrunch", "blognone", "hackernews"];
    const sourceDates: Record<string, string[]> = {};

    // Collect all available dates from all sources
    for (const source of sources) {
      try {
        const dates = await FileStorage.getAvailableDates(source);
        sourceDates[source] = dates;
        console.log(`   Found ${dates.length} dates for ${source}`);
      } catch (error) {
        console.warn(`   Failed to get dates for ${source}:`, error);
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
      `   ✅ Generated dates index with ${sortedDates.length} dates (all sources)`
    );
    console.log(`   📁 Written to: ${outputPath}`);

    // Log date availability for debugging
    console.log("   📊 Date availability per source:");
    Object.entries(datesIndex.dateAvailability).forEach(([source, count]) => {
      console.log(`     ${source}: ${count} dates`);
    });

    return datesIndex;
  } catch (error) {
    console.error("   ❌ Failed to generate dates index:", error);
    throw error;
  }
}

// Run the crawler if this script is executed directly
if (require.main === module) {
  crawlAllSources()
    .then(() => {
      console.log("🎉 Crawl script completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Crawl script failed:", error);
      process.exit(1);
    });
}

export { crawlAllSources, generateDatesIndex };
