import { renderHook, act } from "@testing-library/react";
import { useNewsView } from "../useNewsView";

describe("useNewsView", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useNewsView());

    expect(result.current.viewMode).toBe("card");
    expect(result.current.showDescription).toBe(false);
  });

  it("toggles view mode from card to list", () => {
    const { result } = renderHook(() => useNewsView());

    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe("list");
  });

  it("toggles view mode from list to card", () => {
    const { result } = renderHook(() => useNewsView());

    // First toggle to list
    act(() => {
      result.current.toggleViewMode();
    });

    // Then toggle back to card
    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe("card");
  });

  it("toggles description visibility", () => {
    const { result } = renderHook(() => useNewsView());

    act(() => {
      result.current.toggleDescription();
    });

    expect(result.current.showDescription).toBe(true);
  });

  it("toggles description visibility back to false", () => {
    const { result } = renderHook(() => useNewsView());

    // First toggle to true
    act(() => {
      result.current.toggleDescription();
    });

    // Then toggle back to false
    act(() => {
      result.current.toggleDescription();
    });

    expect(result.current.showDescription).toBe(false);
  });

  it("maintains independent state for view mode and description", () => {
    const { result } = renderHook(() => useNewsView());

    act(() => {
      result.current.toggleViewMode();
      result.current.toggleDescription();
    });

    expect(result.current.viewMode).toBe("list");
    expect(result.current.showDescription).toBe(true);
  });
});
