import { NextRequest, NextResponse } from "next/server";
import { FileStorage } from "../../../lib/storage/file-storage";
import { NewsItem } from "../../../lib/types/news-types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const date = searchParams.get("date");

    let articles: NewsItem[] = [];

    if (source) {
      // Get articles from specific source
      if (date) {
        articles = await FileStorage.loadNewsData(source, date);
      } else {
        articles = await FileStorage.getAllNewsData(source);
      }
    } else {
      // Get articles from all sources
      const sources = await FileStorage.getSources();
      for (const src of sources) {
        let sourceArticles: NewsItem[];
        if (date) {
          // If date is specified, get articles from that specific date for all sources
          sourceArticles = await FileStorage.loadNewsData(src, date);
        } else {
          // Get all articles from the source
          sourceArticles = await FileStorage.getAllNewsData(src);
        }
        articles.push(...sourceArticles);
      }
      // Sort by date (newest first)
      articles.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articles.slice(startIndex, endIndex);

    return NextResponse.json({
      articles: paginatedArticles,
      total: articles.length,
      page,
      limit,
      hasMore: endIndex < articles.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
