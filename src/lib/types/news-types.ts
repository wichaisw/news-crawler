export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date | string; // Can be Date object or ISO string
  source: string;
  sourceName: string;
  author?: string;
  tags?: string[];
}

export interface NewsFilters {
  sources?: string[];
  dateRange?: "all" | "today" | "week" | "month";
  searchQuery?: string;
  sortBy?: "newest" | "oldest" | "relevance";
}

export interface SearchResult {
  items: NewsItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface NewsResponse {
  date: string;
  source: string;
  articles: NewsItem[];
}

export interface BookmarkItem {
  id: string;
  newsItemId: string;
  addedAt: Date;
  userId?: string;
}

export interface BookmarkData {
  id: string;
  title: string;
  url: string;
  source: string;
  sourceName: string;
  addedAt: string; // ISO string for localStorage compatibility
}
