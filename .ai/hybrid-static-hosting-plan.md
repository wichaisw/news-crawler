# Hybrid Static Hosting Plan

## 🎯 **Objective**
Create a static version of the news feed that reuses existing business logic with minimal changes, while keeping the current server-side version intact.

## 📋 **Strategy: Minimal Changes Approach**

### **Current Architecture Analysis:**
```
NewsFeed Component → API Calls (/api/news, /api/source) → FileStorage → JSON Files
```

### **Hybrid Approach:**
```
Static NewsFeed Component → Direct JSON Fetch → GitHub Repo (same JSON structure)
```

## 🛠️ **Implementation Plan**

### **Phase 1: Create Static Data Fetcher (Reuse Business Logic)**

#### 1.1 Create Static Data Layer
- [ ] Create `/src/lib/static-data/static-news-fetcher.ts` (reuses existing types and logic)
- [ ] Create `/src/lib/static-data/static-source-fetcher.ts` (reuses existing types)
- [ ] **Reuse existing types**: `NewsItem`, `NewsResponse`, etc.
- [ ] **Reuse existing data structure**: Same JSON format as `/sources/`

#### 1.2 Static Fetcher Implementation
```typescript
// src/lib/static-data/static-news-fetcher.ts
import { NewsItem, NewsResponse } from '../types/news-types';

export class StaticNewsFetcher {
  private baseUrl: string;
  
  constructor(baseUrl = 'https://username.github.io/feed-crawler/sources') {
    this.baseUrl = baseUrl;
  }
  
  // Reuse existing business logic patterns
  async getNewsByDate(date: string, source?: string): Promise<NewsItem[]> {
    if (source) {
      return this.fetchSourceData(source, date);
    }
    
    // Same logic as FileStorage.getAllNewsData() but for static
    const sources = ['theverge', 'techcrunch', 'blognone', 'hackernews'];
    const promises = sources.map(s => this.fetchSourceData(s, date));
    const results = await Promise.allSettled(promises);
    
    const allArticles = results
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<NewsItem[]>).value)
      .flat();
    
    // Same sorting logic as FileStorage
    return allArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB.getTime() - dateA.getTime();
    });
  }
  
  async getAvailableDates(): Promise<string[]> {
    // Fetch from a static index file
    const response = await fetch(`${this.baseUrl}/dates.json`);
    if (!response.ok) return [];
    const data = await response.json();
    return data.dates || [];
  }
  
  private async fetchSourceData(source: string, date: string): Promise<NewsItem[]> {
    const url = `${this.baseUrl}/${source}/${date}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return []; // Same fallback as FileStorage
    }
    
    const data: NewsResponse = await response.json();
    
    // Same date conversion logic as FileStorage
    return data.articles.map(article => ({
      ...article,
      publishedAt: new Date(article.publishedAt),
    }));
  }
}
```

### **Phase 2: Create Static NewsFeed Component (Minimal Changes)**

#### 2.1 Create Static NewsFeed
- [ ] Create `/src/app/(static)/_components/StaticNewsFeed.tsx` (copy of existing NewsFeed)
- [ ] **Reuse existing components**: `NewsCard`, `NewsListItem`, `ViewToggle`, `DateSelector`
- [ ] **Reuse existing hooks**: `useNewsView`, `useBookmarks`
- [ ] **Only change**: Replace API calls with static fetcher

#### 2.2 Minimal Changes to NewsFeed
```typescript
// src/app/(static)/_components/StaticNewsFeed.tsx
// Copy of existing NewsFeed.tsx with only these changes:

import { StaticNewsFetcher } from '../../../lib/static-data/static-news-fetcher';

export default function StaticNewsFeed() {
  // ... existing state and hooks (reused exactly)
  
  const staticFetcher = new StaticNewsFetcher();
  
  const fetchAvailableDates = async () => {
    try {
      const dates = await staticFetcher.getAvailableDates();
      setAvailableDates(dates);
    } catch (error) {
      console.error("Failed to fetch available dates:", error);
    }
  };

  const fetchNews = async (date: string, page: number, reset: boolean = false) => {
    try {
      // ... existing loading state logic (reused)
      
      const articles = await staticFetcher.getNewsByDate(date);
      
      // Apply pagination (same logic as API)
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedArticles = articles.slice(startIndex, endIndex);
      
      // ... rest of existing logic (reused)
    } catch (error) {
      // ... existing error handling (reused)
    }
  };
  
  // ... rest of component (reused exactly)
}
```

### **Phase 3: Create Static Home Page**

#### 3.1 Create Static Home Page
- [ ] Create `/src/app/(static)/page.tsx` (copy of existing home page)
- [ ] **Reuse existing layout**: Same Header, Footer, styling
- [ ] **Only change**: Use StaticNewsFeed instead of NewsFeed

```typescript
// src/app/(static)/page.tsx
import StaticNewsFeed from './_components/StaticNewsFeed';

