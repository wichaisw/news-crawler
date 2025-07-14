// Utility for decoding HTML entities
export function decodeHtmlEntities(text: string): string {
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
