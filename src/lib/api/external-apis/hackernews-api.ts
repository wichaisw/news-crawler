import { NewsItem } from "../../types/news-types";
import { ContentProcessor } from "../../storage/content-processor";

export interface HackerNewsItem {
  id: number;
  deleted?: boolean;
  type: "story" | "comment" | "poll" | "pollopt";
  by: string;
  time: number;
  text?: string;
  dead?: boolean;
  parent?: number;
  poll?: number;
  kids?: number[];
  url?: string;
  score: number;
  title: string;
  parts?: number[];
  descendants?: number;
}

export class HackerNewsApi {
  private static baseUrl = "https://hacker-news.firebaseio.com/v0";
  private static maxStories = 100; // Hacker News API limit

  /**
   * Fetch top stories from Hacker News API
   */
  static async fetchTopStories(limit: number = 50): Promise<NewsItem[]> {
    try {
      // Get list of top story IDs
      const response = await fetch(`${this.baseUrl}/topstories.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch top stories: ${response.status}`);
      }

      const storyIds: number[] = await response.json();
      const limitedIds = storyIds.slice(0, Math.min(limit, this.maxStories));

      // Fetch individual story details
      const storyPromises = limitedIds.map((id) => this.fetchStory(id));
      const stories = await Promise.all(storyPromises);

      // Filter out non-story items and convert to NewsItem format
      const newsItems = stories
        .filter(
          (story): story is HackerNewsItem =>
            story !== null && story.type === "story" && story.url !== undefined
        )
        .map((story) => this.convertToNewsItem(story))
        .filter((item): item is NewsItem => item !== null);

      return newsItems;
    } catch (error) {
      console.error("Error fetching Hacker News stories:", error);
      throw error;
    }
  }

  /**
   * Fetch a single story by ID
   */
  static async fetchStory(id: number): Promise<HackerNewsItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/item/${id}.json`);
      if (!response.ok) {
        console.warn(`Failed to fetch story ${id}: ${response.status}`);
        return null;
      }

      const story: HackerNewsItem = await response.json();
      return story;
    } catch (error) {
      console.warn(`Error fetching story ${id}:`, error);
      return null;
    }
  }

  /**
   * Convert Hacker News item to NewsItem format
   */
  private static convertToNewsItem(story: HackerNewsItem): NewsItem | null {
    if (!story.url || story.deleted || story.dead) {
      return null;
    }

    // Create description from title and score
    const description = `Score: ${story.score} | Comments: ${
      story.descendants || 0
    } | Posted by ${story.by}`;

    return {
      id: ContentProcessor.generateId(story.url),
      title: story.title,
      description: ContentProcessor.generateSummary(description),
      url: story.url,
      publishedAt: new Date(story.time * 1000), // Convert Unix timestamp to Date
      source: "hackernews",
      sourceName: "Hacker News",
      author: story.by,
      tags: [],
    };
  }

  /**
   * Fetch stories with error handling and retry logic
   */
  static async fetchStoriesWithRetry(
    limit: number = 50,
    retries: number = 3
  ): Promise<NewsItem[]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.fetchTopStories(limit);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Attempt ${attempt} failed:`, lastError);

        if (attempt === retries) {
          throw new Error("All retry attempts failed");
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }

    throw new Error("All retry attempts failed");
  }
}
