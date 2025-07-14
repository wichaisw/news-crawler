# News Feed Crawler - MVP

This is the MVP (Minimum Viable Product) implementation of the news feed crawler, focusing on The Verge as the first news source.

## Features Implemented

### ✅ Core Infrastructure
- Type definitions for news items, crawler configs, and API responses
- File storage system for saving/loading news data as JSON
- Content processor for generating summaries and sanitizing text
- Basic project structure with proper organization

### ✅ Crawler System
- The Verge parser using Cheerio for HTML parsing
- Crawler engine with configurable site settings
- Pagination support (up to 3 pages)
- Error handling and retry logic
- User-Agent headers for respectful crawling

### ✅ API Routes
- `/api/news` - Get news articles with pagination
- `/api/crawler` - Trigger crawling and get status
- Support for filtering by source and date

### ✅ Frontend Components
- Basic layout with header and footer
- NewsFeed component with loading states
- NewsCard component displaying:
  - Source name (The Verge badge)
  - Original title
  - Brief summary (truncated)
  - Source date and time (relative + absolute)
  - Author information
  - Direct link to source
- Admin page for triggering crawler

### ✅ Mobile-First Design
- Responsive grid layout (1 column mobile, 2 tablet, 3 desktop)
- Touch-friendly interface
- Proper spacing and typography

## How to Use

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Trigger First Crawl
1. Open http://localhost:3000/admin/crawler-status
2. Click "Start Crawl" to fetch articles from The Verge
3. Wait for the crawler to complete

### 4. View News Feed
1. Go to http://localhost:3000
2. View the fetched articles in a responsive grid layout

## Project Structure

```
src/
├── lib/
│   ├── types/
│   │   ├── news-types.ts          # News item interfaces
│   │   └── crawler-types.ts       # Crawler configuration types
│   ├── storage/
│   │   ├── file-storage.ts        # JSON file storage
│   │   └── content-processor.ts   # Content processing utilities
│   └── crawler/
│       ├── crawler-engine.ts      # Main crawler orchestration
│       └── parsers/
│           └── theverge-parser.ts # The Verge HTML parser
├── app/
│   ├── api/
│   │   ├── news/route.ts          # News API endpoint
│   │   └── crawler/route.ts       # Crawler control endpoint
│   ├── (admin)/
│   │   └── crawler-status/page.tsx # Admin interface
│   └── (news)/_components/
│       ├── NewsFeed.tsx           # Main news feed component
│       └── NewsCard.tsx           # Individual article card
└── components/layout/
    ├── Header.tsx                 # Site header
    └── Footer.tsx                 # Site footer
```

## Data Storage

Articles are stored in JSON format at:
```
sources/
└── theverge/
    └── YYYY-MM-DD.json
```

Each JSON file contains:
```json
{
  "date": "2024-01-15",
  "source": "theverge",
  "articles": [
    {
      "id": "unique-id",
      "title": "Article Title",
      "description": "Article description",
      "summary": "Brief summary...",
      "url": "https://theverge.com/article",
      "publishedAt": "2024-01-15T10:30:00Z",
      "source": "theverge",
      "sourceName": "The Verge",
      "author": "Author Name"
    }
  ]
}
```

## Next Steps

This MVP provides a solid foundation for:
1. Adding more news sources (TechCrunch, Blognone, Hacker News)
2. Implementing search and filtering
3. Adding bookmarking functionality
4. Setting up scheduled crawling
5. Enhancing the UI with more advanced components

## Technical Notes

- Uses Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Cheerio for HTML parsing
- date-fns for date formatting
- Responsive design with mobile-first approach 