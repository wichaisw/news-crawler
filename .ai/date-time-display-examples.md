# Date & Time Display Examples

## Display Format

The source date and time will be displayed in a user-friendly format that shows both relative and absolute time information.

### Component Structure

```typescript
// DateTimeDisplay component usage
<DateTimeDisplay 
  date={newsItem.publishedAt}
  showRelative={true}   // "2 hours ago"
  showAbsolute={true}   // "Jan 15, 2024 14:30"
/>
```

### Visual Examples

#### 1. Recent Articles (Last 24 hours)
```
┌─────────────────────────────────────────────────┐
│ [The Verge]                                     │
│                                                 │
│ Apple announces new iPhone features             │
│                                                 │
│ Apple has unveiled several new features for    │
│ the upcoming iPhone release, including...       │
│                                                 │
│ By John Smith • 2 hours ago • Jan 15, 2024 14:30│
│                                     [🔗]        │
└─────────────────────────────────────────────────┘
```

#### 2. Older Articles (1-7 days)
```
┌─────────────────────────────────────────────────┐
│ [TechCrunch]                                    │
│                                                 │
│ Startup raises $50M in Series B funding        │
│                                                 │
│ A promising startup in the AI space has        │
│ successfully closed its Series B round...       │
│                                                 │
│ By Jane Doe • 3 days ago • Jan 12, 2024 09:15  │
│                                     [🔗]        │
└─────────────────────────────────────────────────┘
```

#### 3. Much Older Articles (1+ weeks)
```
┌─────────────────────────────────────────────────┐
│ [Hacker News]                                   │
│                                                 │
│ New programming language gains popularity       │
│                                                 │
│ Developers are increasingly adopting this       │
│ new language for its simplicity and...          │
│                                                 │
│ By Dev User • 2 weeks ago • Jan 01, 2024 16:45 │
│                                     [🔗]        │
└─────────────────────────────────────────────────┘
```

## Date Formatting Rules

### Relative Time Display
- **Just now**: "Just now"
- **Minutes**: "5 minutes ago", "30 minutes ago"
- **Hours**: "1 hour ago", "3 hours ago"
- **Days**: "1 day ago", "3 days ago"
- **Weeks**: "1 week ago", "2 weeks ago"
- **Months**: "1 month ago", "3 months ago"
- **Years**: "1 year ago", "2 years ago"

### Absolute Time Display
- **Format**: "MMM dd, yyyy HH:mm"
- **Examples**: 
  - "Jan 15, 2024 14:30"
  - "Dec 25, 2023 09:15"
  - "Nov 10, 2023 22:45"

### Mobile Optimization

#### Compact Display (Mobile)
```
┌─────────────────────────────────────────────────┐
│ [The Verge]                                     │
│                                                 │
│ Apple announces new iPhone features             │
│                                                 │
│ Apple has unveiled several new features...      │
│                                                 │
│ By John Smith • 2h ago • Jan 15, 14:30    [🔗] │
└─────────────────────────────────────────────────┘
```

#### Full Display (Desktop)
```
┌─────────────────────────────────────────────────┐
│ [The Verge]                                     │
│                                                 │
│ Apple announces new iPhone features             │
│                                                 │
│ Apple has unveiled several new features for    │
│ the upcoming iPhone release, including...       │
│                                                 │
│ By John Smith • 2 hours ago • Jan 15, 2024 14:30│
│                                     [🔗]        │
└─────────────────────────────────────────────────┘
```

## Implementation Details

### DateTimeDisplay Component
```typescript
interface DateTimeDisplayProps {
  date: Date;
  showRelative?: boolean;  // Default: true
  showAbsolute?: boolean;  // Default: true
  compact?: boolean;       // Default: false (for mobile)
}

const DateTimeDisplay: React.FC<DateTimeDisplayProps> = ({
  date,
  showRelative = true,
  showAbsolute = true,
  compact = false
}) => {
  const relativeText = formatDistanceToNow(date, { addSuffix: true });
  const absoluteText = compact 
    ? format(date, 'MMM dd, HH:mm')
    : format(date, 'MMM dd, yyyy HH:mm');
  
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500">
      {showRelative && (
        <time dateTime={date.toISOString()}>
          {relativeText}
        </time>
      )}
      {showRelative && showAbsolute && <span>•</span>}
      {showAbsolute && (
        <time 
          dateTime={date.toISOString()}
          title={format(date, 'EEEE, MMMM dd, yyyy HH:mm')}
        >
          {absoluteText}
        </time>
      )}
    </div>
  );
};
```

### Usage in NewsCard
```typescript
// In NewsCard component
<div className="flex items-center justify-between text-sm text-muted-foreground">
  <div className="flex items-center gap-2">
    {newsItem.author && (
      <span>By {newsItem.author}</span>
    )}
    {newsItem.author && <span>•</span>}
    <DateTimeDisplay 
      date={newsItem.publishedAt}
      compact={isMobile}
    />
  </div>
  
  <ExternalLink href={newsItem.url} />
</div>
```

## Accessibility Features

### Screen Reader Support
- Proper `dateTime` attributes for semantic meaning
- Descriptive `title` attributes for full date/time on hover
- Clear separation between relative and absolute time

### Keyboard Navigation
- Focusable time elements
- Clear visual indicators for interactive elements
- Proper tab order

### Internationalization
- Support for different date formats based on locale
- Configurable date/time display preferences
- RTL language support

## Performance Considerations

### Date Formatting
- Use `date-fns` for efficient date manipulation
- Memoize formatted dates to avoid recalculation
- Lazy load date formatting for off-screen items

### Mobile Optimization
- Compact format for small screens
- Touch-friendly spacing
- Reduced font sizes for mobile
- Swipe gestures for date navigation

## Testing Scenarios

### Date Display Tests
- [ ] Recent articles (within 1 hour)
- [ ] Today's articles (within 24 hours)
- [ ] This week's articles (within 7 days)
- [ ] Older articles (weeks/months ago)
- [ ] Very old articles (years ago)

### Format Tests
- [ ] Relative time accuracy
- [ ] Absolute time formatting
- [ ] Mobile compact display
- [ ] Desktop full display
- [ ] Timezone handling

### Accessibility Tests
- [ ] Screen reader compatibility
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Font size scaling 