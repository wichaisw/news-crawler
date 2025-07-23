"use client";

import { NewsItem, BookmarkData } from "../../../lib/types/news-types";
import NewsCard from "./NewsCard";
import { ReactNode } from "react";

interface NewsCardListProps {
  articles: NewsItem[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  isBookmarked?: (id: string) => boolean;
  onBookmarkToggle?: (id: string, articleData?: Partial<BookmarkData>) => void;
  emptyMessage?: string;
  emptySubMessage?: string;
  showLoadMoreButton?: boolean;
  className?: string;
  emptyContent?: ReactNode;
  totalArticles?: number;
}

export default function NewsCardList({
  articles,
  loading = false,
  loadingMore = false,
  hasMore = false,
  onLoadMore,
  isBookmarked,
  onBookmarkToggle,
  emptyMessage = "No articles found.",
  emptySubMessage,
  showLoadMoreButton = true,
  className = "",
  emptyContent,
  totalArticles,
}: NewsCardListProps) {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center" role="status" aria-live="polite">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
            aria-hidden="true"
          ></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    if (emptyContent) {
      return <div className={className}>{emptyContent}</div>;
    }

    return (
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 ${className}`}
      >
        <div className="text-center">
          <p className="text-gray-600 mb-4">{emptyMessage}</p>
          {emptySubMessage && (
            <p className="text-sm text-gray-500">{emptySubMessage}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard
            key={`${article.id}-${article.publishedAt}`}
            newsItem={article}
            isBookmarked={isBookmarked ? isBookmarked(article.id) : false}
            onBookmarkToggle={
              onBookmarkToggle
                ? (id, articleData) =>
                    onBookmarkToggle(id, {
                      title: article.title,
                      url: article.url,
                      source: article.source,
                      sourceName: article.sourceName,
                      ...articleData,
                    })
                : undefined
            }
          />
        ))}
      </div>

      {showLoadMoreButton && hasMore && onLoadMore && (
        <div className="mt-8 text-center">
          <button
            onClick={onLoadMore}
            disabled={loadingMore}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Loading...
              </div>
            ) : (
              `Load More (${
                totalArticles ? totalArticles - articles.length : 20
              } remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
