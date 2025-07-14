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
- **Bookmarking System**: Save and organize interesting articles
- **Real-time Updates**: Shows latest crawl times and status
- **JSON Data Storage**: Efficient local storage with date-based organization
- **Content Summarization**: AI-powered or extractive summaries for articles

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

## Project Structure

```
src/
├── app/
│   ├── (news)/              # News-related pages
│   │   ├── _components/     # Page-specific components
│   │   ├── _hooks/          # Page-specific hooks
│   │   ├── [id]/            # Article detail pages
│   │   ├── bookmarks/       # Bookmarks page
│   │   ├── search/          # Search results page
│   │   └── page.tsx         # News listing page
│   ├── (admin)/             # Admin pages
│   │   ├── crawler-status/  # Crawler monitoring
│   │   └── settings/        # Application settings
│   ├── api/                 # API routes
│   ├── actions/             # Server actions
│   └── layout.tsx           # Root layout
├── components/
│   ├── ui/                  # Shadcn UI components
│   ├── layout/              # Layout components
│   └── common/              # Reusable components
└── lib/
    ├── crawler/             # Crawler engine and parsers
    ├── storage/             # Data storage utilities
    ├── api/                 # API service layer
    └── types/               # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feed-crawler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   # Crawler settings
   CRAWLER_INTERVAL=3600000  # 1 hour in milliseconds
   MAX_CRAWL_PAGES=5         # Maximum pages to crawl per site
   
   # Storage settings
   DATA_DIR=sources          # Directory for storing crawled data
   
   # API settings
   API_RATE_LIMIT=100        # Requests per minute
   ```

4. **Install Shadcn UI components**
   ```bash
   npx shadcn@latest init
   npx shadcn@latest add button card input select badge avatar skeleton dialog dropdown tabs
   ```

5. **Create data storage directory**
   ```bash
   mkdir -p sources
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Run Setup

1. **Trigger initial crawl**
   - Visit `/sources`
   - Click "Start Crawl" to fetch initial data
   - Wait for the crawl to complete

2. **Verify data storage**
   - Check the `sources/` directory
   - You should see folders for each news source
   - Each folder should contain date-based JSON files

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Crawler management
npm run crawl        # Trigger manual crawl
npm run crawl:status # Check crawler status
```

### Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Follow the component architecture in `.ai/component-architecture.md`
   - Use custom hooks for business logic
   - Implement proper TypeScript types

2. **Component Guidelines**
   - Use Shadcn UI components as base
   - Follow mobile-first responsive design
   - Implement proper error boundaries
   - Add loading states for better UX

3. **Testing**
   - Write unit tests for utilities
   - Test components with React Testing Library
   - Ensure mobile responsiveness
   - Test crawler functionality

### Code Style

- **TypeScript**: Strict mode enabled, prefer interfaces over types
- **React**: Use functional components with hooks
- **Styling**: Tailwind CSS with consistent spacing and colors
- **Naming**: Descriptive names, use auxiliary verbs for booleans
- **Structure**: Follow the established directory structure

## Crawler Configuration

### Supported News Sources

| Source | URL | Method | Frequency | Max Items |
|--------|-----|--------|-----------|-----------|
| Hacker News | https://news.ycombinator.com/ | API | Hourly | 100 |
| The Verge | https://www.theverge.com/ | Crawl | Hourly | 50 |
| TechCrunch | https://techcrunch.com/ | Crawl | Hourly | 50 |
| Blognone | https://www.blognone.com/ | Crawl | Hourly | 50 |

### Adding New Sources

1. **Check for API availability** first
2. **If API exists**: Create API integration in `/src/lib/api/external-apis/`
3. **If no API**: Create parser in `/src/lib/crawler/parsers/`
4. **Add configuration** in `/src/lib/crawler/site-configs.ts`
5. **Update types** in `/src/lib/types/crawler-types.ts`
6. **Test the integration** with sample data

Example API integration:
```typescript
// src/lib/api/external-apis/example-api.ts
export class ExampleApi {
  static async fetchNews(): Promise<NewsItem[]> {
    // API implementation
  }
  
  static async fetchArticle(id: string): Promise<NewsItem> {
    // Single article fetch
  }
}
```

