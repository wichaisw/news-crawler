"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NewsItem } from "../../../lib/types/news-types";
import { useBookmarks } from "../_hooks/useBookmarks";
import NewsCard from "../_components/NewsCard";
import ConfirmDialog from "../_components/ConfirmDialog";
import { BookmarkIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function BookmarksPage() {
  const {
    bookmarks,
    bookmarkData,
    isBookmarked,
    removeBookmark,
    clearBookmarks,
    isInitialized,
  } = useBookmarks();
  const [bookmarkedArticles, setBookmarkedArticles] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load bookmarked articles from all sources with fallback to stored data
  useEffect(() => {
    if (!isInitialized) return;

    const loadBookmarkedArticles = async () => {
      setIsLoading(true);
      try {
        const allArticles: NewsItem[] = [];

        // Load articles from all sources and dates
        const sources = ["theverge", "techcrunch", "blognone", "hackernews"];

        for (const source of sources) {
          try {
            const response = await fetch(
              `/api/news?source=${source}&limit=1000`
            );
            if (response.ok) {
              const data = await response.json();
              allArticles.push(...data.articles);
            }
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

  const handleClearAll = () => {
    clearBookmarks();
    setShowClearConfirm(false);
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookmarkIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Bookmarks ({bookmarkedArticles.length})
          </h1>
        </div>

        {bookmarkedArticles.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {bookmarkedArticles.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No bookmarks yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start bookmarking articles you want to read later
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Articles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedArticles.map((article) => (
            <NewsCard
              key={article.id}
              newsItem={article}
              isBookmarked={isBookmarked(article.id)}
              onBookmarkToggle={removeBookmark}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAll}
        title="Clear All Bookmarks"
        message="Are you sure you want to remove all bookmarks? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
