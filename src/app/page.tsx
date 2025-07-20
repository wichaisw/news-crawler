import { Suspense } from "react";
import { StaticNewsFetcher } from "../lib/static-data/static-news-fetcher";
import { StaticSourceFetcher } from "../lib/static-data/static-source-fetcher";
import StaticNewsFeed from "./(news)/_components/StaticNewsFeed";
import { NewsItem } from "../lib/types/news-types";

// SSG: Static generation at build time
export const dynamic = "force-static";

type InitialNews = {
  articles: NewsItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

async function getInitialData() {
  const staticSourceFetcher = new StaticSourceFetcher();
  const staticNewsFetcher = new StaticNewsFetcher();

  try {
    // Get available dates
    const dates = await staticSourceFetcher.getAvailableDates();

    // Get initial news data - default to "Today" (null) to show most recent articles from all sources
    const initialNews = await staticNewsFetcher.getNewsWithPagination(
      null, // null means "Today" - get most recent articles from all sources
      1,
      20
    );

    return {
      dates,
      initialNews,
      selectedDate: null, // Default to "Today" instead of most recent date
    };
  } catch (error) {
    console.error("Failed to get initial data:", error);
    return {
      dates: [],
      initialNews: {
        articles: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
      } as InitialNews,
      selectedDate: null,
    };
  }
}

export default async function Home() {
  const initialData = await getInitialData();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StaticNewsFeed initialData={initialData} />
    </Suspense>
  );
}
