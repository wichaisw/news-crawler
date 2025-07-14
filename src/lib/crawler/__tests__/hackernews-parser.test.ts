import { HackerNewsParser } from "../parsers/hackernews-parser";

describe("HackerNewsParser", () => {
  describe("parse", () => {
    it("should parse Hacker News HTML and extract stories", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story1">Test Story 1</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="score">100 points</span>
                  by <a class="hnuser">testuser1</a>
                  <span class="age">2 hours ago</span>
                  <a href="item?id=123">50 comments</a>
                </td>
              </tr>
              <tr class="athing" id="456">
                <td class="title">
                  <a href="https://example.com/story2">Test Story 2</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="score">200 points</span>
                  by <a class="hnuser">testuser2</a>
                  <span class="age">1 hour ago</span>
                  <a href="item?id=456">25 comments</a>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);

      expect(articles).toHaveLength(2);
      expect(articles[0].title).toBe("Test Story 1");
      expect(articles[0].url).toBe("https://example.com/story1");
      expect(articles[0].author).toBe("testuser1");
      expect(articles[0].source).toBe("hackernews");
      expect(articles[0].sourceName).toBe("Hacker News");
      expect(articles[0].description).toContain("Score: 100");
      expect(articles[0].description).toContain("Comments: 50");

      expect(articles[1].title).toBe("Test Story 2");
      expect(articles[1].url).toBe("https://example.com/story2");
      expect(articles[1].author).toBe("testuser2");
      expect(articles[1].description).toContain("Score: 200");
      expect(articles[1].description).toContain("Comments: 25");
    });

    it("should handle stories without authors", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="score">100 points</span>
                  <span class="age">2 hours ago</span>
                  <a href="item?id=123">50 comments</a>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);

      expect(articles).toHaveLength(1);
      expect(articles[0].author).toBe("Anonymous");
    });

    it("should handle stories without scores", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  by <a class="hnuser">testuser</a>
                  <span class="age">2 hours ago</span>
                  <a href="item?id=123">50 comments</a>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);

      expect(articles).toHaveLength(1);
      expect(articles[0].description).toContain("Score: 0");
    });

    it("should handle stories without comments", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="score">100 points</span>
                  by <a class="hnuser">testuser</a>
                  <span class="age">2 hours ago</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);

      expect(articles).toHaveLength(1);
      expect(articles[0].description).toContain("Comments: 0");
    });

    it("should handle HTML without stories", () => {
      const emptyHTML = "<html><body><div>No stories here</div></body></html>";

      const articles = HackerNewsParser.parse(emptyHTML);

      expect(articles).toHaveLength(0);
    });

    it("should handle stories without URLs", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <span>Story without link</span>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="score">100 points</span>
                  by <a class="hnuser">testuser</a>
                  <span class="age">2 hours ago</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);

      expect(articles).toHaveLength(0);
    });

    it("should normalize URLs correctly", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="/relative/path">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="score">100 points</span>
                  by <a class="hnuser">testuser</a>
                  <span class="age">2 hours ago</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(
        mockHTML,
        "https://news.ycombinator.com"
      );

      expect(articles[0].url).toBe(
        "https://news.ycombinator.com/relative/path"
      );
    });
  });

  describe("parseRelativeTime", () => {
    it("should parse hours correctly", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="age">3 hours ago</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);
      const now = new Date();
      const expectedTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);

      expect(articles[0].publishedAt).toBeInstanceOf(Date);
      const publishedAt = articles[0].publishedAt as Date;

      // Allow for small time differences due to test execution time
      const timeDiff = Math.abs(publishedAt.getTime() - expectedTime.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    it("should parse minutes correctly", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="age">30 minutes ago</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);
      const now = new Date();
      const expectedTime = new Date(now.getTime() - 30 * 60 * 1000);

      const publishedAt = articles[0].publishedAt as Date;
      const timeDiff = Math.abs(publishedAt.getTime() - expectedTime.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    it("should parse days correctly", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="age">2 days ago</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);
      const now = new Date();
      const expectedTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      const publishedAt = articles[0].publishedAt as Date;
      const timeDiff = Math.abs(publishedAt.getTime() - expectedTime.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });

    it("should default to current time for unknown formats", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td class="title">
                  <a href="https://example.com/story">Test Story</a>
                </td>
              </tr>
              <tr>
                <td class="subtext">
                  <span class="age">unknown time format</span>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const articles = HackerNewsParser.parse(mockHTML);
      const now = new Date();

      const publishedAt = articles[0].publishedAt as Date;
      const timeDiff = Math.abs(publishedAt.getTime() - now.getTime());
      expect(timeDiff).toBeLessThan(1000);
    });
  });

  describe("extractStoryIds", () => {
    it("should extract story IDs from HTML", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td>Story 1</td>
              </tr>
              <tr class="athing" id="456">
                <td>Story 2</td>
              </tr>
              <tr class="athing" id="789">
                <td>Story 3</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const ids = HackerNewsParser.extractStoryIds(mockHTML);

      expect(ids).toEqual([123, 456, 789]);
    });

    it("should handle invalid IDs", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td>Valid ID</td>
              </tr>
              <tr class="athing" id="invalid">
                <td>Invalid ID</td>
              </tr>
              <tr class="athing" id="456">
                <td>Valid ID</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const ids = HackerNewsParser.extractStoryIds(mockHTML);

      expect(ids).toEqual([123, 456]);
    });
  });

  describe("getNextPageUrl", () => {
    it("should extract next page URL", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td>Story</td>
              </tr>
            </table>
            <a class="morelink" href="news?p=2">More</a>
          </body>
        </html>
      `;

      const nextUrl = HackerNewsParser.getNextPageUrl(
        mockHTML,
        "https://news.ycombinator.com"
      );

      expect(nextUrl).toBe("https://news.ycombinator.com/news?p=2");
    });

    it("should return null when no more link exists", () => {
      const mockHTML = `
        <html>
          <body>
            <table>
              <tr class="athing" id="123">
                <td>Story</td>
              </tr>
            </table>
          </body>
        </html>
      `;

      const nextUrl = HackerNewsParser.getNextPageUrl(
        mockHTML,
        "https://news.ycombinator.com"
      );

      expect(nextUrl).toBeNull();
    });
  });
});
