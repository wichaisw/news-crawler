"use client";

import { useState } from "react";
import { ChevronDownIcon, CalendarIcon } from "@heroicons/react/24/outline";

interface DateSelectorProps {
  dates: string[];
  selectedDate: string | null;
  onDateChange: (date: string) => void;
}

export default function DateSelector({
  dates,
  selectedDate,
  onDateChange,
}: DateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleDateSelect = (date: string | null) => {
    onDateChange(date || "");
    setIsOpen(false);
  };

  if (dates.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <CalendarIcon className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {selectedDate ? formatDate(selectedDate) : "Today"}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            <div className="py-1">
              {/* Today option - shows all recent articles */}
              <button
                onClick={() => handleDateSelect(null)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                  !selectedDate
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">Today</span>
                  <span className="text-xs text-gray-500">
                    Most recent articles
                  </span>
                </div>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-200 my-1"></div>

              {/* Date options */}
              {dates.map((date) => (
                <button
                  key={date}
                  onClick={() => handleDateSelect(date)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors ${
                    selectedDate === date
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{formatDate(date)}</span>
                    <span className="text-xs text-gray-500">{date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
