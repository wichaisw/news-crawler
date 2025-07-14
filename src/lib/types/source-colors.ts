export const SOURCE_COLORS = {
  blognone: { bg: "#1a237e", text: "#fff" }, // Blognone blue
  theverge: { bg: "#e5484d", text: "#fff" }, // The Verge red
  techcrunch: { bg: "#0f9d58", text: "#fff" }, // TechCrunch green
  hackernews: { bg: "#ff6600", text: "#fff" }, // Hacker News orange
} as const;

type SourceKey = keyof typeof SOURCE_COLORS;

export function getSourceColor(source: string) {
  return (
    SOURCE_COLORS[source.toLowerCase() as SourceKey] || {
      bg: "#e0e7ef",
      text: "#222",
    }
  );
}
