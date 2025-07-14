import { NextRequest, NextResponse } from "next/server";
import { CrawlerEngine } from "../../../lib/crawler/crawler-engine";
import { FileStorage } from "../../../lib/storage/file-storage";

export async function GET() {
  try {
    const configs = CrawlerEngine.getSiteConfigs();
    const sources = await FileStorage.getSources();

    // Get all available dates from all sources
    const allDates = new Set<string>();
    for (const source of sources) {
      const dates = await FileStorage.getAvailableDates(source);
      dates.forEach((date) => allDates.add(date));
    }

    // Sort dates in descending order (most recent first)
    const sortedDates = Array.from(allDates).sort().reverse();

    return NextResponse.json({
      status: "idle",
      sources: configs.map((config) => ({
        name: config.name,
        displayName: config.displayName,
        hasApi: config.hasApi,
        maxArticles: config.maxArticles,
        updateInterval: config.updateInterval,
      })),
      dates: sortedDates,
    });
  } catch (error) {
    console.error("Error getting source status:", error);
    return NextResponse.json(
      { error: "Failed to get source status" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source } = body;

    if (source) {
      // Crawl specific source
      const result = await CrawlerEngine.crawlSite(source);
      return NextResponse.json(result);
    } else {
      // Crawl all sources
      const results = await CrawlerEngine.crawlAllSources();
      return NextResponse.json({
        success: true,
        results,
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error("Error triggering source crawl:", error);
    return NextResponse.json(
      { error: "Failed to trigger source crawl" },
      { status: 500 }
    );
  }
}
