import { render, screen, fireEvent } from "@testing-library/react";
import ViewToggle from "../ViewToggle";

describe("ViewToggle", () => {
  const mockOnToggleView = jest.fn();
  const mockOnToggleDescription = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders card and list toggle buttons", () => {
    render(
      <ViewToggle
        viewMode="card"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    expect(screen.getByText("Cards")).toBeInTheDocument();
    expect(screen.getByText("List")).toBeInTheDocument();
  });

  it("shows card button as active when viewMode is card", () => {
    render(
      <ViewToggle
        viewMode="card"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    const cardButton = screen.getByText("Cards");
    expect(cardButton).toHaveClass("bg-blue-600", "text-white");
  });

  it("shows list button as active when viewMode is list", () => {
    render(
      <ViewToggle
        viewMode="list"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    const listButton = screen.getByText("List");
    expect(listButton).toHaveClass("bg-blue-600", "text-white");
  });

  it("calls onToggleView when card button is clicked", () => {
    render(
      <ViewToggle
        viewMode="list"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    fireEvent.click(screen.getByText("Cards"));
    expect(mockOnToggleView).toHaveBeenCalledTimes(1);
  });

  it("calls onToggleView when list button is clicked", () => {
    render(
      <ViewToggle
        viewMode="card"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    fireEvent.click(screen.getByText("List"));
    expect(mockOnToggleView).toHaveBeenCalledTimes(1);
  });

  it("shows description toggle button when viewMode is list", () => {
    render(
      <ViewToggle
        viewMode="list"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    expect(screen.getByText("Show Description")).toBeInTheDocument();
  });

  it("does not show description toggle button when viewMode is card", () => {
    render(
      <ViewToggle
        viewMode="card"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    expect(screen.queryByText("Show Description")).not.toBeInTheDocument();
  });

  it("shows 'Hide Description' when showDescription is true", () => {
    render(
      <ViewToggle
        viewMode="list"
        showDescription={true}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    expect(screen.getByText("Hide Description")).toBeInTheDocument();
  });

  it("calls onToggleDescription when description button is clicked", () => {
    render(
      <ViewToggle
        viewMode="list"
        showDescription={false}
        onToggleView={mockOnToggleView}
        onToggleDescription={mockOnToggleDescription}
      />
    );

    fireEvent.click(screen.getByText("Show Description"));
    expect(mockOnToggleDescription).toHaveBeenCalledTimes(1);
  });
});
