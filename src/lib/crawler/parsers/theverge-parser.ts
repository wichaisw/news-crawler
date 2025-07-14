import cheerio from "cheerio";
import { NewsItem } from "../../types/news-types";
import { ContentProcessor } from "../../storage/content-processor";

export class TheVergeParser {
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
