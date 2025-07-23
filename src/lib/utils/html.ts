// Utility for decoding HTML entities
export function decodeHtmlEntities(text: string | null | undefined): string {
  // Handle null, undefined, or empty strings
  if (!text || typeof text !== "string") {
    return "";
  }

  const entities: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#8217;": "'", // Right single quotation mark
    "&#8216;": "'", // Left single quotation mark
    "&#8220;": '"', // Left double quotation mark
    "&#8221;": '"', // Right double quotation mark
    "&nbsp;": " ",
    "&hellip;": "...",
    "&mdash;": "—",
    "&ndash;": "–",
  };

  return text.replace(/&[^;]+;/g, (entity) => {
    return entities[entity] || entity;
  });
}