Example parser structure:
```typescript
// src/lib/crawler/parsers/example-parser.ts
export class ExampleParser {
  static parse(html: string): NewsItem[] {
    // Implementation
  }
  
  static getNextPageUrl(html: string): string | null {
    // Implementation
  }
}
```

## User Interface Features

### Date-based Navigation
- **Date Selector**: Dropdown menu to select specific dates for viewing news
- **Smart Date Formatting**: Shows "Today", "Yesterday", or formatted dates
- **Cross-source Date Filtering**: View all news from a specific date across all sources

### Load More Functionality
- **Progressive Loading**: Load articles in batches of 20 for better performance
- **Load More Button**: Shows remaining article count and loads additional articles
- **Pagination Support**: Server-side pagination with proper metadata
- **Loading States**: Visual feedback during article loading

### View Modes
- **Card View**: Grid layout with article cards
- **List View**: Compact list layout for more articles per screen
- **Description Toggle**: Show/hide article descriptions in both views

## API Reference

### News Endpoints

- `GET /api/news` - Get news articles with filters and pagination
- `GET /api/news/[id]` - Get specific article
- `GET /api/search` - Search articles
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Add bookmark
- `DELETE /api/bookmarks/[id]` - Remove bookmark

### Crawler Endpoints

- `GET /api/crawler/status` - Get crawler status
- `POST /api/crawler/trigger` - Trigger manual crawl

### Query Parameters

- `source` - Filter by news source
- `date` - Filter by date (YYYY-MM-DD)
- `page` - Page number for pagination
- `limit` - Number of items per page
- `q` - Search query
- `sort` - Sort order (newest, oldest, relevance)

## Data Storage

### File Structure
```
sources/
├── theverge/
│   ├── 2024-01-15.json
│   ├── 2024-01-16.json
│   └── ...
├── techcrunch/
│   ├── 2024-01-15.json
│   └── ...
├── blognone/
│   └── ...
└── hackernews/
    └── ...
```

### Data Format
```json
{
  "date": "2024-01-15",
  "source": "theverge",
  "articles": [
    {
      "id": "unique-id",
      "title": "Article Title",
      "description": "Article description",
      "summary": "Brief summary of the article content...",
      "url": "https://example.com/article",
      "imageUrl": "https://example.com/image.jpg",
      "publishedAt": "2024-01-15T10:30:00Z",
      "source": "theverge",
      "sourceName": "The Verge",
      "author": "Author Name",
      "tags": ["tag1", "tag2"],
      "displayDate": "Jan 15, 2024 10:30 AM"
    }
  ]
}
```

## Deployment

### Vercel Deployment

1. **Connect repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Deploy** and monitor logs

### Environment Variables

```env
# Production
NODE_ENV=production
CRAWLER_INTERVAL=3600000
MAX_CRAWL_PAGES=5
DATA_DIR=sources
API_RATE_LIMIT=100
```

### Monitoring

- **Crawler Status**: Check `/admin/crawler-status`
- **Error Logs**: Monitor Vercel function logs
- **Performance**: Use Vercel Analytics
- **Uptime**: Set up uptime monitoring

## Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Contribution Guidelines

- Follow the established code style
- Add tests for new features
- Update documentation as needed
- Ensure mobile responsiveness
- Test crawler functionality

## Troubleshooting

### Common Issues

1. **Crawler not working**
   - Check network connectivity
   - Verify site configurations
   - Check error logs in `/admin/crawler-status`

2. **Build errors**
   - Run `npm run build` to identify issues
   - Check TypeScript errors
   - Verify all dependencies are installed

3. **Mobile display issues**
   - Test on actual mobile devices
   - Check responsive breakpoints
   - Verify touch interactions

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
NODE_ENV=development
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check `.ai/` directory for detailed plans
- **Issues**: Create GitHub issues for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions

## Roadmap

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Social sharing integration
- [ ] Export to various formats
- [ ] RSS feed generation
- [ ] Newsletter integration
- [ ] AI-powered content summarization
- [ ] Multi-language support

## Source Color Coding

Each news source is visually identified by its CI color in the UI. The color mapping is managed in `src/lib/types/source-colors.ts`. To add or update a source's color, edit the mapping in that file.

Example:
```ts
export const SOURCE_COLORS = {
  blognone: { bg: "#03db7d", text: "#fff" },
  theverge: { bg: "#5200ff", text: "#fff" },
  // ...
}
```
# news-crawler
