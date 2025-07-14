# NewsCard Component Specification

## Display Requirements

The NewsCard component should display news articles with the following information in a clear, mobile-friendly layout:

### Required Information
1. **Source Name** - Display name of the news source (e.g., "The Verge", "TechCrunch")
2. **Original Title** - The exact title from the source
3. **Brief Summary** - Either AI-generated summary or first paragraph (truncated if too long)
4. **Link to Source** - Direct link to the original article
5. **Source Date & Time** - When the article was published (formatted for display)
6. **Author** - Article author (if available)

## Component Structure

### NewsCard.tsx
```typescript
interface NewsCardProps {
  newsItem: NewsItem;
  onBookmark?: (id: string) => void;
  onShare?: (url: string) => void;
  isBookmarked?: boolean;
}

const NewsCard: React.FC<NewsCardProps> = ({
  newsItem,
  onBookmark,
  onShare,
  isBookmarked = false
}) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <SourceBadge source={newsItem.sourceName} />
          <div className="flex items-center gap-2">
            <BookmarkButton 
              isBookmarked={isBookmarked}
              onClick={() => onBookmark?.(newsItem.id)}
            />
            <ShareButton onClick={() => onShare?.(newsItem.url)} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <Link 
          href={newsItem.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block group"
        >
          <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {newsItem.title}
          </h3>
        </Link>
        
        <ArticleSummary 
          summary={newsItem.summary}
          maxLength={150}
        />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {newsItem.author && (
              <span>By {newsItem.author}</span>
            )}
            {newsItem.author && <span>•</span>}
            <DateTimeDisplay date={newsItem.publishedAt} />
          </div>
          
          <ExternalLink 
            href={newsItem.url}
            className="text-blue-600 hover:text-blue-800"
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

### SourceBadge.tsx
```typescript
interface SourceBadgeProps {
  source: string;
}

const SourceBadge: React.FC<SourceBadgeProps> = ({ source }) => {
  const getSourceColor = (source: string) => {
    const colors = {
      'The Verge': 'bg-purple-100 text-purple-800',
      'TechCrunch': 'bg-orange-100 text-orange-800',
      'Blognone': 'bg-green-100 text-green-800',
      'Hacker News': 'bg-red-100 text-red-800',
    };
    return colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Badge className={`${getSourceColor(source)} font-medium`}>
      {source}
    </Badge>
  );
};
```

### ArticleSummary.tsx
```typescript
interface ArticleSummaryProps {
  summary: string;
  maxLength?: number;
}