export default function StaticHome() {
  return <StaticNewsFeed />;
}
```

### **Phase 4: Static Export Configuration**

#### 4.1 Next.js Static Export
- [ ] Configure `next.config.ts` for static export
- [ ] Set up base path for GitHub Pages
- [ ] Configure image optimization for static export

```typescript
// next.config.ts (add to existing config)
const nextConfig = {
  // ... existing config
  output: 'export',
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/feed-crawler' : '',
  images: {
    unoptimized: true, // Required for static export
  },
}
```

#### 4.2 GitHub Pages Deployment
- [ ] Create `.github/workflows/deploy-static.yml`
- [ ] Configure GitHub Pages to serve from `/docs`
- [ ] Set up automated deployment on push

### **Phase 5: Data Generation for Static Site**

#### 5.1 Create Dates Index
- [ ] Modify crawler to generate `/sources/dates.json`
- [ ] **Reuse existing logic**: Same date discovery as FileStorage

```typescript
// Add to crawler-engine.ts or create separate script
async function generateDatesIndex() {
  const sources = ['theverge', 'techcrunch', 'blognone', 'hackernews'];
  const allDates = new Set<string>();
  
  for (const source of sources) {
    const dates = await FileStorage.getAvailableDates(source);
    dates.forEach(date => allDates.add(date));
  }
  
  const sortedDates = Array.from(allDates).sort().reverse();
  
  await fs.writeFile(
    path.join(FileStorage.dataDir, 'dates.json'),
    JSON.stringify({ dates: sortedDates }, null, 2)
  );
}
```

#### 5.2 GitHub Actions Workflow
- [ ] Create `.github/workflows/crawl-and-deploy.yml`
- [ ] **Reuse existing crawler**: Same crawling logic
- [ ] Generate dates index after crawling
- [ ] Deploy static site after data update

## 📁 **File Structure (Minimal Changes)**

### **New Files (Static Version):**
```
src/
├── lib/
│   └── static-data/
│       ├── static-news-fetcher.ts     # New (reuses types)
│       └── static-source-fetcher.ts   # New (reuses types)
├── app/
│   └── (static)/
│       ├── _components/
│       │   └── StaticNewsFeed.tsx     # Copy of NewsFeed (minimal changes)
│       └── page.tsx                   # Copy of home page (minimal changes)
├── .github/
│   └── workflows/
│       ├── deploy-static.yml          # New
│       └── crawl-and-deploy.yml       # New
└── next.config.ts                     # Modified (add static export)
```

### **Reused Files (No Changes):**
```
src/
├── lib/
│   ├── types/                         # ✅ Reused exactly
│   ├── storage/                       # ✅ Reused for crawling
│   └── crawler/                       # ✅ Reused for crawling
├── app/
│   ├── (news)/_components/            # ✅ Reused exactly
│   │   ├── NewsCard.tsx
│   │   ├── NewsListItem.tsx
│   │   ├── ViewToggle.tsx
│   │   └── DateSelector.tsx
│   ├── (news)/_hooks/                 # ✅ Reused exactly
│   │   ├── useNewsView.ts
│   │   └── useBookmarks.ts
│   ├── layout.tsx                     # ✅ Reused exactly
│   └── globals.css                    # ✅ Reused exactly
└── components/                        # ✅ Reused exactly
    └── layout/
        ├── Header.tsx
        └── Footer.tsx
```

## 🔧 **Implementation Steps**

### **Step 1: Create Static Data Layer (1-2 hours)**
1. Create `static-news-fetcher.ts` (reuses existing types)
2. Create `static-source-fetcher.ts` (reuses existing types)
3. Test with existing JSON files

### **Step 2: Create Static Components (1-2 hours)**
1. Copy `NewsFeed.tsx` to `StaticNewsFeed.tsx`
2. Replace API calls with static fetcher calls
3. Copy home page to static home page
4. Test static components

### **Step 3: Configure Static Export (30 minutes)**
1. Update `next.config.ts`
2. Test static build locally
3. Verify all components work in static mode

### **Step 4: Set up GitHub Pages (1 hour)**
1. Create GitHub Actions workflows
2. Configure GitHub Pages
3. Test deployment pipeline

### **Step 5: Data Generation (30 minutes)**
1. Add dates index generation to crawler
2. Update GitHub Actions to generate index
3. Test end-to-end pipeline

## ✅ **Benefits of This Approach**

### **Minimal Changes:**
- ✅ **Reuse 95% of existing code**
- ✅ **Same business logic and data structures**
- ✅ **Same UI components and styling**
- ✅ **Same types and interfaces**
- ✅ **Same crawling and storage logic**

### **Dual Deployment:**
- ✅ **Server-side version**: Continue development and testing
- ✅ **Static version**: Deploy to GitHub Pages for free hosting
- ✅ **Same data source**: Both versions use same JSON files

### **Maintenance:**
- ✅ **Single codebase**: Most logic shared between versions
- ✅ **Easy updates**: Changes to business logic apply to both
- ✅ **Testing**: Can test both versions independently

## 🎯 **Success Criteria**

### **Functional Requirements:**
- [ ] Static site displays same news as server version
- [ ] All existing features work (view toggle, date selector, bookmarks)
- [ ] Same data structure and types used
- [ ] Automated deployment to GitHub Pages

### **Performance Requirements:**
- [ ] Static site loads faster than server version
- [ ] JSON fetching works reliably
- [ ] Mobile-friendly design maintained
- [ ] No CORS issues

### **Maintenance Requirements:**
- [ ] Business logic changes apply to both versions
- [ ] Easy to update and deploy
- [ ] Clear separation of static vs server code
- [ ] Comprehensive testing coverage

## 🚀 **Next Steps**

1. **Start with Static Data Layer**: Create the fetchers that reuse existing types
2. **Create Static Components**: Copy and minimally modify existing components
3. **Test Locally**: Ensure static version works with existing data
4. **Deploy to GitHub Pages**: Set up automated deployment
5. **Monitor and Optimize**: Ensure performance and reliability

This approach gives you the best of both worlds: a free GitHub Pages hosting solution with minimal changes to your existing, well-tested business logic. 