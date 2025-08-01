import { render, screen, fireEvent } from "@testing-library/react";
import DateSelector from "../DateSelector";

const mockDates = ["2025-07-14", "2025-07-13", "2025-07-12"];
const mockOnDateChange = jest.fn();

describe("DateSelector", () => {
  beforeEach(() => {
    mockOnDateChange.mockClear();
  });

  it("renders with selected date", () => {
    render(
      <DateSelector
        dates={mockDates}
        selectedDate="2025-07-14"
        onDateChange={mockOnDateChange}
      />
    );

    expect(screen.getByText("Mon, Jul 14")).toBeInTheDocument();
  });

  it("renders with no selected date", () => {
    render(
      <DateSelector
        dates={mockDates}
        selectedDate={null}
        onDateChange={mockOnDateChange}
      />
    );

    expect(screen.getByText("Today")).toBeInTheDocument();
  });

  it("opens dropdown when clicked", () => {
    render(
      <DateSelector
        dates={mockDates}
        selectedDate="2025-07-14"
        onDateChange={mockOnDateChange}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Check for Today option
    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Most recent articles")).toBeInTheDocument();

    // Check for date options
    expect(screen.getByText("Sun, Jul 13")).toBeInTheDocument();
    expect(screen.getByText("2025-07-13")).toBeInTheDocument();
  });

  it("calls onDateChange with null when Today is selected", () => {
    render(
      <DateSelector
        dates={mockDates}
        selectedDate="2025-07-14"
        onDateChange={mockOnDateChange}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const todayOption = screen.getByText("Today");
    fireEvent.click(todayOption);

    expect(mockOnDateChange).toHaveBeenCalledWith(null);
  });

  it("calls onDateChange when date is selected", () => {
    render(
      <DateSelector
        dates={mockDates}
        selectedDate="2025-07-14"
        onDateChange={mockOnDateChange}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    const yesterdayOption = screen.getByText("Sun, Jul 13");
    fireEvent.click(yesterdayOption);

    expect(mockOnDateChange).toHaveBeenCalledWith("2025-07-13");
  });

  it("does not render when no dates are provided", () => {
    const { container } = render(
      <DateSelector
        dates={[]}
        selectedDate={null}
        onDateChange={mockOnDateChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
