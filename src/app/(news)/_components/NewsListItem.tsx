"use client";

import { NewsItem } from "../../../lib/types/news-types";
import { format } from "date-fns";
import { getSourceColor } from "../../../lib/types/source-colors";

interface NewsListItemProps {
  newsItem: NewsItem;
  showDescription: boolean;
}

export default function NewsListItem({
  newsItem,
  showDescription,
}: NewsListItemProps) {
  const publishedDate = new Date(newsItem.publishedAt);
  const { bg, text } = getSourceColor(newsItem.source);

  return (
    <article className="bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="min-w-[100px] w-[100px] flex-shrink-0 flex items-center">
              <span
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-full justify-center"
                style={{ backgroundColor: bg, color: text }}
              >
                {newsItem.sourceName}
              </span>
            </div>
            <h3 className="text-base font-medium text-gray-900 flex-1">
              <a
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {newsItem.title}
              </a>
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 ml-4">
            <time
              dateTime={publishedDate.toISOString()}
              className="whitespace-nowrap"
            >
              {format(publishedDate, "MMM dd, yyyy HH:mm")}
            </time>
            <a
              href={newsItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
            >
              Read →
            </a>
          </div>
        </div>

        {showDescription && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden break-words">
              {newsItem.description}
            </p>
            {newsItem.author && (
              <p className="text-xs text-gray-500 mt-1">By {newsItem.author}</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
