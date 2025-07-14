import { render, screen } from "@testing-library/react";
import NewsCard from "../NewsCard";
import { NewsItem } from "../../../../lib/types/news-types";

const mockNewsItem: NewsItem = {
  id: "test-1",
  title: "Test Article Title",
  description: "This is a test article description.",
  url: "https://example.com/test-article",
  imageUrl: "https://example.com/image.jpg",
  publishedAt: new Date("2024-07-14T10:00:00Z"),
  source: "theverge",
  sourceName: "The Verge",
  author: "Test Author",
  tags: ["tech", "news"],
};

describe("NewsCard", () => {
  it("renders article title", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  it("renders source name as badge", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    expect(screen.getByText("The Verge")).toBeInTheDocument();
  });

  it("renders article description", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    expect(
      screen.getByText("This is a test article description.")
    ).toBeInTheDocument();
  });

  it("renders author information", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    expect(screen.getByText("By Test Author")).toBeInTheDocument();
  });

  it("renders relative time", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    // Should show relative time like "2 days ago" or similar
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it("renders absolute date and time", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    // Should show formatted date like "Jul 14, 2024 10:00"
    expect(screen.getByText(/Jul 14, 2024/)).toBeInTheDocument();
  });

  it('renders "Read →" link', () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    const readLink = screen.getByText("Read →");
    expect(readLink).toBeInTheDocument();
    expect(readLink).toHaveAttribute(
      "href",
      "https://example.com/test-article"
    );
    expect(readLink).toHaveAttribute("target", "_blank");
    expect(readLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders title as link", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    const titleLink = screen.getByRole("link", { name: "Test Article Title" });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute(
      "href",
      "https://example.com/test-article"
    );
    expect(titleLink).toHaveAttribute("target", "_blank");
    expect(titleLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("handles missing author gracefully", () => {
    const newsItemWithoutAuthor = { ...mockNewsItem, author: undefined };
    render(<NewsCard newsItem={newsItemWithoutAuthor} />);

    expect(screen.queryByText(/By/)).not.toBeInTheDocument();
  });

  it("handles missing image gracefully", () => {
    const newsItemWithoutImage = { ...mockNewsItem, imageUrl: undefined };
    render(<NewsCard newsItem={newsItemWithoutImage} />);

    // Component should still render without errors
    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  it("handles string date input", () => {
    const newsItemWithStringDate = {
      ...mockNewsItem,
      publishedAt: "2024-07-14T10:00:00Z",
    };
    render(<NewsCard newsItem={newsItemWithStringDate} />);

    // Should still render without errors
    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
  });

  it("applies correct CSS classes", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    const article = screen.getByRole("article");
    expect(article).toHaveClass(
      "bg-white",
      "rounded-lg",
      "shadow-md",
      "hover:shadow-lg"
    );
  });

  it("has proper semantic structure", () => {
    render(<NewsCard newsItem={mockNewsItem} />);

    // Should have article element
    expect(screen.getByRole("article")).toBeInTheDocument();

    // Should have proper heading structure
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();

    // Should have time elements
    const timeElements = screen.getAllByRole("time");
    expect(timeElements).toHaveLength(2);
  });
});
