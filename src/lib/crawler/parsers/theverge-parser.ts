import * as cheerio from "cheerio";
import { NewsItem } from "../../types/news-types";
import { ContentProcessor } from "../../storage/content-processor";

export class TheVergeParser {
  static parseRSS(
    xml: string,
    baseUrl: string = "https://www.theverge.com/"
  ): NewsItem[] {
    const $ = cheerio.load(xml, { xmlMode: true });
    const articles: NewsItem[] = [];

    $("entry").each((_, element) => {
      const $entry = $(element);
      const title = $entry.find("title").text().trim();
      const url =
        $entry.find("link").attr("href") || $entry.find("link").text().trim();
      const description = $entry.find("summary").text().trim() || title;
      const author = $entry.find("author name").text().trim();
      const dateStr = $entry.find("published").text().trim();
      const publishedAt = dateStr ? new Date(dateStr) : new Date();

      // Try to extract image from content or media
      const imageUrl =
        $entry.find("media\\:content").attr("url") ||
        $entry
          .find("content")
          .text()
          .match(/<img[^>]+src="([^"]+)"/)?.[1] ||
        undefined;

      if (title && url) {
        articles.push({
          id: ContentProcessor.generateId(url),
          title,
          description,
          summary: ContentProcessor.generateSummary(description),
          url: ContentProcessor.normalizeUrl(url, baseUrl),
          imageUrl,
          publishedAt,
          source: "theverge",
          sourceName: "The Verge",
          author,
          tags: [],
        });
      }
    });

    return articles;
  }

  // Keep the old HTML parser as fallback
  static parse(
    html: string,
    baseUrl: string = "https://www.theverge.com/"
  ): NewsItem[] {
    const $ = cheerio.load(html);
    const articles: NewsItem[] = [];

    $('div[data-chorus-optimize-field="collection"] article').each(
      (_, element) => {
        const $article = $(element);
        const title = $article.find("h2 a").text().trim();
        const url = $article.find("h2 a").attr("href");
        const description = $article.find("h2 + p").text().trim() || title;
        const author = $article
          .find('[data-cdata="author-name"]')
          .first()
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
            summary: ContentProcessor.generateSummary(description),
            url: ContentProcessor.normalizeUrl(url, baseUrl),
            imageUrl,
            publishedAt,
            source: "theverge",
            sourceName: "The Verge",
            author,
            tags: [],
          });
        }
      }
    );

    return articles;
  }
}
