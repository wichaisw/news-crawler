import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminPage from "../page";

// Mock fetch globally
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("AdminPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it("renders admin page title", () => {
    render(<AdminPage />);

    expect(screen.getByText("Source Management")).toBeInTheDocument();
  });

  it("renders The Verge source section", () => {
    render(<AdminPage />);

    expect(screen.getByText("The Verge Source")).toBeInTheDocument();
  });

  it("renders start crawl button", () => {
    render(<AdminPage />);

    expect(
      screen.getByRole("button", { name: "Start Source Crawl" })
    ).toBeInTheDocument();
  });

  it("renders instructions", () => {
    render(<AdminPage />);

    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(screen.getByText(/Click "Start Source Crawl"/)).toBeInTheDocument();
    expect(
      screen.getByText(/Wait for the source crawl to complete/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Go back to the home page/)).toBeInTheDocument();
  });

  it("shows idle status initially", () => {
    render(<AdminPage />);

    expect(screen.getByText("Status: Idle")).toBeInTheDocument();
  });

  it("triggers crawl when button is clicked", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        articles: [{ id: "test-1", title: "Test Article" }],
        source: "theverge",
        timestamp: new Date().toISOString(),
        pagesProcessed: 1,
      }),
    } as Response);

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: "theverge" }),
      });
    });
  });

  it("shows running status during crawl", async () => {
    const user = userEvent.setup();

    // Mock a delayed response to test loading state
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  articles: [],
                  source: "theverge",
                  timestamp: new Date().toISOString(),
                  pagesProcessed: 1,
                }),
              } as Response),
            100
          )
        )
    );

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    // Should show running status immediately
    expect(screen.getByText("Status: Running...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Crawling..." })
    ).toBeInTheDocument();
  });

  it("shows success message after successful crawl", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        articles: [{ id: "test-1", title: "Test Article" }],
        source: "theverge",
        timestamp: new Date().toISOString(),
        pagesProcessed: 1,
      }),
    } as Response);

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Source crawl completed! Found 1 articles./)
      ).toBeInTheDocument();
    });
  });

  it("shows error message when crawl fails", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Failed to crawl source" }),
    } as Response);

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    await waitFor(() => {
      expect(
        screen.getByText("Error: Failed to crawl source")
      ).toBeInTheDocument();
    });
  });

  it("shows error message when network fails", async () => {
    const user = userEvent.setup();

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to trigger source crawl")
      ).toBeInTheDocument();
    });
  });

  it("disables button during crawl", async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  articles: [],
                  source: "theverge",
                  timestamp: new Date().toISOString(),
                  pagesProcessed: 1,
                }),
              } as Response),
            100
          )
        )
    );

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    // Button should be disabled during crawl
    expect(crawlButton).toBeDisabled();
  });

  it("re-enables button after crawl completes", async () => {
    const user = userEvent.setup();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        articles: [],
        source: "theverge",
        timestamp: new Date().toISOString(),
        pagesProcessed: 1,
      }),
    } as Response);

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    await waitFor(() => {
      expect(crawlButton).not.toBeDisabled();
    });
  });

  it("shows starting message when crawl begins", async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  success: true,
                  articles: [],
                  source: "theverge",
                  timestamp: new Date().toISOString(),
                  pagesProcessed: 1,
                }),
              } as Response),
            100
          )
        )
    );

    render(<AdminPage />);

    const crawlButton = screen.getByRole("button", {
      name: "Start Source Crawl",
    });
    await user.click(crawlButton);

    // Should show starting message immediately
    expect(screen.getByText("Starting source crawl...")).toBeInTheDocument();
  });

  it("has proper semantic structure", () => {
    render(<AdminPage />);

    // Should have main heading
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();

    // Should have section headings
    const headings = screen.getAllByRole("heading");
    expect(headings).toHaveLength(3); // Main title + 2 section headings

    // Should have button
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(<AdminPage />);

    const container = screen.getByText("Source Management").closest("div");
    expect(container).toHaveClass("max-w-4xl", "mx-auto", "px-4");
  });
});
