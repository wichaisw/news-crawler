import { NewsItem, NewsResponse } from "../types/news-types";

export class StaticNewsFetcher {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Use environment variable for base URL, fallback to GitHub Pages path
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_STATIC_BASE_URL ||
      "https://wichaisw.github.io/news-crawler/sources";
  }

  /**
   * Get news articles by date, replicating the logic from /api/news route
   * Reuses the same business logic patterns as FileStorage.getAllNewsData()
   */
  async getNewsByDate(date: string, source?: string): Promise<NewsItem[]> {
    if (source) {
      return this.fetchSourceData(source, date);
    }

    // Same logic as FileStorage.getAllNewsData() but for static environment
    const sources = ["theverge", "techcrunch", "blognone", "hackernews"];
    const promises = sources.map((s) => this.fetchSourceData(s, date));
    const results = await Promise.allSettled(promises);

    const allArticles = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<NewsItem[]>).value)
      .flat();

    // Same sorting logic as FileStorage and API route
    return allArticles.sort((a, b) => {
      const dateA =
        a.publishedAt instanceof Date ? a.publishedAt : new Date(a.publishedAt);
      const dateB =
        b.publishedAt instanceof Date ? b.publishedAt : new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
  }

  /**
   * Get available dates, replicating the logic from /api/source route
   * Reuses the same business logic patterns as FileStorage.getAvailableDates()
   */
  async getAvailableDates(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/dates.json`);
      if (!response.ok) {
        console.warn("Failed to fetch dates.json, falling back to empty array");
        return [];
      }
      const data = await response.json();
      return data.dates || [];
    } catch (error) {
      console.error("Error fetching available dates:", error);
      return [];
    }
  }

  /**
   * Get news with pagination, replicating the logic from /api/news route
   * Reuses the same pagination logic as the API route
   */
  async getNewsWithPagination(
    date: string,
    page: number = 1,
    limit: number = 20,
    source?: string
  ): Promise<{
    articles: NewsItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    const articles = await this.getNewsByDate(date, source);

    // Apply pagination (same logic as API route)
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedArticles = articles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      total: articles.length,
      page,
      limit,
      hasMore: endIndex < articles.length,
    };
  }

  /**
   * Fetch source data for a specific date
   * Reuses the same date conversion logic as FileStorage.loadNewsData()
   */
  private async fetchSourceData(
    source: string,
    date: string
  ): Promise<NewsItem[]> {
    try {
      const url = `${this.baseUrl}/${source}/${date}.json`;
      const response = await fetch(url);

      if (!response.ok) {
        console.warn(
          `Failed to fetch ${source} data for ${date}: ${response.status}`
        );
        return []; // Same fallback as FileStorage
      }

      const data: NewsResponse = await response.json();

      // Convert publishedAt string to Date object if it's a string
      return data.articles.map((article) => ({
        ...article,
        publishedAt:
          typeof article.publishedAt === "string"
            ? new Date(article.publishedAt)
            : article.publishedAt,
      }));
    } catch (error) {
      console.error(`Error fetching ${source} data for ${date}:`, error);
      return []; // Same fallback as FileStorage
    }
  }
}
