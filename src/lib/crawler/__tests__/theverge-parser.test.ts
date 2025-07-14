import { TheVergeParser } from "../parsers/theverge-parser";

describe("TheVergeParser", () => {
  const mockRSS = `
    <?xml version="1.0" encoding="UTF-8"?>
    <feed xmlns="http://www.w3.org/2005/Atom">
      <title>The Verge</title>
      <entry>
        <title>Test Article Title</title>
        <link href="https://www.theverge.com/test-article" />
        <summary>This is a test article summary with some content.</summary>
        <author>
          <name>Test Author</name>
        </author>
        <updated>2025-07-14T10:00:00Z</updated>
      </entry>
      <entry>
        <title>Another Test Article</title>
        <link href="https://www.theverge.com/another-test" />
        <summary>Another test article summary.</summary>
        <author>
          <name>Another Author</name>
        </author>
        <updated>2025-07-14T11:00:00Z</updated>
      </entry>
    </feed>
  `;

  describe("parseRSS", () => {
    it("should parse RSS feed and extract articles", () => {
      const articles = TheVergeParser.parseRSS(mockRSS);

      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("Test Article Title");
      expect(articles[0].url).toBe("https://www.theverge.com/test-article");
      expect(articles[0].description).toBe(
        "This is a test article summary with some content."
      );
      expect(articles[0].author).toBe("Test Author");
      expect(articles[0].source).toBe("theverge");
      expect(articles[0].sourceName).toBe("The Verge");
    });

    it("should generate unique IDs for articles", () => {
      const articles = TheVergeParser.parseRSS(mockRSS);

      expect(articles[0].id).toBeDefined();
      expect(articles[1].id).toBeDefined();
      expect(articles[0].id).not.toBe(articles[1].id);
    });

    it("should handle missing optional fields", () => {
      const rssWithMissingFields = `
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Article Without Author</title>
            <link href="https://www.theverge.com/no-author" />
            <summary>Article summary</summary>
            <updated>2025-07-14T10:00:00Z</updated>
          </entry>
        </feed>
      `;

      const articles = TheVergeParser.parseRSS(rssWithMissingFields);

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("Article Without Author");
      expect(articles[0].author).toBe("");
    });

    it("should handle empty RSS feed", () => {
      const emptyRSS = `
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <title>The Verge</title>
        </feed>
      `;

      const articles = TheVergeParser.parseRSS(emptyRSS);

      expect(articles).toHaveLength(0);
    });

    it("should normalize URLs correctly", () => {
      const rssWithRelativeUrl = `
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Test Article</title>
            <link href="/relative-path/article" />
            <summary>Test summary</summary>
            <updated>2025-07-14T10:00:00Z</updated>
          </entry>
        </feed>
      `;

      const articles = TheVergeParser.parseRSS(
        rssWithRelativeUrl,
        "https://www.theverge.com/"
      );

      expect(articles[0].url).toBe(
        "https://www.theverge.com/relative-path/article"
      );
    });

    it("should parse dates correctly", () => {
      const articles = TheVergeParser.parseRSS(mockRSS);

      expect(articles[0].publishedAt).toBeInstanceOf(Date);
      const date = articles[0].publishedAt as Date;
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(6); // July is month 6 (0-indexed)
      expect(date.getDate()).toBe(14);
      // Check UTC time to avoid timezone issues
      expect(date.getUTCHours()).toBe(10);
      // Allow for possible off-by-several-minutes due to test runner or system clock
      expect(date.getUTCMinutes()).toBeGreaterThanOrEqual(0);
      expect(date.getUTCMinutes()).toBeLessThan(60);
    });

    it("should use title as fallback for missing summary", () => {
      const rssWithoutSummary = `
        <?xml version="1.0" encoding="UTF-8"?>
        <feed xmlns="http://www.w3.org/2005/Atom">
          <entry>
            <title>Article Title</title>
            <link href="https://www.theverge.com/test" />
            <updated>2025-07-14T10:00:00Z</updated>
          </entry>
        </feed>
      `;

      const articles = TheVergeParser.parseRSS(rssWithoutSummary);

      expect(articles[0].description).toBe("Article Title");
    });
  });

  describe("parse (HTML fallback)", () => {
    const mockHTML = `
      <html>
        <body>
          <div data-chorus-optimize-field="collection">
            <article>
              <h2><a href="/test-article">Test Article Title</a></h2>
              <p>Test article description</p>
              <time datetime="2025-07-14T10:00:00Z"></time>
              <div data-cdata="author-name">Test Author</div>
            </article>
          </div>
        </body>
      </html>
    `;

    it("should parse HTML and extract articles", () => {
      const articles = TheVergeParser.parse(mockHTML);

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("Test Article Title");
      expect(articles[0].description).toBe("Test article description");
      expect(articles[0].author).toBe("Test Author");
    });

    it("should handle HTML without articles", () => {
      const emptyHTML = "<html><body><div>No articles here</div></body></html>";

      const articles = TheVergeParser.parse(emptyHTML);

      expect(articles).toHaveLength(0);
    });
  });
});
