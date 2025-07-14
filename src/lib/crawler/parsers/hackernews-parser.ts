import * as cheerio from "cheerio";
import { NewsItem } from "../../types/news-types";
import { ContentProcessor } from "../../storage/content-processor";
import { decodeHtmlEntities } from "../../utils/html";

export class HackerNewsParser {
  static parse(
    html: string,
    baseUrl: string = "https://news.ycombinator.com"
  ): NewsItem[] {
    const $ = cheerio.load(html);
    const articles: NewsItem[] = [];

    // Hacker News uses a specific table structure
    $("tr.athing").each((_, element) => {
      const $row = $(element);
      const $nextRow = $row.next("tr");

      // Extract story information
      const titleElement = $row.find("td.title a");
      const title = titleElement.text().trim();
      const url = titleElement.attr("href");

      // Extract metadata from the next row
      const scoreText = $nextRow.find("td.subtext .score").text().trim();
      const author = $nextRow.find("td.subtext .hnuser").text().trim();
      const timeText = $nextRow.find("td.subtext .age").text().trim();
      const commentsText = $nextRow.find("td.subtext a").last().text().trim();

      if (!title || !url) {
        return;
      }

      // Parse score
      const scoreMatch = scoreText.match(/(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

      // Parse comments count
      const commentsMatch = commentsText.match(/(\d+)/);
      const comments = commentsMatch ? parseInt(commentsMatch[1]) : 0;

      // Parse time (convert relative time to Date)
      const publishedAt = this.parseRelativeTime(timeText);

      // Create description
      const description = `Score: ${score} | Comments: ${comments} | Posted by ${author}`;

      articles.push({
        id: ContentProcessor.generateId(url),
        title: decodeHtmlEntities(title),
        description: ContentProcessor.generateSummary(
          decodeHtmlEntities(description)
        ),
        url: ContentProcessor.normalizeUrl(url, baseUrl),
        publishedAt,
        source: "hackernews",
        sourceName: "Hacker News",
        author: author || "Anonymous",
        tags: [],
      });
    });

    return articles;
  }

  /**
   * Parse relative time strings like "2 hours ago" to Date objects
   */
  private static parseRelativeTime(timeText: string): Date {
    const now = new Date();

    // Handle common relative time patterns
    const hourMatch = timeText.match(/(\d+)\s*hour/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      return new Date(now.getTime() - hours * 60 * 60 * 1000);
    }

    const minuteMatch = timeText.match(/(\d+)\s*minute/);
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      return new Date(now.getTime() - minutes * 60 * 1000);
    }

    const dayMatch = timeText.match(/(\d+)\s*day/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    }

    // Default to current time if parsing fails
    return now;
  }

  /**
   * Extract story IDs from the page for pagination
   */
  static extractStoryIds(html: string): number[] {
    const $ = cheerio.load(html);
    const ids: number[] = [];

    $("tr.athing").each((_, element) => {
      const $row = $(element);
      const idAttr = $row.attr("id");
      if (idAttr) {
        const id = parseInt(idAttr);
        if (!isNaN(id)) {
          ids.push(id);
        }
      }
    });

    return ids;
  }

  /**
   * Get the next page URL if available
   */
  static getNextPageUrl(html: string, baseUrl: string): string | null {
    const $ = cheerio.load(html);
    const moreLink = $("a.morelink");
    const href = moreLink.attr("href");

    if (href) {
      return ContentProcessor.normalizeUrl(href, baseUrl);
    }

    return null;
  }
}
