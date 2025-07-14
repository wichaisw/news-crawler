export const SOURCE_COLORS = {
  blognone: { bg: "#03db7d", text: "#fff" }, // Blognone blue
  theverge: { bg: "#5200ff", text: "#fff" }, // The Verge red
  techcrunch: { bg: "#0aa43e", text: "#fff" }, // TechCrunch green
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
