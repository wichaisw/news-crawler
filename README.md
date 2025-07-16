# News Feed Crawler

A mobile-friendly news feed crawler that aggregates news from multiple sources including The Verge, TechCrunch, Blognone, and Hacker News. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS.

## Features

- **API-First News Collection**: Uses official APIs when available, falls back to crawling
- **Multi-source News Aggregation**: Collects news from 4 major tech news sources
- **Rich Article Display**: Shows source name, original title, brief summary, source date/time, and direct links
- **Scheduled Updates**: Automatically updates news every hour
- **Mobile-First Design**: Responsive interface optimized for mobile devices
- **Advanced Search**: Full-text search across all news articles
- **Smart Filtering**: Filter by source, date, and tags
- **Date-based Navigation**: Browse news by specific dates with easy date selector
- **Load More Functionality**: Progressive loading of articles with pagination
- **View Toggle**: Switch between card and list views on both home and bookmarks pages
- **Bookmarking System**: Save and organize interesting articles
- **Real-time Updates**: Shows latest crawl times and status
- **JSON Data Storage**: Efficient local storage with date-based organization
- **Content Summarization**: AI-powered or extractive summaries for articles
- **ISR (Incremental Static Regeneration)**: Automatic page regeneration every hour for optimal performance

## 🚀 **ISR-Powered Deployment**

This project uses Next.js ISR (Incremental Static Regeneration) for optimal performance:

### **How it Works**
- **Initial Build**: Pages are pre-rendered with the latest news data
- **Automatic Updates**: Pages regenerate every hour automatically
- **On-Demand Revalidation**: Trigger immediate updates after crawling
- **Fallback Support**: Users always see content, even if regeneration fails

### **Performance Benefits**
- **Fast Initial Load**: Pre-rendered pages load instantly
- **Automatic Caching**: Efficient caching with automatic invalidation
- **SEO Optimized**: Search engines can crawl all content
- **Scalable**: Handles traffic spikes without performance issues

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn UI + Radix UI
- **Data Fetching**: TanStack Query
- **State Management**: URL state with nuqs
- **HTML Parsing**: Cheerio
- **Scheduling**: node-cron
- **Validation**: Zod
- **Date Utilities**: date-fns

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd feed-crawler
```

### 2. Environment Setup
```bash
# Copy environment file
cp env.example .env.local

# Edit .env.local if needed (optional)
# The default settings work for most cases
```

### 3. Build and Run
```bash
# Development mode (recommended for first run)
make dev

# Or production mode with nginx
make prod
```

### 4. Access the Application
- **Development**: http://localhost:3000
- **Production**: http://localhost (with nginx)

### 5. First Run Setup
1. Visit http://localhost:3000/sources
2. Click "Start Crawl" to fetch initial data
3. Wait for the crawl to complete
4. Return to http://localhost:3000 to view news

## Docker Commands

```bash
# Build the image
make build

# Run the application
make run

# Stop the application
make stop

# View logs
make logs

# Open shell in container
make shell

# Clean up
make clean

# Health check
make health

# Backup data
make backup

# Restore data
make restore BACKUP_FILE=backup-20231201-120000.tar.gz
```

## Development Setup

### Prerequisites
- Node.js 24+ (use `nvm use` to switch to the correct version)
- npm or yarn
- Git

### Installation
```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env.local

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with ISR
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run crawl        # Crawl all news sources
npm run generate-dates # Generate dates index
```

## Project Structure

```
src/
├── app/
│   ├── (news)/              # News-related pages
│   │   ├── _components/     # Page-specific components
│   │   ├── _hooks/          # Page-specific hooks
│   │   ├── bookmarks/       # Bookmarks page
│   │   └── page.tsx         # News feed page
│   ├── sources/             # Admin page for crawling
│   ├── api/                 # API routes
│   │   ├── news/            # News data endpoint
│   │   ├── source/          # Crawler control endpoint
│   │   └── revalidate/      # ISR revalidation endpoint
│   └── layout.tsx           # Root layout
├── components/
│   ├── layout/              # Layout components
│   └── ui/                  # UI components
└── lib/
    ├── crawler/             # Crawler engine and parsers
    ├── storage/             # Data storage utilities
    ├── static-data/         # Static data fetchers for ISR
    ├── types/               # TypeScript type definitions
    └── api/                 # External API integrations
```

## ISR Configuration

### Automatic Revalidation
The main page automatically regenerates every hour:
```typescript
export const revalidate = 3600; // 1 hour
```

### On-Demand Revalidation
Trigger immediate updates after crawling:
```bash
curl -X POST http://localhost:3000/api/revalidate
```

### Data Sources
- **Local Development**: `sources/` directory
- **Production**: Same `sources/` directory (copied to `public/` during build)

## Deployment

### Standard Next.js Deployment
```bash
npm run build
npm start
```

### With Docker
```bash
make build
make run
```

### Environment Variables
- `NEXT_PUBLIC_STATIC_BASE_URL`: Base URL for static data (optional)
- `NODE_ENV`: Environment (development/production)

## Performance

- **Initial Page Load**: ~100-200ms (pre-rendered)
- **Subsequent Navigation**: Instant (client-side)
- **Data Updates**: Every hour (automatic) or on-demand
- **Caching**: Automatic with Next.js ISR
- **SEO**: Fully optimized with pre-rendered content
