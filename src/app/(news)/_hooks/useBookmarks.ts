"use client";

import { useState, useEffect, useCallback } from "react";
import { BookmarkData } from "../../../lib/types/news-types";

const BOOKMARKS_STORAGE_KEY = "news-bookmarks";
const BOOKMARK_DATA_STORAGE_KEY = "news-bookmark-data";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkData, setBookmarkData] = useState<BookmarkData[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      const storedData = localStorage.getItem(BOOKMARK_DATA_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);
        setBookmarks(Array.isArray(parsed) ? parsed : []);
      }

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setBookmarkData(Array.isArray(parsedData) ? parsedData : []);
      }
    } catch (error) {
      console.error("Failed to load bookmarks from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
      } catch (error) {
        console.error("Failed to save bookmarks to localStorage:", error);
      }
    }
  }, [bookmarks, isInitialized]);

  // Save bookmark data to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(
          BOOKMARK_DATA_STORAGE_KEY,
          JSON.stringify(bookmarkData)
        );
      } catch (error) {
        console.error("Failed to save bookmark data to localStorage:", error);
      }
    }
  }, [bookmarkData, isInitialized]);

  const isBookmarked = useCallback(
    (id: string): boolean => {
      return bookmarks.includes(id);
    },
    [bookmarks]
  );

  const addBookmark = useCallback(
    (id: string, articleData?: Partial<BookmarkData>) => {
      setBookmarks((prev) => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });

      // Store essential data if provided
      if (articleData) {
        setBookmarkData((prev) => {
          const existing = prev.find((item) => item.id === id);
          if (existing) return prev;

          const bookmarkData: BookmarkData = {
            id,
            title: articleData.title || "Unknown Title",
            url: articleData.url || "",
            source: articleData.source || "unknown",
            sourceName: articleData.sourceName || "Unknown Source",
            addedAt: new Date().toISOString(),
          };

          return [...prev, bookmarkData];
        });
      }
    },
    []
  );

  const removeBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((bookmarkId) => bookmarkId !== id));
    setBookmarkData((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleBookmark = useCallback(
    (id: string, articleData?: Partial<BookmarkData>) => {
      setBookmarks((prev) => {
        if (prev.includes(id)) {
          return prev.filter((bookmarkId) => bookmarkId !== id);
        } else {
          return [...prev, id];
        }
      });

      // Store or remove essential data
      setBookmarkData((prev) => {
        const existing = prev.find((item) => item.id === id);
        if (existing) {
          // Remove if already bookmarked
          return prev.filter((item) => item.id !== id);
        } else if (articleData) {
          // Add if not bookmarked and data provided
          const bookmarkData: BookmarkData = {
            id,
            title: articleData.title || "Unknown Title",
            url: articleData.url || "",
            source: articleData.source || "unknown",
            sourceName: articleData.sourceName || "Unknown Source",
            addedAt: new Date().toISOString(),
          };
          return [...prev, bookmarkData];
        }
        return prev;
      });
    },
    []
  );

  const clearBookmarks = useCallback(() => {
    setBookmarks([]);
    setBookmarkData([]);
  }, []);

  const getBookmarkData = useCallback(
    (id: string): BookmarkData | undefined => {
      return bookmarkData.find((item) => item.id === id);
    },
    [bookmarkData]
  );

  const getAllBookmarkData = useCallback((): BookmarkData[] => {
    return bookmarkData;
  }, [bookmarkData]);

  return {
    bookmarks,
    bookmarkData,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    clearBookmarks,
    getBookmarkData,
    getAllBookmarkData,
    isInitialized,
  };
}
