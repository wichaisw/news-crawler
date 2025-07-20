import { NewsItem, NewsResponse } from "../types/news-types";

export class StaticNewsFetcher {
  private baseUrl: string;
  private isDevelopment: boolean;

  constructor(baseUrl?: string) {
    this.isDevelopment = process.env.NODE_ENV === "development";

    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (this.isDevelopment) {
      // In development, use local API routes
      this.baseUrl = "/api/news";
    } else {
      // In production, use GitHub Pages URL
      this.baseUrl =
        process.env.NEXT_PUBLIC_STATIC_BASE_URL ||
        "https://wichaisw.github.io/news-crawler/sources";
    }
  }

  /**
   * Get news articles by date, replicating the logic from /api/news route
   * Reuses the same business logic patterns as FileStorage.getAllNewsData()
   */
  async getNewsByDate(date: string, source?: string): Promise<NewsItem[]> {
    if (this.isDevelopment) {
      // In development, use API route
      return this.fetchFromApi(date, source);
    } else {
      // In production, use static files
      return this.fetchFromStaticFiles(date, source);
    }
  }

  /**
   * Get available dates, replicating the logic from /api/source route
   * Reuses the same business logic patterns as FileStorage.getAvailableDates()
   */
  async getAvailableDates(): Promise<string[]> {
    if (this.isDevelopment) {
      // In development, use API route
      try {
        const response = await fetch("/api/source");
        if (!response.ok) {
          console.warn(
            "Failed to fetch from /api/source, falling back to empty array"
          );
          return [];
        }
        const data = await response.json();
        return data.dates || [];
      } catch (error) {
        console.error("Error fetching available dates:", error);
        return [];
      }
    } else {
      // In production, use static files
      try {
        const response = await fetch(`${this.baseUrl}/dates.json`);
        if (!response.ok) {
          console.warn(
            "Failed to fetch dates.json, falling back to empty array"
          );
          return [];
        }
        const data = await response.json();
        return data.dates || [];
      } catch (error) {
        console.error("Error fetching available dates:", error);
        return [];
      }
    }
  }

  /**
   * Get news with pagination, replicating the logic from /api/news route
   * Reuses the same pagination logic as the API route
   */
  async getNewsWithPagination(
    date: string | null,
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
    if (this.isDevelopment) {
      // In development, use API route with pagination
      const params = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
      });
      if (date) {
        params.append("date", date);
      }
      if (source) {
        params.append("source", source);
      }

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch news from API");
      }
      return await response.json();
    } else {
      // In production, use static files with client-side pagination
      const articles = await this.fetchFromStaticFiles(date, source);

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
  }

  /**
   * Fetch from API (development mode)
   */
  private async fetchFromApi(
    date: string,
    source?: string
  ): Promise<NewsItem[]> {
    const params = new URLSearchParams();
    if (date) {
      params.append("date", date);
    }
    if (source) {
      params.append("source", source);
    }

    const response = await fetch(`/api/news?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch news from API");
    }
    const data = await response.json();
    return data.articles || [];
  }

  /**
   * Fetch from static files (production mode)
   */
  private async fetchFromStaticFiles(
    date: string | null,
    source?: string
  ): Promise<NewsItem[]> {
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
   * Fetch source data for a specific date
   * Reuses the same date conversion logic as FileStorage.loadNewsData()
   */
  private async fetchSourceData(
    source: string,
    date: string | null
  ): Promise<NewsItem[]> {
    try {
      if (date) {
        // Fetch specific date
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
      } else {
        // Fetch all available dates for this source (for "Today" functionality)
        const datesResponse = await fetch(`${this.baseUrl}/dates.json`);
        if (!datesResponse.ok) {
          console.warn(`Failed to fetch dates.json: ${datesResponse.status}`);
          return [];
        }

        const datesData = await datesResponse.json();
        const allArticles: NewsItem[] = [];

        // Get articles from all available dates for this source
        for (const availableDate of datesData.dates || []) {
          try {
            const url = `${this.baseUrl}/${source}/${availableDate}.json`;
            const response = await fetch(url);

            if (response.ok) {
              const data: NewsResponse = await response.json();
              const articles = data.articles.map((article) => ({
                ...article,
                publishedAt:
                  typeof article.publishedAt === "string"
                    ? new Date(article.publishedAt)
                    : article.publishedAt,
              }));
              allArticles.push(...articles);
            }
          } catch (error) {
            console.warn(
              `Failed to fetch ${source} data for ${availableDate}:`,
              error
            );
          }
        }

        return allArticles;
      }
    } catch (error) {
      console.error(`Error fetching ${source} data for ${date}:`, error);
      return []; // Same fallback as FileStorage
    }
  }
}
