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
        rssUrl: "https://www.theverge.com/rss/index.xml",
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

      // Use RSS feed if available, otherwise fall back to HTML crawling
      if (config.crawlConfig?.rssUrl) {
        console.log(
          `Crawling ${sourceName} RSS feed: ${config.crawlConfig.rssUrl}`
        );

        const response = await fetch(config.crawlConfig.rssUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch RSS feed: ${response.status}`);
          throw new Error(`Failed to fetch RSS feed: ${response.status}`);
        }

        const xml = await response.text();
        const rssArticles = TheVergeParser.parseRSS(xml, config.baseUrl);
        articles.push(...rssArticles);
        pagesProcessed = 1;
      } else {
        // Fallback to HTML crawling
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
      }

      // Group articles by publication date and save to storage
      const articlesByDate = new Map<string, NewsItem[]>();

      for (const article of articles) {
        const articleDate = new Date(article.publishedAt)
          .toISOString()
          .split("T")[0];
        if (!articlesByDate.has(articleDate)) {
          articlesByDate.set(articleDate, []);
        }
        articlesByDate.get(articleDate)!.push(article);
      }

      // Save articles to their respective date files with deduplication
      for (const [date, dateArticles] of articlesByDate) {
        await FileStorage.saveNewsDataWithDeduplication(
          sourceName,
          date,
          dateArticles
        );
      }

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
