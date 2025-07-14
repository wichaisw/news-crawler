# Component Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Pages & Layouts                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Home      │  │   News      │  │   Admin     │             │
│  │   Page ✅   │  │   Group     │  │   Group     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Components & Hooks                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   UI        │  │   Layout    │  │   Common    │             │
│  │ Components  │  │ Components  │  │ Components  │             │
│  │   ✅        │  │   ✅        │  │   🚧        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Custom Hooks                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ useNewsFeed │  │useNewsSearch│  │useBookmarks │             │
│  │   🚧        │  │   🚧        │  │   🚧        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  Server Actions & API Routes                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ News        │  │ Crawler     │  │ Search      │             │
│  │ Actions     │  │ Actions     │  │ Actions     │             │
│  │   ✅        │  │   ✅        │  │   🚧        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Library Layer                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Crawler   │  │   Storage   │  │     API     │             │
│  │   Engine    │  │   Manager   │  │   Services  │             │
│  │   ✅        │  │   ✅        │  │   🚧        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                               │
├─────────────────────────────────────────────────────────────────┤
│  JSON Files: sources/<site>/<date>/                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ The Verge   │  │ TechCrunch  │  │ Blognone    │             │
│  │ Data ✅     │  │ Data ✅     │  │ Data ✅     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Status Legend
- ✅ **Completed**: Fully implemented and tested
- 🚧 **In Progress**: Partially implemented
- 🚧 **Planned**: Not yet implemented

## Current Implementation Status

### ✅ **Completed Components**

#### 1. Core Infrastructure
- **Type Definitions**: `news-types.ts`, `crawler-types.ts`, `source-colors.ts`
- **Storage System**: `file-storage.ts`, `content-processor.ts`
- **Crawler Engine**: `crawler-engine.ts` with site configurations

#### 2. News Sources (3/4 Complete)
- **The Verge**: RSS + HTML fallback parser ✅
- **TechCrunch**: RSS + HTML fallback parser ✅ (NEW!)
- **Blognone**: RSS + HTML fallback parser ✅
- **Hacker News**: API-based (planned)

#### 3. API Routes
- **News API**: `/api/news` - Get news with filtering and pagination ✅
- **Source API**: `/api/source` - Crawler control and status ✅

#### 4. Frontend Components
- **Layout**: `Header.tsx`, `Footer.tsx` ✅
- **News Components**: `NewsFeed.tsx`, `NewsCard.tsx`, `NewsListItem.tsx`, `ViewToggle.tsx` ✅
- **Admin Page**: `/sources` - Manual crawler control ✅
- **Home Page**: `/` - News feed display ✅

#### 5. Testing
- **Unit Tests**: All parsers, storage, and components ✅
- **Integration Tests**: API endpoints and component composition ✅
- **Test Coverage**: 103 tests passing ✅

### 🚧 **In Progress / Planned Components**

#### 1. Advanced Frontend Features
- **Search Functionality**: Full-text search across articles
- **Advanced Filtering**: Date range, source filtering, sorting
- **Bookmarking System**: Save and organize articles
- **Pagination**: Infinite scroll or page-based navigation

#### 2. Custom Hooks
- **useNewsFeed**: TanStack Query integration for news data
- **useNewsSearch**: Debounced search with suggestions
- **useNewsFilters**: URL state management for filters
- **useBookmarks**: Bookmark state management

#### 3. Additional Pages
- **Article Detail**: Individual article view with related articles
- **Search Results**: Dedicated search results page
- **Bookmarks**: Saved articles management
- **Admin Settings**: Crawler configuration and monitoring

## Component Hierarchy

### 1. Current Page Structure
```
App Layout ✅
├── Header ✅
├── Main Content
│   ├── Home Page (/) ✅
│   │   └── NewsFeed ✅
│   │       ├── NewsCard[] ✅
│   │       └── ViewToggle ✅
│   │
│   ├── Sources Page (/sources) ✅
│   │   ├── Source Management ✅
│   │   ├── Crawler Controls ✅
│   │   └── Status Display ✅
│   │
│   ├── News Group (/(news)) 🚧
│   │   ├── News List Page 🚧
│   │   ├── Article Detail ([id]) 🚧
│   │   ├── Search Page 🚧
│   │   └── Bookmarks Page 🚧
│   │
│   └── Admin Group (/(admin)) 🚧
│       ├── Crawler Status ✅
│       └── Settings 🚧
│
└── Footer ✅
```

### 2. Component Dependencies

#### Core Components (Current)
```
NewsFeed ✅
├── Depends on: Direct API calls (no hooks yet)
├── Renders: NewsCard[], NewsListItem[]
├── Props: source filter, view mode
└── State: loading, error, data

NewsCard ✅
├── Depends on: Direct props
├── Renders: sourceName, title, description, link, metadata
├── Props: newsItem
└── Actions: open link, display source badge

NewsListItem ✅
├── Depends on: Direct props
├── Renders: Compact news item layout
├── Props: newsItem
└── Actions: open link

ViewToggle ✅
├── Depends on: useNewsView hook
├── Renders: Grid/List view toggle
├── Props: currentView
└── Actions: switch view mode
```

#### Custom Hooks (Current)
```
useNewsView ✅
├── Uses: URL state management
├── Manages: view mode (grid/list)
├── Returns: { view, setView }
└── Dependencies: URL query params
```

