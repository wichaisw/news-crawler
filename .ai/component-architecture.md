# Component Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Pages & Layouts                                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Home      │  │   News      │  │   Admin     │             │
│  │   Page      │  │   Group     │  │   Group     │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Components & Hooks                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   UI        │  │   Layout    │  │   Common    │             │
│  │ Components  │  │ Components  │  │ Components  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  Custom Hooks                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ useNewsFeed │  │useNewsSearch│  │useBookmarks │             │
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
│  │ Data        │  │ Data        │  │ Data        │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### 1. Page Structure
```
App Layout
├── Header
├── Main Content
│   ├── Home Page (/)
│   │   └── NewsFeed
│   │       ├── NewsFilters
│   │       ├── NewsSearch
│   │       └── NewsCard[]
│   │
│   ├── News Group (/(news))
│   │   ├── News List Page
│   │   │   ├── NewsFeed
│   │   │   ├── NewsFilters
│   │   │   └── NewsPagination
│   │   │
│   │   ├── Article Detail ([id])
│   │   │   ├── ArticleView
│   │   │   ├── RelatedArticles
│   │   │   └── BookmarkButton
│   │   │
│   │   ├── Search Page
│   │   │   ├── SearchResults
│   │   │   └── SearchFilters
│   │   │
│   │   └── Bookmarks Page
│   │       ├── BookmarkedArticles
│   │       └── BookmarkFilters
│   │
│   └── Admin Group (/(admin))
│       ├── Crawler Status
│       └── Settings
│
└── Footer
```

### 2. Component Dependencies

#### Core Components
```
NewsFeed
├── Depends on: useNewsFeed hook
├── Renders: NewsCard[]
├── Props: filters, searchQuery, page
└── State: loading, error, data

NewsCard
├── Depends on: useBookmarks hook
├── Renders: sourceName, title, summary, link, metadata
├── Props: newsItem
└── Actions: bookmark, share, open, copy link

NewsFilters
├── Depends on: useNewsFilters hook
├── Renders: source filter, date filter, sort options
├── Props: currentFilters
└── Actions: updateFilters

NewsSearch
├── Depends on: useNewsSearch hook
├── Renders: search input, suggestions
├── Props: placeholder, defaultValue
└── Actions: search, clear
```

#### Custom Hooks
```
useNewsFeed
├── Uses: TanStack Query
├── Manages: news data, pagination, loading states
├── Returns: { data, isLoading, error, refetch }
└── Dependencies: filters, searchQuery, page

useNewsSearch
├── Uses: debounced search
├── Manages: search query, suggestions
├── Returns: { query, suggestions, search }
└── Dependencies: search API

useNewsFilters
├── Uses: URL state management
├── Manages: filter state, URL sync
├── Returns: { filters, updateFilters, clearFilters }
└── Dependencies: nuqs

useBookmarks
├── Uses: localStorage + API
├── Manages: bookmark state, sync
├── Returns: { bookmarks, addBookmark, removeBookmark }
└── Dependencies: bookmark API
```

## Data Flow

### 1. News Loading Flow
```
User visits page
    ↓
useNewsFeed hook triggered
    ↓
TanStack Query fetches data
    ↓
API route called (/api/news)
    ↓
News service processes request
    ↓
Storage manager reads JSON files
    ↓
Data returned and cached
    ↓
NewsFeed component renders
    ↓
NewsCard components display data
```

### 2. Search Flow
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

### 3. Data Collection Flow
```
Scheduled job triggers
    ↓
Check for available APIs first
    ↓
If API available: Use API
    ↓
If no API: Use crawler
    ↓
Site-specific parsers run
    ↓
Content processed and summarized
    ↓
Data validated and sanitized
    ↓
JSON files saved to storage
    ↓
Cache invalidated
    ↓
Frontend shows updated data
```

## State Management

### 1. Server State (TanStack Query)
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

### 2. Client State (URL State)
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

### 3. Local State (useState)
```typescript
// UI state
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

// Form state
const [formData, setFormData] = useState({})
```

## Performance Considerations

### 1. Component Optimization
- React.memo for NewsCard components
- useMemo for expensive calculations
- useCallback for event handlers
- Lazy loading for images

### 2. Data Optimization
- Pagination to limit data load
- Infinite scroll for better UX
- Efficient caching with TanStack Query
- Debounced search to reduce API calls

### 3. Bundle Optimization
- Dynamic imports for admin pages
- Tree shaking for unused components
- Code splitting by routes
- Optimized images with Next.js Image

## Mobile Responsiveness

### 1. Layout Adaptations
```
Desktop: 3-column grid
Tablet: 2-column grid
Mobile: 1-column stack
```

### 2. Touch Interactions
- Swipe gestures for navigation
- Touch-friendly button sizes
- Proper spacing for thumb navigation
- Pull-to-refresh functionality

### 3. Performance
- Optimized images for mobile
- Reduced bundle size
- Fast loading times
- Offline support with service workers 