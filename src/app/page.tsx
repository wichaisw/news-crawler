import { Suspense } from "react";
import { StaticNewsFetcher } from "../lib/static-data/static-news-fetcher";
import { StaticSourceFetcher } from "../lib/static-data/static-source-fetcher";
import NewsFeed from "./(news)/_components/NewsFeed";
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
    const mostRecentDate = dates[0] || null;

    // Get initial news data
    let initialNews: InitialNews = {
      articles: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
    };
    if (mostRecentDate) {
      initialNews = await staticNewsFetcher.getNewsWithPagination(
        mostRecentDate,
        1,
        20
      );
    }

    return {
      dates,
      initialNews,
      selectedDate: mostRecentDate,
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
      <NewsFeed initialData={initialData} />
    </Suspense>
  );
}
