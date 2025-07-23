"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsItem } from "../../../lib/types/news-types";
import { useBookmarks } from "./useBookmarks";
import { StaticNewsFetcher } from "../../../lib/static-data/static-news-fetcher";

interface UseBookmarksWithLoadMoreOptions {
  itemsPerPage?: number;
}

export function useBookmarksWithLoadMore({
  itemsPerPage = 20,
}: UseBookmarksWithLoadMoreOptions = {}) {
  const {
    bookmarks,
    bookmarkData,
    isBookmarked,
    removeBookmark,
    clearBookmarks,
    isInitialized,
  } = useBookmarks();

  const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsItem[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Load all bookmarked articles from all sources
  useEffect(() => {
    if (!isInitialized) return;

    const loadBookmarkedArticles = async () => {
      setIsLoading(true);
      try {
        const allArticles: NewsItem[] = [];
        const staticNewsFetcher = new StaticNewsFetcher();

        // Load articles from all sources using static fetcher
        const sources = ["theverge", "techcrunch", "blognone", "hackernews"];

        for (const source of sources) {
          try {
            // Get all articles from this source (null date means all dates)
            const sourceData = await staticNewsFetcher.getNewsWithPagination(
              null,
              1,
              1000, // Large limit to get all articles
              source
            );
            allArticles.push(...sourceData.articles);
          } catch (error) {
            console.error(`Failed to load articles from ${source}:`, error);
          }
        }

        // Filter to only bookmarked articles
        const bookmarked = allArticles.filter((article) =>
          bookmarks.includes(article.id)
        );

        // For bookmarks that don't have full article data, create fallback articles
        const missingBookmarks = bookmarks.filter(
          (id) => !bookmarked.find((article) => article.id === id)
        );

        const fallbackArticles: NewsItem[] = missingBookmarks.map((id) => {
          const fallbackData = bookmarkData.find((data) => data.id === id);
          if (fallbackData) {
            return {
              id: fallbackData.id,
              title: fallbackData.title,
              description: `Bookmarked article from ${fallbackData.sourceName}`,
              url: fallbackData.url,
              publishedAt: fallbackData.addedAt,
              source: fallbackData.source,
              sourceName: fallbackData.sourceName,
              author: undefined,
              tags: [],
            };
          }
          // If no fallback data exists, create a minimal article
          return {
            id,
            title: "Unknown Article",
            description:
              "This article was bookmarked but the original data is no longer available.",
            url: "#",
            publishedAt: new Date().toISOString(),
            source: "unknown",
            sourceName: "Unknown Source",
            author: undefined,
            tags: [],
          };
        });

        const allBookmarkedArticles = [...bookmarked, ...fallbackArticles];

        // Sort by bookmark date (most recent first)
        allBookmarkedArticles.sort((a, b) => {
          const dateA = new Date(a.publishedAt);
          const dateB = new Date(b.publishedAt);
          return dateB.getTime() - dateA.getTime();
        });

        setBookmarkedArticles(allBookmarkedArticles);
      } catch (error) {
        console.error("Failed to load bookmarked articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBookmarkedArticles();
  }, [bookmarks, bookmarkData, isInitialized]);

  // Update displayed articles when bookmarked articles change
  useEffect(() => {
    const startIndex = 0;
    const endIndex = itemsPerPage;
    const initialArticles = bookmarkedArticles.slice(startIndex, endIndex);

    setDisplayedArticles(initialArticles);
    setCurrentPage(1);
    setHasMore(bookmarkedArticles.length > itemsPerPage);
  }, [bookmarkedArticles, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);

    // Simulate loading delay for better UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = 0;
      const endIndex = nextPage * itemsPerPage;
      const newArticles = bookmarkedArticles.slice(startIndex, endIndex);

      setDisplayedArticles(newArticles);
      setCurrentPage(nextPage);
      setHasMore(bookmarkedArticles.length > endIndex);
      setLoadingMore(false);
    }, 300);
  }, [bookmarkedArticles, currentPage, itemsPerPage, hasMore, loadingMore]);

  const handleBookmarkToggle = useCallback(
    (id: string) => {
      removeBookmark(id);
    },
    [removeBookmark]
  );

  return {
    articles: displayedArticles,
    totalArticles: bookmarkedArticles.length,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    isBookmarked,
    onBookmarkToggle: handleBookmarkToggle,
    clearBookmarks,
    isInitialized,
  };
}
