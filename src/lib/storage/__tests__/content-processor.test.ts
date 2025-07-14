import { ContentProcessor } from "../content-processor";

describe("ContentProcessor", () => {
  describe("generateSummary", () => {
    it("should truncate long text to 150 characters", () => {
      const longText = "A".repeat(200);
      const summary = ContentProcessor.generateSummary(longText);
      expect(summary.length).toBeLessThanOrEqual(150);
      expect(summary).toMatch(/^A{100,150}/);
    });

    it("should return original text if shorter than 150 characters", () => {
      const shortText = "This is a short text";
      const summary = ContentProcessor.generateSummary(shortText);
      expect(summary).toBe(shortText);
    });

    it("should handle empty string", () => {
      const summary = ContentProcessor.generateSummary("");
      expect(summary).toBe("");
    });

    it("should handle null and undefined", () => {
      expect(ContentProcessor.generateSummary(null as unknown as string)).toBe(
        ""
      );
      expect(
        ContentProcessor.generateSummary(undefined as unknown as string)
      ).toBe("");
    });
  });

  describe("truncateAtWordBoundary", () => {
    it("should truncate text to specified length", () => {
      const text = "This is a test text that should be truncated";
      const truncated = ContentProcessor.truncateAtWordBoundary(text, 20);
      expect(truncated.length).toBeLessThanOrEqual(20);
      expect(truncated).toMatch(/^This is a test text/);
    });

    it("should truncate at word boundary", () => {
      const text = "This is a very long text that needs truncation";
      const truncated = ContentProcessor.truncateAtWordBoundary(text, 15);
      expect(truncated).toBe("This is a very");
    });

    it("should return original text if shorter than limit", () => {
      const text = "Short text";
      const truncated = ContentProcessor.truncateAtWordBoundary(text, 20);
      expect(truncated).toBe(text);
    });
  });

  describe("extractFirstParagraph", () => {
    it("should extract first paragraph from HTML", () => {
      const html = "<p>First paragraph</p><p>Second paragraph</p>";
      const result = ContentProcessor.extractFirstParagraph(html);
      expect(result).toBe("First paragraph");
    });

    it("should handle text without HTML tags", () => {
      const text = "Plain text content";
      const result = ContentProcessor.extractFirstParagraph(text);
      expect(result).toBe(text);
    });

    it("should handle empty string", () => {
      const result = ContentProcessor.extractFirstParagraph("");
      expect(result).toBe("");
    });

    it("should handle HTML with nested tags", () => {
      const html =
        "<p>First <strong>paragraph</strong> with <em>formatting</em></p>";
      const result = ContentProcessor.extractFirstParagraph(html);
      expect(result).toBe("First paragraph with formatting");
    });
  });

  describe("generateId", () => {
    it("should generate consistent ID for same URL", () => {
      const url = "https://example.com/article";
      const id1 = ContentProcessor.generateId(url);
      const id2 = ContentProcessor.generateId(url);
      expect(id1).toBe(id2);
    });

    it("should generate different IDs for different URLs", () => {
      const url1 = "https://example.com/article1";
      const url2 = "https://example.com/article2";
      const id1 = ContentProcessor.generateId(url1);
      const id2 = ContentProcessor.generateId(url2);
      expect(id1).not.toBe(id2);
    });

    it("should generate alphanumeric ID", () => {
      const url = "https://example.com/article";
      const id = ContentProcessor.generateId(url);
      expect(id).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe("normalizeUrl", () => {
    it("should convert relative URL to absolute", () => {
      const relativeUrl = "/article/123";
      const baseUrl = "https://example.com";
      const normalized = ContentProcessor.normalizeUrl(relativeUrl, baseUrl);
      expect(normalized).toBe("https://example.com/article/123");
    });

    it("should return absolute URL as is", () => {
      const absoluteUrl = "https://example.com/article/123";
      const baseUrl = "https://example.com";
      const normalized = ContentProcessor.normalizeUrl(absoluteUrl, baseUrl);
      expect(normalized).toBe(absoluteUrl);
    });

    it("should handle URLs with query parameters", () => {
      const relativeUrl = "/article/123?utm_source=test";
      const baseUrl = "https://example.com";
      const normalized = ContentProcessor.normalizeUrl(relativeUrl, baseUrl);
      expect(normalized).toBe(
        "https://example.com/article/123?utm_source=test"
      );
    });
  });

  describe("sanitizeText", () => {
    it("should remove HTML tags", () => {
      const html = "<p>This is <strong>formatted</strong> text</p>";
      const sanitized = ContentProcessor.sanitizeText(html);
      expect(sanitized).toBe("This is formatted text");
    });

    it("should normalize whitespace", () => {
      const text = "  Multiple    spaces   and\ttabs  ";
      const sanitized = ContentProcessor.sanitizeText(text);
      expect(sanitized).toBe("Multiple spaces and tabs");
    });

    it("should handle empty string", () => {
      const sanitized = ContentProcessor.sanitizeText("");
      expect(sanitized).toBe("");
    });
  });
});
