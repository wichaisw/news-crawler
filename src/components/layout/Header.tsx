"use client";

import Link from "next/link";
import { useBookmarks } from "../../app/(news)/_hooks/useBookmarks";

export default function Header() {
  useBookmarks(); // still call to keep client state in sync if needed

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              News Feed Crawler
            </Link>
          </div>

          <nav className="flex space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/bookmarks"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Saved
            </Link>
            <Link
              href="/sources"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sources
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
