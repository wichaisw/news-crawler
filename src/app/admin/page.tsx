"use client";

import { useState, useEffect } from "react";

interface Source {
  name: string;
  displayName: string;
  hasApi: boolean;
  maxArticles: number;
  updateInterval: number;
}

interface SourceStatus {
  [key: string]: {
    isRunning: boolean;
    status: string;
    lastCrawl?: string;
    articleCount?: number;
  };
}

export default function AdminPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceStatuses, setSourceStatuses] = useState<SourceStatus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [globalStatus, setGlobalStatus] = useState<string>("");

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch("/api/source");
      const data = await response.json();

      if (response.ok) {
        setSources(data.sources);
        // Initialize status for each source
        const initialStatuses: SourceStatus = {};
        data.sources.forEach((source: Source) => {
          initialStatuses[source.name] = {
            isRunning: false,
            status: "Ready",
          };
        });
        setSourceStatuses(initialStatuses);
      }
    } catch (error) {
      console.error("Failed to fetch sources:", error);
      setGlobalStatus("Failed to load sources");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerSourceCrawl = async (sourceName: string) => {
    try {
      setSourceStatuses((prev) => ({
        ...prev,
        [sourceName]: {
          ...prev[sourceName],
          isRunning: true,
          status: "Starting crawl...",
        },
      }));

      const response = await fetch("/api/source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: sourceName }),
      });

      const result = await response.json();

      if (response.ok) {
        setSourceStatuses((prev) => ({
          ...prev,
          [sourceName]: {
            ...prev[sourceName],
            isRunning: false,
            status: `Completed! Found ${
              result.articles?.length || 0
            } articles.`,
            lastCrawl: new Date().toLocaleString(),
            articleCount: result.articles?.length || 0,
          },
        }));
      } else {
        setSourceStatuses((prev) => ({
          ...prev,
          [sourceName]: {
            ...prev[sourceName],
            isRunning: false,
            status: `Error: ${result.error}`,
          },
        }));
      }
    } catch {
      setSourceStatuses((prev) => ({
        ...prev,
        [sourceName]: {
          ...prev[sourceName],
          isRunning: false,
          status: "Failed to trigger crawl",
        },
      }));
    }
  };

  const triggerAllSourcesCrawl = async () => {
    try {
      setGlobalStatus("Starting crawl for all sources...");

      // Set all sources to running
      const runningStatuses: SourceStatus = {};
      sources.forEach((source) => {
        runningStatuses[source.name] = {
          isRunning: true,
          status: "Running...",
        };
      });
      setSourceStatuses(runningStatuses);

      const response = await fetch("/api/source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const result = await response.json();

      if (response.ok) {
        const completedStatuses: SourceStatus = {};
        result.results?.forEach(
          (crawlResult: { source: string; articles?: unknown[] }) => {
            completedStatuses[crawlResult.source] = {
              isRunning: false,
              status: `Completed! Found ${
                crawlResult.articles?.length || 0
              } articles.`,
              lastCrawl: new Date().toLocaleString(),
              articleCount: crawlResult.articles?.length || 0,
            };
          }
        );
        setSourceStatuses(completedStatuses);
        setGlobalStatus("All sources crawled successfully!");
      } else {
        setGlobalStatus(`Error: ${result.error}`);
        // Reset all sources to ready state
        const readyStatuses: SourceStatus = {};
        sources.forEach((source) => {
          readyStatuses[source.name] = {
            isRunning: false,
            status: "Ready",
          };
        });
        setSourceStatuses(readyStatuses);
      }
    } catch {
      setGlobalStatus("Failed to trigger all sources crawl");
      // Reset all sources to ready state
      const readyStatuses: SourceStatus = {};
      sources.forEach((source) => {
        readyStatuses[source.name] = {
          isRunning: false,
          status: "Ready",
        };
      });
      setSourceStatuses(readyStatuses);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Source Management
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading sources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Source Management
      </h1>

      {/* Global Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Global Controls</h2>
        <div className="space-y-4">
          {globalStatus && (
            <p className="text-sm text-gray-600">{globalStatus}</p>
          )}
          <button
            onClick={triggerAllSourcesCrawl}
            disabled={Object.values(sourceStatuses).some((s) => s.isRunning)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Crawl All Sources
          </button>
        </div>
      </div>

      {/* Individual Source Controls */}
      <div className="space-y-6">
        {sources.map((source) => {
          const status = sourceStatuses[source.name];
          return (
            <div key={source.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {source.displayName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Source: {source.name} • Max Articles: {source.maxArticles} •
                    Update Interval: {source.updateInterval} minutes
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      status?.isRunning
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {status?.isRunning ? "Running" : "Ready"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">
                    Status: {status?.status || "Ready"}
                  </p>
                  {status?.lastCrawl && (
                    <p className="text-xs text-gray-500">
                      Last crawl: {status.lastCrawl}
                    </p>
                  )}
                  {status?.articleCount !== undefined && (
                    <p className="text-xs text-gray-500">
                      Articles found: {status.articleCount}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => triggerSourceCrawl(source.name)}
                  disabled={
                    status?.isRunning ||
                    Object.values(sourceStatuses).some((s) => s.isRunning)
                  }
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {status?.isRunning
                    ? "Crawling..."
                    : `Crawl ${source.displayName}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>Use individual source buttons to crawl specific sources</li>
          <li>
            Use &quot;Crawl All Sources&quot; to crawl all available sources at
            once
          </li>
          <li>Monitor the status of each source during crawling</li>
          <li>Go back to the home page to view the crawled articles</li>
        </ol>
      </div>
    </div>
  );
}
