export interface CrawlerConfig {
  name: string;
  baseUrl: string;
  selectors: {
    article: string;
    title: string;
    description: string;
    link: string;
    image?: string;
    date?: string;
    author?: string;
  };
  pagination?: {
    nextPageSelector: string;
    maxPages: number;
  };
}

import { NewsItem } from "./news-types";

export interface CrawlerResult {
  success: boolean;
  articles: NewsItem[];
  error?: string;
  source: string;
  timestamp: Date;
  pagesProcessed: number;
}

export interface SiteConfig {
  name: string;
  displayName: string;
  baseUrl: string;
  hasApi: boolean;
  apiEndpoint?: string;
  crawlConfig?: CrawlerConfig;
  maxArticles: number;
  updateInterval: number; // in minutes
}

export interface CrawlerStatus {
  isRunning: boolean;
  lastRun?: Date;
  nextRun?: Date;
  totalArticles: number;
  errors: string[];
  sources: {
    [source: string]: {
      lastUpdate: Date;
      articleCount: number;
      status: "success" | "error" | "pending";
    };
  };
}
