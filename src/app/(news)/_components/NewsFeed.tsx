"use client";

import { useState, useEffect } from "react";
import { NewsItem } from "../../../lib/types/news-types";
import NewsCard from "./NewsCard";
import NewsListItem from "./NewsListItem";
import ViewToggle from "./ViewToggle";
import { useNewsView } from "../_hooks/useNewsView";

export default function NewsFeed() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { viewMode, showDescription, toggleViewMode, toggleDescription } =
    useNewsView();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/news?limit=20");
      const data = await response.json();

      if (response.ok) {
        setArticles(data.articles);
      } else {
        setError(data.error || "Failed to fetch news");
      }
    } catch {
      setError("Failed to fetch news");
    } finally {
      setLoading(false);
    }
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
            onClick={fetchNews}
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
      <ViewToggle
        viewMode={viewMode}
        showDescription={showDescription}
        onToggleView={toggleViewMode}
        onToggleDescription={toggleDescription}
      />

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} newsItem={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {articles.map((article) => (
            <NewsListItem
              key={article.id}
              newsItem={article}
              showDescription={showDescription}
            />
          ))}
        </div>
      )}
    </main>
  );
}
