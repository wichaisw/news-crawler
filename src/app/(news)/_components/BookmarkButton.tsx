"use client";

import { BookmarkIcon } from "@heroicons/react/24/outline";
import { BookmarkIcon as BookmarkSolidIcon } from "@heroicons/react/24/solid";

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BookmarkButton({
  isBookmarked,
  onToggle,
  size = "md",
  className = "",
}: BookmarkButtonProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`
        rounded-full transition-all duration-200 hover:scale-110
        ${
          isBookmarked
            ? "text-blue-600 hover:text-blue-700"
            : "text-gray-400 hover:text-blue-600"
        }
        ${buttonClasses[size]}
        ${className}
      `}
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {isBookmarked ? (
        <BookmarkSolidIcon className={sizeClasses[size]} />
      ) : (
        <BookmarkIcon className={sizeClasses[size]} />
      )}
    </button>
  );
}
