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

## 🚀 **Static Site Generation (SSG) for GitHub Pages**

This project is optimized for **free GitHub Pages deployment** using Static Site Generation:

### **How it Works**
- **Static Export**: All pages are pre-rendered at build time
- **No Server Required**: Runs entirely on GitHub Pages (free hosting)
- **Optimized Build**: Sources page excluded from production builds
- **Local Development**: Full functionality available locally

### **Performance Benefits**
- **Free Hosting**: Deploy on GitHub Pages at no cost
- **Fast Loading**: Pre-rendered pages load instantly
- **SEO Optimized**: Search engines can crawl all content
- **No Server Maintenance**: Zero server costs and maintenance
- **Global CDN**: GitHub Pages provides global content delivery

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
npm run build        # Build for production (with API routes)
npm run build:static # Build optimized static site for GitHub Pages
npm run build:github-pages # Alias for build:static
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run crawl        # Crawl all news sources
npm run generate-dates # Generate dates index
npm run deploy:prep  # Full deployment preparation (crawl + build)
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

## Static Site Generation (SSG) Configuration

### Build Optimization
All pages use static generation for GitHub Pages deployment:
```typescript
export const dynamic = "force-static"; // SSG for all pages
```

### Development vs Production
- **Local Development**: Full functionality with API routes and sources page
- **Production Build**: Static export with sources page excluded

### Data Sources
- **Local Development**: `sources/` directory with live API access
- **Production**: Static JSON files in `public/sources/` directory

## Deployment

### GitHub Pages (Recommended - Free)
```bash
# Prepare for deployment
npm run deploy:prep

# The out/ directory is ready for GitHub Pages
# Push to GitHub and enable Pages in repository settings
```

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

### GitHub Pages Setup
1. Create a GitHub repository
2. Push your code to the repository
3. Go to Settings → Pages
4. Set source to "GitHub Actions" or "Deploy from a branch"
5. Use the `out/` directory as the build output

## Performance

- **Initial Page Load**: ~100-200ms (pre-rendered)
- **Subsequent Navigation**: Instant (client-side)
- **Data Updates**: Manual (run `npm run crawl` locally)
- **Caching**: Static files served by GitHub Pages CDN
- **SEO**: Fully optimized with pre-rendered content
- **Hosting Cost**: $0 (GitHub Pages is free)