const ArticleSummary: React.FC<ArticleSummaryProps> = ({ 
  summary, 
  maxLength = 150 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = summary.length > maxLength;
  const displayText = isExpanded ? summary : summary.slice(0, maxLength);

  return (
    <div className="text-sm text-gray-600 leading-relaxed">
      <p>
        {displayText}
        {shouldTruncate && !isExpanded && '...'}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};
```

### DateTimeDisplay.tsx
```typescript
import { formatDistanceToNow, format } from 'date-fns';

interface DateTimeDisplayProps {
  date: Date;
  showRelative?: boolean;
  showAbsolute?: boolean;
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({ 
  date, 
  showRelative = true, 
  showAbsolute = true 
}) => {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      {showRelative && (
        <time dateTime={date.toISOString()}>
          {formatDistanceToNow(date, { addSuffix: true })}
        </time>
      )}
      {showRelative && showAbsolute && <span>•</span>}
      {showAbsolute && (
        <time 
          dateTime={date.toISOString()}
          title={format(date, 'EEEE, MMMM dd, yyyy HH:mm')}
        >
          {format(date, 'MMM dd, yyyy HH:mm')}
        </time>
      )}
    </div>
  );
};
```

## Mobile-First Design

### Responsive Layout
```css
/* Mobile (default) */
.news-card {
  @apply w-full;
}

/* Tablet */
@media (min-width: 768px) {
  .news-card {
    @apply w-1/2;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .news-card {
    @apply w-1/3;
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .news-card {
    @apply w-1/4;
  }
}
```

### Touch-Friendly Interactions
- Minimum touch target size: 44px × 44px
- Hover states for desktop, active states for mobile
- Swipe gestures for quick actions
- Proper spacing between interactive elements

## Content Processing

### Summary Generation
```typescript
// src/lib/storage/content-processor.ts
export class ContentProcessor {
  static generateSummary(content: string, maxLength: number = 150): string {
    // Option 1: Extract first paragraph
    const firstParagraph = this.extractFirstParagraph(content);
    
    // Option 2: AI-powered summary (if OpenAI available)
    if (process.env.OPENAI_API_KEY) {
      return this.generateAISummary(content, maxLength);
    }
    
    // Option 3: Simple truncation with word boundary
    return this.truncateAtWordBoundary(firstParagraph, maxLength);
  }

  static extractFirstParagraph(content: string): string {
    // Remove HTML tags and extract first meaningful paragraph
    const cleanContent = content.replace(/<[^>]*>/g, '');
    const paragraphs = cleanContent.split('\n\n').filter(p => p.trim().length > 50);
    return paragraphs[0] || cleanContent.slice(0, 200);
  }

  static truncateAtWordBoundary(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  }
}
```

## API Integration Priority

### 1. Hacker News API (Available)
```typescript
// src/lib/api/external-apis/hackernews-api.ts
export class HackerNewsApi {
  private static baseUrl = 'https://hacker-news.firebaseio.com/v0';

  static async fetchTopStories(): Promise<NewsItem[]> {
    const response = await fetch(`${this.baseUrl}/topstories.json`);
    const storyIds = await response.json();
    
    const stories = await Promise.all(
      storyIds.slice(0, 100).map(id => this.fetchStory(id))
    );
    
    return stories
      .filter(story => story && story.type === 'story')
      .map(story => this.transformToNewsItem(story));
  }

  private static async fetchStory(id: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/item/${id}.json`);
    return response.json();
  }

  private static transformToNewsItem(story: any): NewsItem {
    return {
      id: story.id.toString(),
      title: story.title,
      description: story.title,
      summary: story.title, // HN doesn't have descriptions
      url: story.url,
      publishedAt: new Date(story.time * 1000),
      source: 'hackernews',
      sourceName: 'Hacker News',
      author: story.by,
      tags: []
    };
  }
}
```

### 2. Crawler Fallback for Other Sources
```typescript
// src/lib/crawler/parsers/theverge-parser.ts
export class TheVergeParser {
  static parse(html: string): NewsItem[] {
    const $ = cheerio.load(html);
    const articles: NewsItem[] = [];

    $('article').each((_, element) => {
      const $article = $(element);
      
      const title = $article.find('h2 a').text().trim();
      const url = $article.find('h2 a').attr('href');
      const description = $article.find('.excerpt').text().trim();
      const author = $article.find('.author').text().trim();
      const publishedAt = $article.find('time').attr('datetime');

      if (title && url) {
        articles.push({
          id: this.generateId(url),
          title,
          description,
          summary: ContentProcessor.generateSummary(description),
          url: this.normalizeUrl(url),
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
          source: 'theverge',
          sourceName: 'The Verge',
          author,
          tags: []
        });
      }
    });

    return articles;
  }
}
```

## Data Flow

### 1. API-First Collection
```
Check if API exists for source
    ↓
If API available: Use API
    ↓
Transform API response to NewsItem format
    ↓
Process content (generate summaries)
    ↓
Save to storage
```

### 2. Crawler Fallback
```
If no API: Use crawler
    ↓
Fetch HTML from source
    ↓
Parse with site-specific parser
    ↓
Extract required information
    ↓
Process content (generate summaries)
    ↓
Save to storage
```

## Success Criteria

### Display Requirements ✅
- [ ] Source name clearly visible with color-coded badges
- [ ] Original title displayed prominently
- [ ] Brief summary (truncated if too long) with "Read more" option
- [ ] Direct link to source article
- [ ] Source date and time displayed (both relative and absolute)
- [ ] Author information (when available)
- [ ] Mobile-responsive design

### Technical Requirements ✅
- [ ] API-first approach with crawler fallback
- [ ] Content summarization (AI or extractive)
- [ ] Proper error handling for missing data
- [ ] Performance optimized for mobile
- [ ] Accessibility compliant
- [ ] SEO-friendly structure

### User Experience ✅
- [ ] Touch-friendly interface
- [ ] Fast loading times
- [ ] Smooth animations
- [ ] Clear visual hierarchy
- [ ] Intuitive navigation
- [ ] Offline support for cached content 