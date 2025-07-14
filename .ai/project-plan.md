# News Feed Crawler - Project Plan

## Project Overview
A mobile-friendly news feed crawler that aggregates news from multiple sources including:
- The Verge (https://www.theverge.com/)
- TechCrunch (https://techcrunch.com/)
- Blognone (https://www.blognone.com/)
- Hacker News (https://news.ycombinator.com/)

## Core Features

### 1. News Crawling System
- **API-first approach** - Use official APIs when available, fallback to crawling
- **Multi-site crawling** with support for different site structures
- **Scheduled crawling** every hour using cron jobs or Next.js API routes
- **Pagination support** to crawl multiple pages per site
- **Data storage** in JSON format at `sources/<site-name>/<date>/`
- **Error handling** and retry mechanisms for failed crawls
- **Content summarization** - Generate brief summaries for articles

### 2. Frontend Features
- **News feed display** with infinite scroll or pagination
- **Site filtering** - view news from specific sources
- **Search functionality** across all news items
- **Mobile-responsive design** with touch-friendly interface
- **Real-time updates** showing latest crawl times
- **Bookmarking system** for saving interesting articles

### 3. Data Management
- **Caching system** to avoid redundant API calls
- **Data validation** and sanitization
- **Archive management** for historical data
- **Export functionality** for saved articles

## Technical Architecture

### Backend Libraries (`/src/lib/`)

#### 1. `/src/lib/crawler/`
- `crawler-engine.ts` - Main crawling orchestration
- `site-configs.ts` - Site-specific configurations
- `parsers/` - Site-specific HTML parsers
  - `theverge-parser.ts`
  - `techcrunch-parser.ts`
  - `blognone-parser.ts`
  - `hackernews-parser.ts`
- `utils/` - Crawling utilities
  - `html-parser.ts`
  - `date-utils.ts`
  - `url-utils.ts`

#### 2. `/src/lib/storage/`
- `file-storage.ts` - JSON file storage operations
- `cache-manager.ts` - Caching logic
- `data-validator.ts` - Data validation schemas
- `content-processor.ts` - Content summarization and processing

#### 3. `/src/lib/api/`
- `news-service.ts` - News data service layer
- `search-service.ts` - Search functionality
- `bookmark-service.ts` - Bookmark management
- `external-apis/` - External API integrations
  - `hackernews-api.ts` - Hacker News API
  - `theverge-api.ts` - The Verge API (if available)
  - `techcrunch-api.ts` - TechCrunch API (if available)
  - `blognone-api.ts` - Blognone API (if available)

#### 4. `/src/lib/types/`
- `news-types.ts` - TypeScript interfaces for news data
- `crawler-types.ts` - Crawler-specific types
- `api-types.ts` - API response types

### Frontend Components

#### 1. Main Pages (`/src/app/`)
- `page.tsx` - Home page with news feed
- `(news)/` - News-related pages
  - `page.tsx` - News listing with filters
  - `[id]/page.tsx` - Individual news article view
  - `search/page.tsx` - Search results page
  - `bookmarks/page.tsx` - Saved articles
- `(admin)/` - Admin pages
  - `crawler-status/page.tsx` - Crawler monitoring
  - `settings/page.tsx` - Application settings

#### 2. Page Components (`/src/app/(news)/_components/`)
- `NewsFeed.tsx` - Main news feed component
- `NewsCard.tsx` - Individual news item card with source, title, summary, and link
- `NewsFilters.tsx` - Filter and search controls
- `NewsPagination.tsx` - Pagination controls
- `NewsSearch.tsx` - Search input component
- `SourceBadge.tsx` - Source name display component
- `ArticleSummary.tsx` - Article summary display with truncation

#### 3. Shared Components (`/src/components/`)
- `ui/` - Shadcn UI components
- `layout/` - Layout components
  - `Header.tsx`
  - `Footer.tsx`
  - `Sidebar.tsx`
- `common/` - Reusable components
  - `LoadingSpinner.tsx`
  - `ErrorBoundary.tsx`
  - `EmptyState.tsx`

#### 4. Custom Hooks (`/src/app/(news)/_hooks/`)
- `useNewsFeed.ts` - News feed data management
- `useNewsSearch.ts` - Search functionality
- `useNewsFilters.ts` - Filter state management
- `useBookmarks.ts` - Bookmark operations

### API Routes (`/src/app/api/`)
- `crawler/route.ts` - Crawler control endpoints
- `news/route.ts` - News data endpoints
- `search/route.ts` - Search API
- `bookmarks/route.ts` - Bookmark management

### Server Actions (`/src/app/actions/`)
- `crawler-actions.ts` - Crawler control actions
- `news-actions.ts` - News data actions
- `bookmark-actions.ts` - Bookmark actions

## Data Models

### News Item Interface
```typescript
interface NewsItem {
  id: string;
  title: string;
  description: string;
  summary: string;        // Brief summary (first paragraph or AI-generated)
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  source: string;
  sourceName: string;     // Display name of the source
  author?: string;
  tags?: string[];
  content?: string;
}
```

### Crawler Configuration
```typescript
interface CrawlerConfig {
  name: string;
  baseUrl: string;
  selectors: {
    article: string;
    title: string;
    description: string;
    link: string;
    image?: string;
    date?: string;
  };
  pagination?: {
    nextPageSelector: string;
    maxPages: number;
  };
}
```

## Implementation Phases

### Phase 1: Core Infrastructure
1. Set up project structure and dependencies
2. Implement basic crawler engine
3. Create data storage system
4. Build basic news feed UI

### Phase 2: Crawler Implementation
1. Implement site-specific parsers
2. Add pagination support
3. Set up scheduled crawling
4. Add error handling and retry logic

### Phase 3: Frontend Features
1. Implement search functionality
2. Add filtering and sorting
3. Create bookmark system
4. Build mobile-responsive design

### Phase 4: Advanced Features
1. Add real-time updates
2. Implement data export
3. Create admin dashboard
4. Add performance optimizations

## Dependencies to Install

### Core Dependencies
- `@tanstack/react-query` - Data fetching and caching
- `cheerio` - HTML parsing for crawlers
- `node-cron` - Scheduled crawling
- `zod` - Data validation
- `date-fns` - Date manipulation
- `clsx` - Conditional CSS classes
- `openai` - AI-powered content summarization (optional)
- `axios` - HTTP client for API calls

### UI Dependencies
- `@radix-ui/react-*` - UI primitives
- `lucide-react` - Icons
- `class-variance-authority` - Component variants
- `tailwind-merge` - Tailwind class merging

### Development Dependencies
- `@types/cheerio` - TypeScript types for cheerio
- `@types/node-cron` - TypeScript types for node-cron

## File Structure
```
src/
├── app/
│   ├── (news)/
│   │   ├── _components/
│   │   ├── _hooks/
│   │   ├── [id]/
│   │   ├── bookmarks/
│   │   ├── search/
│   │   └── page.tsx
│   ├── (admin)/
│   │   ├── crawler-status/
│   │   └── settings/
│   ├── api/
│   ├── actions/
│   └── layout.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── common/
└── lib/
    ├── crawler/
    ├── storage/
    ├── api/
    └── types/
```

## Mobile-First Design Considerations
- Touch-friendly interface with proper spacing
- Swipe gestures for navigation
- Responsive grid layouts
- Optimized images and lazy loading
- Offline support for cached content
- Fast loading times with proper caching

## Performance Optimizations
- Server-side rendering for initial load
- Image optimization with Next.js Image component
- Lazy loading for news items
- Efficient data caching with TanStack Query
- Minimal bundle size with tree shaking
- CDN-friendly static assets

## Security Considerations
- Input sanitization for search queries
- Rate limiting for API endpoints
- Secure file storage for cached data
- XSS prevention in content rendering
- CORS configuration for external APIs 