#### Planned Custom Hooks
```
useNewsFeed 🚧
├── Uses: TanStack Query
├── Manages: news data, pagination, loading states
├── Returns: { data, isLoading, error, refetch }
└── Dependencies: filters, searchQuery, page

useNewsSearch 🚧
├── Uses: debounced search
├── Manages: search query, suggestions
├── Returns: { query, suggestions, search }
└── Dependencies: search API

useNewsFilters 🚧
├── Uses: URL state management
├── Manages: filter state, URL sync
├── Returns: { filters, updateFilters, clearFilters }
└── Dependencies: nuqs

useBookmarks 🚧
├── Uses: localStorage + API
├── Manages: bookmark state, sync
├── Returns: { bookmarks, addBookmark, removeBookmark }
└── Dependencies: bookmark API
```

## Data Flow

### 1. Current News Loading Flow
```
User visits page
    ↓
NewsFeed component loads
    ↓
Direct API call to /api/news
    ↓
API route processes request
    ↓
FileStorage reads JSON files
    ↓
Data returned and displayed
    ↓
NewsCard/NewsListItem components render
```

### 2. Current Data Collection Flow
```
Admin triggers crawl
    ↓
API route calls CrawlerEngine
    ↓
Site-specific parsers run (RSS first, HTML fallback)
    ↓
Content processed by ContentProcessor
    ↓
Data validated and saved to JSON files
    ↓
FileStorage organizes by date
    ↓
Frontend shows updated data
```

### 3. Planned Search Flow
```
User types in search
    ↓
useNewsSearch debounces input
    ↓
Search API called (/api/search)
    ↓
Search service filters data
    ↓
Results returned
    ↓
SearchResults component renders
```

## State Management

### 1. Current State Management
```typescript
// Simple useState for UI state
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [articles, setArticles] = useState<NewsItem[]>([])

// URL state for view mode
const [view, setView] = useNewsView()
```

### 2. Planned State Management (TanStack Query)
```typescript
// News data
const newsQuery = useQuery({
  queryKey: ['news', filters, page],
  queryFn: () => fetchNews(filters, page),
  staleTime: 5 * 60 * 1000, // 5 minutes
})

// Search results
const searchQuery = useQuery({
  queryKey: ['search', query],
  queryFn: () => searchNews(query),
  enabled: !!query,
})
```

### 3. Planned URL State Management
```typescript
// Filters in URL
const [filters, setFilters] = useQueryState('filters', {
  defaultValue: { sources: [], dateRange: 'all' }
})

// Search query in URL
const [searchQuery, setSearchQuery] = useQueryState('q', {
  defaultValue: ''
})
```

## Performance Considerations

### 1. Current Optimizations
- **Mobile-First Design**: Responsive grid layout (1/2/3 columns)
- **Efficient Data Storage**: JSON files organized by date
- **Content Processing**: Automatic summarization and sanitization
- **Error Handling**: Graceful fallbacks for missing data

### 2. Planned Optimizations
- **Component Optimization**: React.memo for NewsCard components
- **Data Optimization**: Pagination and infinite scroll
- **Bundle Optimization**: Dynamic imports and code splitting
- **Caching**: TanStack Query for efficient data caching

## Mobile Responsiveness

### 1. Current Implementation
```
Desktop: 3-column grid ✅
Tablet: 2-column grid ✅
Mobile: 1-column stack ✅
```

### 2. Current Mobile Features
- **Touch-Friendly Interface**: Proper button sizes and spacing
- **Responsive Typography**: Scalable text sizes
- **Optimized Layout**: Stack layout for mobile
- **Source Badges**: Color-coded source identification

### 3. Planned Mobile Features
- **Swipe Gestures**: Navigation and interactions
- **Pull-to-Refresh**: Data refresh functionality
- **Offline Support**: Service workers for offline access
- **Performance**: Optimized images and bundle size

## Technical Stack

### Current Stack
- **Framework**: Next.js 15 (App Router) ✅
- **Language**: TypeScript ✅
- **UI Library**: React 19 ✅
- **Styling**: Tailwind CSS ✅
- **HTML Parsing**: Cheerio ✅
- **Date Utilities**: date-fns ✅
- **Testing**: Jest + React Testing Library ✅

### Planned Additions
- **Data Fetching**: TanStack Query
- **State Management**: nuqs for URL state
- **UI Components**: Shadcn UI components
- **Validation**: Zod schemas
- **Scheduling**: node-cron for automated crawling

## Next Steps

### Immediate Priorities
1. **Hacker News Integration**: Complete the 4th news source
2. **Search Functionality**: Implement full-text search
3. **Advanced Filtering**: Add source and date filtering
4. **TanStack Query**: Migrate to proper data fetching

### Medium Term Goals
1. **Bookmarking System**: Save and organize articles
2. **Scheduled Crawling**: Automated hourly updates
3. **Admin Dashboard**: Enhanced monitoring and controls
4. **Performance Optimization**: Caching and bundle optimization

### Long Term Vision
1. **Real-time Updates**: WebSocket integration
2. **Advanced Analytics**: User behavior tracking
3. **Export Functionality**: Data export options
4. **API Documentation**: Public API for external integrations 