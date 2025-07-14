import { CrawlerResult, SiteConfig } from "../types/crawler-types";
import { NewsItem } from "../types/news-types";
import { TheVergeParser } from "./parsers/theverge-parser";
import { FileStorage } from "../storage/file-storage";
import { ContentProcessor } from "../storage/content-processor";

export class CrawlerEngine {
  private static siteConfigs: SiteConfig[] = [
    {
      name: "theverge",
      displayName: "The Verge",
      baseUrl: "https://www.theverge.com/",
      hasApi: false,
      maxArticles: 50,
      updateInterval: 60, // 60 minutes
      crawlConfig: {
        name: "theverge",
        baseUrl: "https://www.theverge.com/",
        selectors: {
          article: 'div[data-chorus-optimize-field="collection"] article',
          title: "h2 a",
          description: "h2 + p",
          link: "h2 a",
          author: '[data-cdata="author-name"]',
          date: "time",
        },
        pagination: {
          nextPageSelector: ".p-pagination__next",
          maxPages: 3,
        },
      },
    },
  ];

  static async crawlSite(sourceName: string): Promise<CrawlerResult> {
    const config = this.siteConfigs.find((c) => c.name === sourceName);
    if (!config) {
      return {
        success: false,
        articles: [],
        error: `Unknown source: ${sourceName}`,
        source: sourceName,
        timestamp: new Date(),
        pagesProcessed: 0,
      };
    }

    try {
      const articles: NewsItem[] = [];
      let pagesProcessed = 0;
      let currentUrl = config.baseUrl;

      // Crawl up to maxPages
      for (
        let page = 1;
        page <= (config.crawlConfig?.pagination?.maxPages || 1);
        page++
      ) {
        console.log(`Crawling ${sourceName} page ${page}: ${currentUrl}`);

        const response = await fetch(currentUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${currentUrl}: ${response.status}`);
          break;
        }

        const html = await response.text();
        const pageArticles = TheVergeParser.parse(html, config.baseUrl);

        articles.push(...pageArticles);
        pagesProcessed++;

        // Check if we have enough articles
        if (articles.length >= config.maxArticles) {
          articles.splice(config.maxArticles);
          break;
        }

        // Try to find next page
        if (config.crawlConfig?.pagination?.nextPageSelector) {
          const cheerio = await import("cheerio");
          const $ = cheerio.load(html);
          const nextPageLink = $(
            config.crawlConfig.pagination.nextPageSelector
          ).attr("href");
          if (nextPageLink) {
            currentUrl = ContentProcessor.normalizeUrl(
              nextPageLink,
              config.baseUrl
            );
          } else {
            break;
          }
        } else {
          break;
        }
      }

      // Save articles to storage
      const today = new Date().toISOString().split("T")[0];
      await FileStorage.saveNewsData(sourceName, today, articles);

      return {
        success: true,
        articles,
        source: sourceName,
        timestamp: new Date(),
        pagesProcessed,
      };
    } catch (error) {
      console.error(`Error crawling ${sourceName}:`, error);
      return {
        success: false,
        articles: [],
        error: error instanceof Error ? error.message : "Unknown error",
        source: sourceName,
        timestamp: new Date(),
        pagesProcessed: 0,
      };
    }
  }

  static async crawlAllSources(): Promise<CrawlerResult[]> {
    const results: CrawlerResult[] = [];

    for (const config of this.siteConfigs) {
      const result = await this.crawlSite(config.name);
      results.push(result);

      // Add delay between requests to be respectful
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    return results;
  }

  static getSiteConfigs(): SiteConfig[] {
    return this.siteConfigs;
  }
}
