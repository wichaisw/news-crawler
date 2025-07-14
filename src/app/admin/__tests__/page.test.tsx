import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AdminPage from "../page";

// Mock fetch
global.fetch = jest.fn();

describe("AdminPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render admin page with sources", async () => {
    const mockSources = [
      {
        name: "theverge",
        displayName: "The Verge",
        hasApi: false,
        maxArticles: 50,
        updateInterval: 60,
      },
      {
        name: "blognone",
        displayName: "Blognone",
        hasApi: false,
        maxArticles: 50,
        updateInterval: 60,
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sources: mockSources }),
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Source Management")).toBeInTheDocument();
    });

    expect(screen.getByText("The Verge")).toBeInTheDocument();
    expect(screen.getByText("Blognone")).toBeInTheDocument();
    expect(screen.getByText("Crawl All Sources")).toBeInTheDocument();
  });

  it("should handle individual source crawl", async () => {
    const mockSources = [
      {
        name: "theverge",
        displayName: "The Verge",
        hasApi: false,
        maxArticles: 50,
        updateInterval: 60,
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sources: mockSources }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ articles: [{ id: "1", title: "Test" }] }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Crawl The Verge")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Crawl The Verge"));

    await waitFor(() => {
      expect(
        screen.getByText("Completed! Found 1 articles.")
      ).toBeInTheDocument();
    });
  });

  it("should handle all sources crawl", async () => {
    const mockSources = [
      {
        name: "theverge",
        displayName: "The Verge",
        hasApi: false,
        maxArticles: 50,
        updateInterval: 60,
      },
      {
        name: "blognone",
        displayName: "Blognone",
        hasApi: false,
        maxArticles: 50,
        updateInterval: 60,
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sources: mockSources }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            { source: "theverge", articles: [{ id: "1", title: "Test" }] },
            { source: "blognone", articles: [{ id: "2", title: "Test 2" }] },
          ],
        }),
      });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Crawl All Sources")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Crawl All Sources"));

    await waitFor(() => {
      expect(
        screen.getByText("All sources crawled successfully!")
      ).toBeInTheDocument();
    });
  });

  it("should handle fetch errors", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load sources")).toBeInTheDocument();
    });
  });

  it("should disable buttons during crawl", async () => {
    const mockSources = [
      {
        name: "theverge",
        displayName: "The Verge",
        hasApi: false,
        maxArticles: 50,
        updateInterval: 60,
      },
    ];

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sources: mockSources }),
      })
      .mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Crawl The Verge")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Crawl The Verge"));

    await waitFor(() => {
      expect(screen.getByText("Crawling...")).toBeInTheDocument();
    });

    // Button should be disabled during crawl
    expect(screen.getByText("Crawling...")).toBeDisabled();
  });
});
