import * as cheerio from "cheerio";
import { NewsItem } from "../../types/news-types";
import { ContentProcessor } from "../../storage/content-processor";
import { decodeHtmlEntities } from "../../utils/html";

export class TechCrunchParser {
  static parseRSS(
    xml: string,
    baseUrl: string = "https://techcrunch.com"
  ): NewsItem[] {
    const $ = cheerio.load(xml, { xmlMode: true });
    const articles: NewsItem[] = [];

    $("item").each((_, element) => {
      const $item = $(element);
      const title = $item.find("title").text().trim();
      const link = $item.find("link").text().trim();
      const description = $item.find("description").text().trim();
      const pubDate = $item.find("pubDate").text().trim();
      const guid = $item.find("guid").text().trim();
      const author =
        $item.find("dc\\:creator").text().trim() ||
        $item.find("author").text().trim();

      if (!title || !link) {
        return;
      }

      // Extract content from description (remove HTML tags)
      const content = TechCrunchParser.extractContentFromDescription(
        description || title
      );

      // Parse publication date
      const publishedAt = pubDate ? new Date(pubDate) : new Date();

      // Extract image from description if available
      const imageUrl = TechCrunchParser.extractImageFromDescription(
        description || ""
      );

      articles.push({
        id: guid || ContentProcessor.generateId(link),
        title: decodeHtmlEntities(title),
        description: ContentProcessor.generateSummary(
          decodeHtmlEntities(content)
        ),
        url: ContentProcessor.normalizeUrl(link, baseUrl),
        imageUrl: imageUrl || undefined,
        publishedAt,
        source: "techcrunch",
        sourceName: "TechCrunch",
        author: author || "TechCrunch",
        tags: [],
      });
    });

    return articles;
  }

  // Keep HTML parser as fallback (if needed in the future)
  static parse(
    html: string,
    baseUrl: string = "https://techcrunch.com"
  ): NewsItem[] {
    const $ = cheerio.load(html);
    const articles: NewsItem[] = [];

    // TechCrunch article selectors
    $("article").each((_, element) => {
      const $article = $(element);
      const title = $article
        .find("h2 a, h3 a, .post-block__title a")
        .text()
        .trim();
      const url = $article
        .find("h2 a, h3 a, .post-block__title a")
        .attr("href");
      const description =
        $article.find(".post-block__content, .excerpt").text().trim() || title;
      const author = $article
        .find(".post-block__author, .author")
        .text()
        .trim();
      const dateStr = $article.find("time").attr("datetime");
      const publishedAt = dateStr ? new Date(dateStr) : new Date();
      const imageUrl = $article.find("img").attr("src");

      if (title && url) {
        articles.push({
          id: ContentProcessor.generateId(url),
          title,
          description,
          url: ContentProcessor.normalizeUrl(url, baseUrl),
          imageUrl,
          publishedAt,
          source: "techcrunch",
          sourceName: "TechCrunch",
          author: author || "TechCrunch",
          tags: [],
        });
      }
    });

    return articles;
  }

  private static extractContentFromDescription(description: string): string {
    // Remove HTML tags and decode entities
    const content = description
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    return decodeHtmlEntities(content);
  }

  private static extractImageFromDescription(
    description: string
  ): string | null {
    // Look for img tags in description
    const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch && imgMatch[1]) {
      return imgMatch[1];
    }
    return null;
  }
}
