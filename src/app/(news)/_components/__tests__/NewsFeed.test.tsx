import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsFeed from "../NewsFeed";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

const mockArticles = [
  {
    id: "test-1",
    title: "Test Article 1",
    description: "Test description 1",
    url: "https://example.com/1",
    publishedAt: "2024-07-14T10:00:00Z",
    source: "theverge",
    sourceName: "The Verge",
    author: "Test Author 1",
    tags: [],
  },
  {
    id: "test-2",
    title: "Test Article 2",
    description: "Test description 2",
    url: "https://example.com/2",
    publishedAt: "2024-07-14T11:00:00Z",
    source: "theverge",
    sourceName: "The Verge",
    author: "Test Author 2",
    tags: [],
  },
];

describe("NewsFeed", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<NewsFeed />);

    expect(screen.getByText("Loading news...")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument(); // Spinner
  });

  it("renders articles when fetch succeeds", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Test Article 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Article 2")).toBeInTheDocument();
    expect(screen.getByText("Test description 1")).toBeInTheDocument();
    expect(screen.getByText("Test description 2")).toBeInTheDocument();
  });

  it("renders error state when fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch news" }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch news")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders error state when fetch throws", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch news")).toBeInTheDocument();
    });
  });

  it("renders empty state when no articles", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: [] }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("No news articles found.")).toBeInTheDocument();
    });
    expect(screen.getByText(/Try running the crawler/)).toBeInTheDocument();
  });

  it("retries fetch when retry button is clicked", async () => {
    const user = userEvent.setup();

    // First call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch news" }),
    } as Response);

    // Second call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch news")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Retry" });
    await user.click(retryButton);

    // Just verify that fetch was called twice (retry was triggered)
    expect(mockFetch).toHaveBeenCalledTimes(2);
  }, 10000);

  it("calls correct API endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/news?limit=20");
    });
  });

  it("renders articles in grid layout", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      const grid = screen.getByRole("main").querySelector(".grid");
      expect(grid).toHaveClass(
        "grid-cols-1",
        "md:grid-cols-2",
        "lg:grid-cols-3"
      );
    });
  });

  it("renders correct number of article cards", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles).toHaveLength(2);
    });
  });

  it("handles network timeout gracefully", async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 100)
        )
    );

    render(<NewsFeed />);

    await waitFor(
      () => {
        expect(screen.getByText("Failed to fetch news")).toBeInTheDocument();
      },
      { timeout: 200 }
    );
  });

  it("displays source information correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getAllByText("The Verge")).toHaveLength(2);
    });
  });

  it("displays author information correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ articles: mockArticles }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("By Test Author 1")).toBeInTheDocument();
      expect(screen.getByText("By Test Author 2")).toBeInTheDocument();
    });
  });
});
