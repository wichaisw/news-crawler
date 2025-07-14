"use client";

import { ViewMode } from "../_hooks/useNewsView";

interface ViewToggleProps {
  viewMode: ViewMode;
  showDescription: boolean;
  onToggleView: () => void;
  onToggleDescription: () => void;
}

export default function ViewToggle({
  viewMode,
  showDescription,
  onToggleView,
  onToggleDescription,
}: ViewToggleProps) {
  return (
    <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleView}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "card"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-4 h-4 inline mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
          </svg>
          Cards
        </button>
        <button
          onClick={onToggleView}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            viewMode === "list"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-4 h-4 inline mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          List
        </button>
      </div>

      {viewMode === "list" && (
        <button
          onClick={onToggleDescription}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            showDescription
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg
            className="w-4 h-4 inline mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {showDescription ? "Hide" : "Show"} Description
        </button>
      )}
    </div>
  );
}
