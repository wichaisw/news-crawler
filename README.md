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

## 🚀 **Dual Deployment: API + Static Versions**

This project supports both server-side and static deployments:

### **API Version (Development/Server)**
- **URL**: `http://localhost:3000/` (development) or your domain
- **Features**: Full server-side functionality, admin controls, API routes
- **Data Source**: Local JSON files via API routes
- **Use Case**: Development, testing, full-featured deployment

### **Static Version (GitHub Pages)**
- **URL**: `https://wichaisw.github.io/news-crawler/static/`
- **Features**: Same UI, static data fetching, free hosting
- **Data Source**: Direct JSON fetch from GitHub repo
- **Use Case**: Free hosting, public deployment, CDN benefits

## 📁 **Accessing Both Versions**

### **During Development:**
```bash
npm run dev
```
- **API Version**: `http://localhost:3000/`
- **Static Version**: `http://localhost:3000/static/`

### **Testing Static Build Locally:**
```bash
npm run test:static
npm run build:static
npx serve out/
```
- **Static Site**: `http://localhost:3000/static/`

### **Production Deployment:**
- **Static Site**: `https://wichaisw.github.io/news-crawler/static/`
- **Data Sources**: `https://wichaisw.github.io/news-crawler/sources/`

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
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
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
│   │   └── source/          # Crawler control endpoint
│   └── layout.tsx           # Root layout
├── components/
│   ├── layout/              # Layout components
│   └── ui/                  # UI components
└── lib/
    ├── crawler/             # Crawler engine and parsers
    ├── storage/             # Data storage utilities
    ├── types/               # TypeScript type definitions
    └── api/                 # External API integrations
```

## Data Storage

The application stores crawled data in JSON format:
```
sources/
├── theverge/
│   ├── 2024-01-15.json
│   └── 2024-01-16.json
├── techcrunch/
├── blognone/
└── hackernews/
```

## Troubleshooting

### Common Issues

1. **Docker build fails**
   ```bash
   # Clean and rebuild
   make clean
   make build
   ```

2. **Application not starting**
   ```bash
   # Check logs
   make logs
   
   # Check health
   make health
   ```

3. **No data showing**
   - Visit `/sources` and trigger a crawl
   - Check the `sources/` directory for data files
   - Verify environment variables in `.env.local`

4. **Port already in use**
   ```bash
   # Stop existing containers
   make stop
   
   # Or change port in docker-compose files
   ```

### Debug Mode
Enable debug logging by setting in `.env.local`:
```env
DEBUG=true
NODE_ENV=development
```

## API Endpoints

- `GET /api/news` - Get news articles with filters
- `GET /api/source` - Get available sources
- `POST /api/source` - Trigger manual crawl

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## License

This project is licensed under the MIT License.
