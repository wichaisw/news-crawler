"use client";

import { NewsItem, BookmarkData } from "../../../lib/types/news-types";
import { formatDistanceToNow, format } from "date-fns";
import { getSourceColor } from "../../../lib/types/source-colors";
import BookmarkButton from "./BookmarkButton";

interface NewsCardProps {
  newsItem: NewsItem;
  isBookmarked?: boolean;
  onBookmarkToggle?: (id: string, articleData?: Partial<BookmarkData>) => void;
}

export default function NewsCard({
  newsItem,
  isBookmarked = false,
  onBookmarkToggle,
}: NewsCardProps) {
  // Ensure publishedAt is a Date object
  const publishedDate = new Date(newsItem.publishedAt);
  const { bg, text } = getSourceColor(newsItem.source);

  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ backgroundColor: bg, color: text }}
        >
          {newsItem.sourceName}
        </span>
        <div className="flex items-center gap-2">
          <time
            dateTime={publishedDate.toISOString()}
            className="text-xs text-gray-500"
          >
            {formatDistanceToNow(publishedDate, { addSuffix: true })}
          </time>
          {onBookmarkToggle && (
            <BookmarkButton
              isBookmarked={isBookmarked}
              onToggle={() =>
                onBookmarkToggle(newsItem.id, {
                  title: newsItem.title,
                  url: newsItem.url,
                  source: newsItem.source,
                  sourceName: newsItem.sourceName,
                })
              }
              size="sm"
            />
          )}
        </div>
      </div>

      <div className="flex-1">
        <h3
          className="text-lg font-semibold text-gray-900 mb-2 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          <a
            href={newsItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {newsItem.title}
          </a>
        </h3>
        <p
          className="text-sm text-gray-600 overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {newsItem.description}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          {newsItem.author && (
            <>
              <span>By {newsItem.author}</span>
              <span>•</span>
            </>
          )}
          <time dateTime={publishedDate.toISOString()}>
            {format(publishedDate, "MMM dd, yyyy HH:mm")}
          </time>
        </div>

        <a
          href={newsItem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Read →
        </a>
      </div>
    </article>
  );
}
