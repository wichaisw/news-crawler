export class ContentProcessor {
  static generateSummary(content: string, maxLength: number = 150): string {
    // Extract first paragraph
    const firstParagraph = this.extractFirstParagraph(content);

    // Simple truncation with word boundary
    return this.truncateAtWordBoundary(firstParagraph, maxLength);
  }

  static extractFirstParagraph(content: string): string {
    // Remove HTML tags and extract first meaningful paragraph
    const cleanContent = content.replace(/<[^>]*>/g, "");
    const paragraphs = cleanContent
      .split("\n\n")
      .filter((p) => p.trim().length > 50);
    return paragraphs[0] || cleanContent.slice(0, 200);
  }

  static truncateAtWordBoundary(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;

    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  }

  static sanitizeText(text: string): string {
    return text
      .replace(/<[^>]*>/g, "") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  static generateId(url: string): string {
    // Create a simple hash from URL
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  static normalizeUrl(url: string, baseUrl: string): string {
    if (url.startsWith("http")) {
      return url;
    }
    if (url.startsWith("/")) {
      return new URL(url, baseUrl).href;
    }
    return new URL(url, baseUrl).href;
  }
}
