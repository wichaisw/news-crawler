"use client";

import { NewsItem } from "../../../lib/types/news-types";
import { formatDistanceToNow, format } from "date-fns";

interface NewsCardProps {
  newsItem: NewsItem;
}

export default function NewsCard({ newsItem }: NewsCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {newsItem.sourceName}
        </span>
        <time
          dateTime={newsItem.publishedAt.toISOString()}
          className="text-xs text-gray-500"
        >
          {formatDistanceToNow(newsItem.publishedAt, { addSuffix: true })}
        </time>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        <a
          href={newsItem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition-colors"
        >
          {newsItem.title}
        </a>
      </h3>

      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
        {newsItem.summary}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {newsItem.author && (
            <>
              <span>By {newsItem.author}</span>
              <span>•</span>
            </>
          )}
          <time dateTime={newsItem.publishedAt.toISOString()}>
            {format(newsItem.publishedAt, "MMM dd, yyyy HH:mm")}
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
