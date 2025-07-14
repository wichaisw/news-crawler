export class StaticSourceFetcher {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_STATIC_BASE_URL ||
      (process.env.NODE_ENV === "production"
        ? "/news-crawler/sources"
        : "/sources");
  }

  /**
   * Get available dates for all sources
   * Replicates the logic from /api/source route
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
   * Get available sources
   * Returns the same sources as the current implementation
   */
  async getAvailableSources(): Promise<string[]> {
    // Same sources as defined in the current implementation
    return ["theverge", "techcrunch", "blognone", "hackernews"];
  }

  /**
   * Get source information
   * Returns static source information for display purposes
   */
  async getSourceInfo(): Promise<{
    sources: Array<{
      name: string;
      displayName: string;
      baseUrl: string;
    }>;
    lastUpdate?: string;
  }> {
    const sources = await this.getAvailableSources();

    const sourceInfo = sources.map((source) => {
      const displayNames: Record<string, string> = {
        theverge: "The Verge",
        techcrunch: "TechCrunch",
        blognone: "Blognone",
        hackernews: "Hacker News",
      };

      const baseUrls: Record<string, string> = {
        theverge: "https://www.theverge.com/",
        techcrunch: "https://techcrunch.com/",
        blognone: "https://www.blognone.com/",
        hackernews: "https://news.ycombinator.com/",
      };

      return {
        name: source,
        displayName: displayNames[source] || source,
        baseUrl: baseUrls[source] || "",
      };
    });

    return {
      sources: sourceInfo,
      lastUpdate: new Date().toISOString(), // In static version, this would be from dates.json
    };
  }
}
