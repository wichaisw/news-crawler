"use client";

import { useState } from "react";

export default function AdminPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string>("");

  const triggerSourceCrawl = async () => {
    try {
      setIsRunning(true);
      setStatus("Starting source crawl...");

      const response = await fetch("/api/source", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: "theverge" }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus(
          `Source crawl completed! Found ${
            result.articles?.length || 0
          } articles.`
        );
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch {
      setStatus("Failed to trigger source crawl");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Source Management
      </h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">The Verge Source</h2>

        <div className="space-y-4">
          <div>
            <p className="text-gray-600">
              Status: {isRunning ? "Running..." : "Idle"}
            </p>
            {status && <p className="text-sm text-gray-500 mt-2">{status}</p>}
          </div>

          <button
            onClick={triggerSourceCrawl}
            disabled={isRunning}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? "Crawling..." : "Start Source Crawl"}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>
            Click &quot;Start Source Crawl&quot; to fetch articles from The
            Verge
          </li>
          <li>Wait for the source crawl to complete</li>
          <li>Go back to the home page to view the articles</li>
        </ol>
      </div>
    </div>
  );
}
