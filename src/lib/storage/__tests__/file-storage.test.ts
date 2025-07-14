import { FileStorage } from "../file-storage";
import fs from "fs/promises";

// Mock fs module
jest.mock("fs/promises");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("FileStorage", () => {
  const mockArticles = [
    {
      id: "test-1",
      title: "Test Article 1",
      description: "Test description 1",
      summary: "Test summary 1",
      url: "https://example.com/1",
      publishedAt: new Date("2025-07-14T10:00:00Z"),
      source: "theverge",
      sourceName: "The Verge",
      author: "Test Author",
      tags: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("saveNewsData", () => {
    it("should save news data to file", async () => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);

      await FileStorage.saveNewsData("theverge", "2025-07-14", mockArticles);

      expect(mockedFs.mkdir).toHaveBeenCalled();
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it("should handle directory creation errors", async () => {
      mockedFs.mkdir.mockRejectedValue(new Error("Permission denied"));

      await expect(
        FileStorage.saveNewsData("theverge", "2025-07-14", mockArticles)
      ).rejects.toThrow("Permission denied");
    });
  });

  describe("loadNewsData", () => {
    it("should load news data from file", async () => {
      const mockData = {
        date: "2025-07-14",
        source: "theverge",
        articles: mockArticles.map((article) => ({
          ...article,
          publishedAt: article.publishedAt.toISOString(),
        })),
      };

      mockedFs.readFile.mockResolvedValue(JSON.stringify(mockData));

      const result = await FileStorage.loadNewsData("theverge", "2025-07-14");

      expect(mockedFs.readFile).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("test-1");
    });

    it("should return empty array when file does not exist", async () => {
      mockedFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await FileStorage.loadNewsData("theverge", "2025-07-14");

      expect(result).toEqual([]);
    });
  });

  describe("getAvailableDates", () => {
    it("should return sorted dates from source directory", async () => {
      const mockFiles = [
        "2025-07-14.json",
        "2025-07-13.json",
        "2025-07-15.json",
      ];
      mockedFs.readdir.mockResolvedValue(mockFiles as any);

      const result = await FileStorage.getAvailableDates("theverge");

      expect(mockedFs.readdir).toHaveBeenCalled();
      expect(result).toEqual(["2025-07-15", "2025-07-14", "2025-07-13"]);
    });

    it("should return empty array when directory does not exist", async () => {
      mockedFs.readdir.mockRejectedValue(new Error("Directory not found"));

      const result = await FileStorage.getAvailableDates("theverge");

      expect(result).toEqual([]);
    });
  });

  describe("getSources", () => {
    it("should return list of source directories", async () => {
      const mockSources = ["theverge", "techcrunch", "blognone"];
      mockedFs.readdir.mockResolvedValue(mockSources as any);
      mockedFs.stat.mockResolvedValue({ isDirectory: () => true } as any);

      const result = await FileStorage.getSources();

      expect(mockedFs.readdir).toHaveBeenCalled();
      expect(result).toEqual(mockSources);
    });

    it("should return empty array when sources directory does not exist", async () => {
      mockedFs.readdir.mockRejectedValue(new Error("Directory not found"));

      const result = await FileStorage.getSources();

      expect(result).toEqual([]);
    });
  });
});
