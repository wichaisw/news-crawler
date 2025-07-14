import { BlognoneParser } from "../parsers/blognone-parser";

describe("BlognoneParser", () => {
  const mockRSS = `
    <?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0">
      <channel>
        <title>Blognone</title>
        <link>https://www.blognone.com</link>
        <description>Thai tech news and reviews</description>
        <item>
          <title>Test Article Title</title>
          <link>https://www.blognone.com/test-article</link>
          <description>This is a test article description with some content.</description>
          <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
          <guid>https://www.blognone.com/test-article</guid>
        </item>
        <item>
          <title>Another Test Article</title>
          <link>https://www.blognone.com/another-test</link>
          <description>Another test article description.</description>
          <pubDate>Mon, 15 Jan 2024 11:00:00 +0000</pubDate>
          <guid>https://www.blognone.com/another-test</guid>
        </item>
      </channel>
    </rss>
  `;

  describe("parseRSS", () => {
    it("should parse RSS feed and extract articles", () => {
      const articles = BlognoneParser.parseRSS(mockRSS);

      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("Test Article Title");
      expect(articles[0].description).toBe(
        "This is a test article description with some content."
      );
      expect(articles[0].source).toBe("blognone");
      expect(articles[0].sourceName).toBe("Blognone");
      expect(articles[0].author).toBe("Blognone");
    });

    it("should handle RSS without items", () => {
      const emptyRSS = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Blognone</title>
            <link>https://www.blognone.com</link>
            <description>Thai tech news and reviews</description>
          </channel>
        </rss>
      `;

      const articles = BlognoneParser.parseRSS(emptyRSS);

      expect(articles).toHaveLength(0);
    });

    it("should handle items without required fields", () => {
      const incompleteRSS = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Blognone</title>
            <link>https://www.blognone.com</link>
            <description>Thai tech news and reviews</description>
            <item>
              <title>Test Article</title>
              <!-- Missing link -->
            </item>
            <item>
              <!-- Missing title -->
              <link>https://www.blognone.com/test</link>
            </item>
          </channel>
        </rss>
      `;

      const articles = BlognoneParser.parseRSS(incompleteRSS);

      expect(articles).toHaveLength(0);
    });

    it("should decode HTML entities in titles", () => {
      const rssWithEntities = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Blognone</title>
            <link>https://www.blognone.com</link>
            <description>Thai tech news and reviews</description>
            <item>
              <title>Test Article &amp; Review</title>
              <link>https://www.blognone.com/test-article</link>
              <description>This is a test article.</description>
              <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
              <guid>https://www.blognone.com/test-article</guid>
            </item>
          </channel>
        </rss>
      `;

      const articles = BlognoneParser.parseRSS(rssWithEntities);

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("Test Article & Review");
    });

    it("should extract images from description", () => {
      const rssWithImage = `
        <?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Blognone</title>
            <link>https://www.blognone.com</link>
            <description>Thai tech news and reviews</description>
            <item>
              <title>Test Article</title>
              <link>https://www.blognone.com/test-article</link>
              <description><![CDATA[<img src="https://www.blognone.com/image.jpg" alt="Test" />This is a test article.]]></description>
              <pubDate>Mon, 15 Jan 2024 10:00:00 +0000</pubDate>
              <guid>https://www.blognone.com/test-article</guid>
            </item>
          </channel>
        </rss>
      `;

      const articles = BlognoneParser.parseRSS(rssWithImage);

      expect(articles).toHaveLength(1);
      expect(articles[0].imageUrl).toBe("https://www.blognone.com/image.jpg");
    });
  });

  describe("parse (HTML fallback)", () => {
    const mockHTML = `
      <html>
        <body>
          <article>
            <h2><a href="/test-article">Test Article Title</a></h2>
            <div class="excerpt">Test article description</div>
            <time datetime="2024-01-15T10:00:00Z"></time>
            <div class="author">Test Author</div>
          </article>
        </body>
      </html>
    `;

    it("should parse HTML and extract articles", () => {
      const articles = BlognoneParser.parse(mockHTML);

      expect(articles).toHaveLength(1);
      expect(articles[0].title).toBe("Test Article Title");
      expect(articles[0].description).toBe("Test article description");
      expect(articles[0].author).toBe("Test Author");
    });

    it("should handle HTML without articles", () => {
      const emptyHTML = "<html><body><div>No articles here</div></body></html>";

      const articles = BlognoneParser.parse(emptyHTML);

      expect(articles).toHaveLength(0);
    });
  });
});
