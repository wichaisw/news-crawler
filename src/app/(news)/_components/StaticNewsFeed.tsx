"use client";

import { useState, useEffect, useCallback } from "react";
import { NewsItem } from "../../../lib/types/news-types";
import { StaticNewsFetcher } from "../../../lib/static-data/static-news-fetcher";
import NewsCardList from "./NewsCardList";
import NewsListItem from "./NewsListItem";
import ViewToggle from "./ViewToggle";
import DateSelector from "./DateSelector";
import { useNewsView } from "../_hooks/useNewsView";
import { useBookmarks } from "../_hooks/useBookmarks";

interface InitialData {
  dates: string[];
  initialNews: {
    articles: NewsItem[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  selectedDate: string | null;
}

interface StaticNewsFeedProps {
  initialData: InitialData;
}

export default function StaticNewsFeed({ initialData }: StaticNewsFeedProps) {
  const [articles, setArticles] = useState<NewsItem[]>(
    initialData.initialNews.articles || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialData.selectedDate
  );
  const [availableDates] = useState<string[]>(initialData.dates);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialData.initialNews.hasMore);
  const [totalArticles, setTotalArticles] = useState(
    initialData.initialNews.total
  );
  const [loadingMore, setLoadingMore] = useState(false);

  const { viewMode, showDescription, toggleViewMode, toggleDescription } =
    useNewsView();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const ITEMS_PER_PAGE = 20;

  // Calculate the number of items that will be loaded in the next page
  const getNextPageItemCount = () => {
    const totalRemaining = totalArticles - articles.length;
    return Math.min(ITEMS_PER_PAGE, totalRemaining);
  };

  const fetchNews = useCallback(
    async (date: string | null, page: number, reset: boolean = false) => {
      try {
        if (reset) {
          setLoading(true);
          setCurrentPage(1);
        } else {
          setLoadingMore(true);
        }

        // Use static fetcher instead of API
        const staticNewsFetcher = new StaticNewsFetcher();
        const data = await staticNewsFetcher.getNewsWithPagination(
          date,
          page,
          ITEMS_PER_PAGE
        );

        if (reset) {
          setArticles(data.articles || []);
        } else {
          setArticles((prev) => [...prev, ...(data.articles || [])]);
        }

        setTotalArticles(data.total);
        setHasMore(data.hasMore);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError("Failed to fetch news");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [ITEMS_PER_PAGE]
  );

  // Only fetch when date changes (not on initial load)
  useEffect(() => {
    if (selectedDate !== initialData.selectedDate) {
      fetchNews(selectedDate, 1, true);
    }
  }, [selectedDate, initialData.selectedDate, fetchNews]);

  const handleLoadMore = () => {
    if (hasMore) {
      fetchNews(selectedDate, currentPage + 1);
    }
  };

  const handleDateChange = (date: string | null) => {
    setSelectedDate(date);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            aria-hidden="true"
          ></div>
          <p className="mt-4 text-gray-600">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchNews(selectedDate, 1, true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No news articles found.</p>
          <p className="text-sm text-gray-500">
            Try running the crawler to fetch some articles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <ViewToggle
          viewMode={viewMode}
          showDescription={showDescription}
          onToggleView={toggleViewMode}
          onToggleDescription={toggleDescription}
        />

        <DateSelector
          dates={availableDates}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      {selectedDate && (
        <div className="mb-4 text-sm text-gray-600">
          Showing {articles.length} of {totalArticles} articles for{" "}
          {selectedDate}
        </div>
      )}

      {viewMode === "card" ? (
        <NewsCardList
          articles={articles}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isBookmarked={isBookmarked}
          onBookmarkToggle={toggleBookmark}
          emptyMessage="No news articles found."
          emptySubMessage="Try running the crawler to fetch some articles."
          showLoadMoreButton={true}
          nextPageItemCount={getNextPageItemCount()}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {articles.map((article) => (
            <NewsListItem
              key={`${article.id}-${article.publishedAt}`}
              newsItem={article}
              showDescription={showDescription}
              isBookmarked={isBookmarked(article.id)}
              onBookmarkToggle={(id, articleData) =>
                toggleBookmark(id, articleData)
              }
            />
          ))}
        </div>
      )}

      {viewMode === "list" && hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              `Load More (${getNextPageItemCount()} remaining)`
            )}
          </button>
        </div>
      )}
    </main>
  );
}
