import fs from "fs/promises";
import path from "path";
import { NewsResponse, NewsItem } from "../types/news-types";

export class FileStorage {
  private static dataDir = "sources";

  static async saveNewsData(
    source: string,
    date: string,
    articles: NewsItem[]
  ): Promise<void> {
    const sourceDir = path.join(this.dataDir, source);
    const filePath = path.join(sourceDir, `${date}.json`);

    // Ensure directory exists
    await fs.mkdir(sourceDir, { recursive: true });

    const data: NewsResponse = {
      date,
      source,
      articles,
    };

    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  static async loadNewsData(source: string, date: string): Promise<NewsItem[]> {
    const filePath = path.join(this.dataDir, source, `${date}.json`);

    try {
      const data = await fs.readFile(filePath, "utf-8");
      const parsed: NewsResponse = JSON.parse(data);

      // Convert string dates back to Date objects
      return parsed.articles.map((article) => ({
        ...article,
        publishedAt: new Date(article.publishedAt),
      }));
    } catch {
      return [];
    }
  }

  static async getAvailableDates(source: string): Promise<string[]> {
    const sourceDir = path.join(this.dataDir, source);

    try {
      const files = await fs.readdir(sourceDir);
      return files
        .filter((file) => file.endsWith(".json"))
        .map((file) => file.replace(".json", ""))
        .sort()
        .reverse(); // Most recent first
    } catch {
      return [];
    }
  }

  static async getAllNewsData(source: string): Promise<NewsItem[]> {
    const dates = await this.getAvailableDates(source);
    const allArticles: NewsItem[] = [];

    for (const date of dates) {
      const articles = await this.loadNewsData(source, date);
      allArticles.push(...articles);
    }

    return allArticles.sort(
      (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
    );
  }

  static async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const sources = await fs.readdir(this.dataDir);

      for (const source of sources) {
        const sourceDir = path.join(this.dataDir, source);
        const files = await fs.readdir(sourceDir);

        for (const file of files) {
          if (!file.endsWith(".json")) continue;

          const dateStr = file.replace(".json", "");
          const fileDate = new Date(dateStr);

          if (fileDate < cutoffDate) {
            await fs.unlink(path.join(sourceDir, file));
          }
        }
      }
    } catch (error) {
      console.error("Error cleaning up old data:", error);
    }
  }

  static async getSources(): Promise<string[]> {
    try {
      const sources = await fs.readdir(this.dataDir);
      return sources.filter((source) => {
        const sourcePath = path.join(this.dataDir, source);
        return fs.stat(sourcePath).then((stat) => stat.isDirectory());
      });
    } catch {
      return [];
    }
  }
}
