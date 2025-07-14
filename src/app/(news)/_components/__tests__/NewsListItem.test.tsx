import { render, screen } from "@testing-library/react";
import NewsListItem from "../NewsListItem";
import { NewsItem } from "../../../../lib/types/news-types";

const mockNewsItem: NewsItem = {
  id: "1",
  title: "Test Article Title",
  description: "Test article description",
  summary: "Test article summary",
  url: "https://example.com/article",
  publishedAt: new Date("2024-01-01T10:00:00Z"),
  source: "test-source",
  sourceName: "Test Source",
  author: "Test Author",
};

describe("NewsListItem", () => {
  it("renders basic list item without description", () => {
    render(<NewsListItem newsItem={mockNewsItem} showDescription={false} />);

    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    expect(screen.getByText("Test Source")).toBeInTheDocument();
    expect(screen.getByText("Read →")).toBeInTheDocument();
    expect(screen.queryByText("Test article summary")).not.toBeInTheDocument();
    expect(screen.queryByText("By Test Author")).not.toBeInTheDocument();
  });

  it("renders list item with description when showDescription is true", () => {
    render(<NewsListItem newsItem={mockNewsItem} showDescription={true} />);

    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    expect(screen.getByText("Test Source")).toBeInTheDocument();
    expect(screen.getByText("Test article summary")).toBeInTheDocument();
    expect(screen.getByText("By Test Author")).toBeInTheDocument();
    expect(screen.getByText("Read →")).toBeInTheDocument();
  });

  it("renders correctly without author", () => {
    const newsItemWithoutAuthor = { ...mockNewsItem, author: undefined };
    render(
      <NewsListItem newsItem={newsItemWithoutAuthor} showDescription={true} />
    );

    expect(screen.getByText("Test Article Title")).toBeInTheDocument();
    expect(screen.queryByText("By Test Author")).not.toBeInTheDocument();
  });

  it("has correct link attributes", () => {
    render(<NewsListItem newsItem={mockNewsItem} showDescription={false} />);

    const link = screen.getByRole("link", { name: "Test Article Title" });
    expect(link).toHaveAttribute("href", "https://example.com/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
