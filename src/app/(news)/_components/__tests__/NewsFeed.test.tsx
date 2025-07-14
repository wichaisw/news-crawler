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

const mockDates = ["2025-07-14", "2025-07-13", "2025-07-12"];

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
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Test Article 1")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Article 2")).toBeInTheDocument();
    expect(screen.getByText("Test description 1")).toBeInTheDocument();
    expect(screen.getByText("Test description 2")).toBeInTheDocument();
  });

  it("renders error state when news fetch fails", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call failure
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

  it("renders error state when news fetch throws", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call throws
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch news")).toBeInTheDocument();
    });
  });

  it("renders empty state when no articles", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call with empty articles
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("No news articles found.")).toBeInTheDocument();
    });
    expect(screen.getByText(/Try running the crawler/)).toBeInTheDocument();
  });

  it("retries fetch when retry button is clicked", async () => {
    const user = userEvent.setup();

    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // First news call fails
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to fetch news" }),
    } as Response);

    // Second news call succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch news")).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: "Retry" });
    await user.click(retryButton);

    // Verify that fetch was called multiple times (source + news calls)
    expect(mockFetch).toHaveBeenCalledTimes(3);
  }, 10000);

  it("calls correct API endpoints", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/source");
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/news?limit=20&page=1&date=2025-07-14"
      );
    });
  });

  it("renders articles in grid layout", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
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
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      const articles = screen.getAllByRole("article");
      expect(articles).toHaveLength(2);
    });
  });

  it("handles network timeout gracefully", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call timeout
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
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getAllByText("The Verge")).toHaveLength(2);
    });
  });

  it("displays author information correctly", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("By Test Author 1")).toBeInTheDocument();
      expect(screen.getByText("By Test Author 2")).toBeInTheDocument();
    });
  });

  it("shows date selector with available dates", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(screen.getByText("Today")).toBeInTheDocument();
    });
  });

  it("shows article count and date information", async () => {
    // Mock source API call (dates)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dates: mockDates }),
    } as Response);

    // Mock news API call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        articles: mockArticles,
        total: 2,
        page: 1,
        limit: 20,
        hasMore: false,
      }),
    } as Response);

    render(<NewsFeed />);

    await waitFor(() => {
      expect(
        screen.getByText("Showing 2 of 2 articles for 2025-07-14")
      ).toBeInTheDocument();
    });
  });
});
