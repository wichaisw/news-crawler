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
 */
async function generateDatesIndex() {
  try {
    const sources = ["theverge", "techcrunch", "blognone", "hackernews"];
    const allDates = new Set<string>();

    // Collect all available dates from all sources
    for (const source of sources) {
      try {
        const dates = await FileStorage.getAvailableDates(source);
        dates.forEach((date) => allDates.add(date));
        console.log(`   Found ${dates.length} dates for ${source}`);
      } catch (error) {
        console.warn(`   Failed to get dates for ${source}:`, error);
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

    console.log(`   ✅ Generated dates index with ${sortedDates.length} dates`);
    console.log(`   📁 Written to: ${outputPath}`);

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
