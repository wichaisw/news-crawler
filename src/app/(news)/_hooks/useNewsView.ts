import { useState } from "react";

export type ViewMode = "card" | "list";

export function useNewsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [showDescription, setShowDescription] = useState(false);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "card" ? "list" : "card"));
  };

  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  return {
    viewMode,
    showDescription,
    toggleViewMode,
    toggleDescription,
  };
}
