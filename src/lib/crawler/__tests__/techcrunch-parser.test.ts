import { TechCrunchParser } from "../parsers/techcrunch-parser";

describe("TechCrunchParser", () => {
  const mockRSS = `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>TechCrunch</title>
        <link>https://techcrunch.com</link>
        <description>TechCrunch is a leading technology media property</description>
        <item>
          <title>Test Article Title</title>
          <link>https://techcrunch.com/test-article</link>
          <description>This is a test article description with some content.</description>
          <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
          <guid>https://techcrunch.com/test-article</guid>
          <dc:creator>Test Author</dc:creator>
        </item>
        <item>
          <title>Another Test Article</title>
          <link>https://techcrunch.com/another-test</link>
          <description>Another test article description.</description>
          <pubDate>Mon, 15 Jan 2024 11:00:00 +0000</pubDate>
          <guid>https://techcrunch.com/another-test</guid>
          <dc:creator>Another Author</dc:creator>
        </item>
      </channel>
    </rss>
  `;

  describe("parseRSS", () => {
    it("should parse RSS feed and extract articles", () => {
      const articles = TechCrunchParser.parseRSS(mockRSS);

      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("Test Article Title");
      expect(articles[0].url).toBe("https://techcrunch.com/test-article");
      expect(articles[0].description).toBe(
        "This is a test article description with some content."
      );
      expect(articles[0].author).toBe("Test Author");
      expect(articles[0].source).toBe("techcrunch");
      expect(articles[0].sourceName).toBe("TechCrunch");
    });

    it("should generate unique IDs for articles", () => {
      const articles = TechCrunchParser.parseRSS(mockRSS);

      expect(articles[0].id).toBeDefined();
      expect(articles[1].id).toBeDefined();
      expect(articles[0].id).not.toBe(articles[1].id);
    });

    it("should handle missing optional fields", () => {
      const rssWithMissingFields = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Article Without Author</title>
              <link>https://techcrunch.com/no-author</link>
              <description>Article description</description>
              <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
              <guid>https://techcrunch.com/no-author</guid>
            </item>
          </channel>
        </rss>
      `;

      const articles = TechCrunchParser.parseRSS(rssWithMissingFields);

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("Article Without Author");
      expect(articles[0].author).toBe("TechCrunch");
    });

    it("should handle empty RSS feed", () => {
      const emptyRSS = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>TechCrunch</title>
            <link>https://techcrunch.com</link>
          </channel>
        </rss>
      `;

      const articles = TechCrunchParser.parseRSS(emptyRSS);

      expect(articles).toHaveLength(0);
    });

    it("should normalize URLs correctly", () => {
      const rssWithRelativeUrl = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Test Article</title>
              <link>/relative-path/article</link>
              <description>Test description</description>
              <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
              <guid>/relative-path/article</guid>
            </item>
          </channel>
        </rss>
      `;

      const articles = TechCrunchParser.parseRSS(
        rssWithRelativeUrl,
        "https://techcrunch.com"
      );

      expect(articles[0].url).toBe(
        "https://techcrunch.com/relative-path/article"
      );
    });

    it("should parse dates correctly", () => {
      const articles = TechCrunchParser.parseRSS(mockRSS);

      expect(articles[0].publishedAt).toBeInstanceOf(Date);
      const date = articles[0].publishedAt as Date;
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is month 0 (0-indexed)
      expect(date.getDate()).toBe(15);
      // Check UTC time to avoid timezone issues
      expect(date.getUTCHours()).toBe(10);
    });

    it("should use title as fallback for missing description", () => {
      const rssWithoutDescription = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Article Title</title>
              <link>https://techcrunch.com/test</link>
              <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
              <guid>https://techcrunch.com/test</guid>
            </item>
          </channel>
        </rss>
      `;

      const articles = TechCrunchParser.parseRSS(rssWithoutDescription);

      expect(articles[0].description).toBe("Article Title");
    });

    it("should handle HTML entities in content", () => {
      const rssWithEntities = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item>
              <title>Article with &amp; entities &lt;test&gt;</title>
              <link>https://techcrunch.com/test</link>
              <description>Description with &quot;quotes&quot; and &amp; symbols</description>
              <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
              <guid>https://techcrunch.com/test</guid>
            </item>
          </channel>
        </rss>
      `;

      const articles = TechCrunchParser.parseRSS(rssWithEntities);

      expect(articles[0].title).toBe("Article with & entities <test>");
      expect(articles[0].description).toBe(
        'Description with "quotes" and & symbols'
      );
    });
  });

  describe("parse (HTML fallback)", () => {
    const mockHTML = `
      <html>
        <body>
          <article>
            <h2><a href="/test-article">Test Article Title</a></h2>
            <div class="post-block__content">Test article description</div>
            <time datetime="2025-07-14T10:00:00Z"></time>
            <div class="post-block__author">Test Author</div>
          </article>
        </body>
      </html>
    `;

    it("should parse HTML and extract articles", () => {
      const articles = TechCrunchParser.parse(mockHTML);

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("Test Article Title");
      expect(articles[0].description).toBe("Test article description");
      expect(articles[0].author).toBe("Test Author");
    });

    it("should handle HTML without articles", () => {
      const emptyHTML = "<html><body><div>No articles here</div></body></html>";

      const articles = TechCrunchParser.parse(emptyHTML);

      expect(articles).toHaveLength(0);
    });
  });
});
