import { renderHook, act } from "@testing-library/react";
import { useBookmarks } from "../useBookmarks";

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useBookmarks", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null); // Ensure clean state for each test
  });

  it("should initialize with empty bookmarks", () => {
    const { result } = renderHook(() => useBookmarks());

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.isBookmarked("test-id")).toBe(false);
  });

  it("should load bookmarks from localStorage on mount", () => {
    const savedBookmarks = ["id1", "id2", "id3"];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedBookmarks));

    const { result } = renderHook(() => useBookmarks());

    expect(result.current.bookmarks).toEqual(savedBookmarks);
    expect(result.current.isBookmarked("id1")).toBe(true);
    expect(result.current.isBookmarked("id2")).toBe(true);
    expect(result.current.isBookmarked("id3")).toBe(true);
    expect(result.current.isBookmarked("id4")).toBe(false);
  });

  it("should add bookmark", () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark("test-id");
    });

    expect(result.current.bookmarks).toEqual(["test-id"]);
    expect(result.current.isBookmarked("test-id")).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "news-bookmarks",
      JSON.stringify(["test-id"])
    );
  });

  it("should not add duplicate bookmarks", () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark("test-id");
      result.current.addBookmark("test-id");
    });

    expect(result.current.bookmarks).toEqual(["test-id"]);
  });

  it("should remove bookmark", () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark("test-id");
      result.current.removeBookmark("test-id");
    });

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.isBookmarked("test-id")).toBe(false);
  });

  it("should toggle bookmark", () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.toggleBookmark("test-id");
    });

    expect(result.current.bookmarks).toEqual(["test-id"]);
    expect(result.current.isBookmarked("test-id")).toBe(true);

    act(() => {
      result.current.toggleBookmark("test-id");
    });

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.isBookmarked("test-id")).toBe(false);
  });

  it("should clear all bookmarks", () => {
    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark("id1");
      result.current.addBookmark("id2");
      result.current.clearBookmarks();
    });

    expect(result.current.bookmarks).toEqual([]);
    expect(result.current.isBookmarked("id1")).toBe(false);
    expect(result.current.isBookmarked("id2")).toBe(false);
  });

  it("should handle localStorage errors gracefully", () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useBookmarks());

    act(() => {
      result.current.addBookmark("test-id");
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to save bookmarks to localStorage:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("should handle invalid localStorage data", () => {
    localStorageMock.getItem.mockReturnValue("invalid-json");

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useBookmarks());

    expect(result.current.bookmarks).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load bookmarks from localStorage:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});
