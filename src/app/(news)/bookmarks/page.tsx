"use client";

// SSG: Static generation at build time
export const dynamic = "force-static";

import Link from "next/link";
import { BookmarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import NewsCardList from "../_components/NewsCardList";
import NewsList from "../_components/NewsList";
import ViewToggle from "../_components/ViewToggle";
import ConfirmDialog from "../_components/ConfirmDialog";
import { useBookmarksWithLoadMore } from "../_hooks/useBookmarksWithLoadMore";
import { useNewsView } from "../_hooks/useNewsView";
import { useState } from "react";

export default function BookmarksPage() {
  const {
    articles,
    totalArticles,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    isBookmarked,
    onBookmarkToggle,
    clearBookmarks,
    isInitialized,
  } = useBookmarksWithLoadMore({ itemsPerPage: 20 });

  const { viewMode, showDescription, toggleViewMode, toggleDescription } =
    useNewsView();

  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const emptyContent = (
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
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BookmarkIcon className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Bookmarks ({totalArticles})
          </h1>
        </div>

        {totalArticles > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <ViewToggle
          viewMode={viewMode}
          showDescription={showDescription}
          onToggleView={toggleViewMode}
          onToggleDescription={toggleDescription}
        />
      </div>

      {viewMode === "card" ? (
        <NewsCardList
          articles={articles}
          loading={isLoading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isBookmarked={isBookmarked}
          onBookmarkToggle={onBookmarkToggle}
          emptyContent={emptyContent}
          showLoadMoreButton={true}
        />
      ) : (
        <NewsList
          articles={articles}
          loading={isLoading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isBookmarked={isBookmarked}
          onBookmarkToggle={onBookmarkToggle}
          showDescription={showDescription}
          emptyContent={emptyContent}
          showLoadMoreButton={true}
        />
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
