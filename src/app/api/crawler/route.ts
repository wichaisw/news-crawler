import { NextRequest, NextResponse } from "next/server";
import { CrawlerEngine } from "../../../lib/crawler/crawler-engine";

export async function GET() {
  try {
    const configs = CrawlerEngine.getSiteConfigs();

    return NextResponse.json({
      status: "idle",
      sources: configs.map((config) => ({
        name: config.name,
        displayName: config.displayName,
        hasApi: config.hasApi,
        maxArticles: config.maxArticles,
        updateInterval: config.updateInterval,
      })),
    });
  } catch (error) {
    console.error("Error getting crawler status:", error);
    return NextResponse.json(
      { error: "Failed to get crawler status" },
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
    console.error("Error triggering crawl:", error);
    return NextResponse.json(
      { error: "Failed to trigger crawl" },
      { status: 500 }
    );
  }
}
