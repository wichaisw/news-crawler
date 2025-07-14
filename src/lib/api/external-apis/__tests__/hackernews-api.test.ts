import { HackerNewsApi, HackerNewsItem } from "../hackernews-api";

// Mock fetch globally
global.fetch = jest.fn();

describe("HackerNewsApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchTopStories", () => {
    it("should fetch and convert top stories correctly", async () => {
      const mockStoryIds = [1, 2, 3];
      const mockStories: HackerNewsItem[] = [
        {
          id: 1,
          type: "story",
          by: "testuser1",
          time: 1640995200, // 2022-01-01 00:00:00 UTC
          url: "https://example.com/story1",
          score: 100,
          title: "Test Story 1",
          descendants: 50,
        },
        {
          id: 2,
          type: "story",
          by: "testuser2",
          time: 1640995260, // 2022-01-01 00:01:00 UTC
          url: "https://example.com/story2",
          score: 200,
          title: "Test Story 2",
          descendants: 25,
        },
        {
          id: 3,
          type: "comment", // This should be filtered out
          by: "testuser3",
          time: 1640995320,
          text: "This is a comment",
          score: 10,
          title: "Comment Title",
        },
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoryIds,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories[0],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories[1],
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStories[2],
        });

      const result = await HackerNewsApi.fetchTopStories(3);

      expect(result).toHaveLength(2); // Only stories, not comments
      expect(result[0].title).toBe("Test Story 1");
      expect(result[0].author).toBe("testuser1");
      expect(result[0].source).toBe("hackernews");
      expect(result[0].sourceName).toBe("Hacker News");
      expect(result[0].description).toContain("Score: 100");
      expect(result[0].description).toContain("Comments: 50");
      expect(result[0].publishedAt).toEqual(new Date(1640995200 * 1000));
    });

    it("should handle API errors gracefully", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(HackerNewsApi.fetchTopStories()).rejects.toThrow(
        "Failed to fetch top stories: 500"
      );
    });

    it("should limit the number of stories", async () => {
      const mockStoryIds = Array.from({ length: 200 }, (_, i) => i + 1);
      const mockStory: HackerNewsItem = {
        id: 1,
        type: "story",
        by: "testuser",
        time: 1640995200,
        url: "https://example.com/story",
        score: 100,
        title: "Test Story",
        descendants: 50,
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoryIds,
        })
        .mockResolvedValue({
          ok: true,
          json: async () => mockStory,
        });

      const result = await HackerNewsApi.fetchTopStories(50);

      expect(result).toHaveLength(50);
      expect(fetch).toHaveBeenCalledTimes(51); // 1 for story IDs + 50 for individual stories
    });

    it("should filter out stories without URLs", async () => {
      const mockStoryIds = [1];
      const mockStory: HackerNewsItem = {
        id: 1,
        type: "story",
        by: "testuser",
        time: 1640995200,
        score: 100,
        title: "Test Story Without URL",
        descendants: 50,
        // No URL - should be filtered out
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoryIds,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStory,
        });

      const result = await HackerNewsApi.fetchTopStories(1);

      expect(result).toHaveLength(0);
    });

    it("should filter out deleted and dead stories", async () => {
      const mockStoryIds = [1];
      const mockStory: HackerNewsItem = {
        id: 1,
        type: "story",
        by: "testuser",
        time: 1640995200,
        url: "https://example.com/story",
        score: 100,
        title: "Deleted Story",
        descendants: 50,
        deleted: true, // Should be filtered out
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoryIds,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStory,
        });

      const result = await HackerNewsApi.fetchTopStories(1);

      expect(result).toHaveLength(0);
    });
  });

  describe("fetchStory", () => {
    it("should fetch a single story correctly", async () => {
      const mockStory: HackerNewsItem = {
        id: 1,
        type: "story",
        by: "testuser",
        time: 1640995200,
        url: "https://example.com/story",
        score: 100,
        title: "Test Story",
        descendants: 50,
      };

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockStory,
      });

      const result = await HackerNewsApi.fetchStory(1);

      expect(result).toEqual(mockStory);
      expect(fetch).toHaveBeenCalledWith(
        "https://hacker-news.firebaseio.com/v0/item/1.json"
      );
    });

    it("should return null for failed requests", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await HackerNewsApi.fetchStory(999);

      expect(result).toBeNull();
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      const result = await HackerNewsApi.fetchStory(1);

      expect(result).toBeNull();
    });
  });

  describe("fetchStoriesWithRetry", () => {
    it("should succeed on first attempt", async () => {
      const mockStoryIds = [1];
      const mockStory: HackerNewsItem = {
        id: 1,
        type: "story",
        by: "testuser",
        time: 1640995200,
        url: "https://example.com/story",
        score: 100,
        title: "Test Story",
        descendants: 50,
      };

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoryIds,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStory,
        });

      const result = await HackerNewsApi.fetchStoriesWithRetry(1, 3);

      expect(result).toHaveLength(1);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it("should retry on failure and succeed", async () => {
      const mockStoryIds = [1];
      const mockStory: HackerNewsItem = {
        id: 1,
        type: "story",
        by: "testuser",
        time: 1640995200,
        url: "https://example.com/story",
        score: 100,
        title: "Test Story",
        descendants: 50,
      };

      // First attempt fails, second succeeds
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStoryIds,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockStory,
        });

      const result = await HackerNewsApi.fetchStoriesWithRetry(1, 3);

      expect(result).toHaveLength(1);
      expect(fetch).toHaveBeenCalledTimes(3); // 1 failed + 2 successful
    });

    it("should throw error after all retries fail", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(HackerNewsApi.fetchStoriesWithRetry(1, 2)).rejects.toThrow(
        "All retry attempts failed"
      );

      expect(fetch).toHaveBeenCalledTimes(2); // 2 retry attempts
    });
  });
});
