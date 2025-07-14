# Static Hosting Flow Diagram

## 🔄 **Current vs Static Architecture Comparison**

### **Current Server-Side Flow:**
```mermaid
graph TD
    A[User visits site] --> B[Next.js Server]
    B --> C[NewsFeed Component]
    C --> D[API Call: /api/news]
    D --> E[API Route Handler]
    E --> F[FileStorage.readJSON]
    F --> G[Local JSON Files]
    G --> H[Process & Paginate]
    H --> I[Return JSON Response]
    I --> J[Display News]
    
    K[Admin triggers crawl] --> L[API Call: /api/crawler]
    L --> M[Crawler Engine]
    M --> N[Site Parsers]
    N --> O[Content Processing]
    O --> P[Save to JSON Files]
    P --> G
```

### **New Static Flow:**
```mermaid
graph TD
    A[User visits GitHub Pages] --> B[Static HTML/CSS/JS]
    B --> C[StaticNewsFeed Component]
    C --> D[Direct JSON Fetch]
    D --> E[GitHub Repo: sources/]
    E --> F[JSON Files on GitHub]
    F --> G[Client-side Processing]
    G --> H[Display News]
    
    I[GitHub Actions Daily] --> J[Docker Container]
    J --> K[Crawler Engine]
    K --> L[Site Parsers]
    L --> M[Content Processing]
    M --> N[Save to JSON Files]
    N --> O[Commit to GitHub]
    O --> P[Deploy Static Site]
    P --> B
```

## 🏗️ **Detailed Static Architecture Flow**

```mermaid
graph TB
    subgraph "GitHub Pages (Static Hosting)"
        A[Static Site] --> B[StaticNewsFeed.tsx]
        B --> C[StaticNewsFetcher]
        C --> D[Direct fetch to GitHub]
    end
    
    subgraph "GitHub Repository (Data Storage)"
        D --> E[sources/dates.json]
        D --> F[sources/theverge/2025-07-14.json]
        D --> G[sources/techcrunch/2025-07-14.json]
        D --> H[sources/blognone/2025-07-14.json]
        D --> I[sources/hackernews/2025-07-14.json]
    end
    
    subgraph "GitHub Actions (Automated Crawling)"
        J[Daily Schedule] --> K[Checkout Repo]
        K --> L[Install Dependencies]
        L --> M[Run Crawler]
        M --> N[Process Articles]
        N --> O[Generate dates.json]
        O --> P[Commit Changes]
        P --> Q[Deploy Static Site]
    end
    
    subgraph "Crawler Process (Reused Logic)"
        M --> R[CrawlerEngine]
        R --> S[Site Parsers]
        S --> T[ContentProcessor]
        T --> U[FileStorage]
        U --> V[Save JSON Files]
    end
    
    Q --> A
    V --> F
    V --> G
    V --> H
    V --> I
    V --> E
```

## 🔄 **Data Flow Comparison**

### **Current API Flow:**
```mermaid
sequenceDiagram
    participant U as User
    participant N as NewsFeed
    participant A as API Route
    participant F as FileStorage
    participant J as JSON Files
    
    U->>N: Visit page
    N->>A: GET /api/source
    A->>F: getAvailableDates()
    F->>J: Read directory structure
    J-->>F: Return dates
    F-->>A: Return dates array
    A-->>N: Return dates
    N->>A: GET /api/news?date=2025-07-14
    A->>F: loadNewsData()
    F->>J: Read JSON files
    J-->>F: Return articles
    F-->>A: Return processed articles
    A-->>N: Return paginated response
    N->>U: Display news
```

### **New Static Flow:**
```mermaid
sequenceDiagram
    participant U as User
    participant N as StaticNewsFeed
    participant S as StaticNewsFetcher
    participant G as GitHub Repo
    participant J as JSON Files
    
    U->>N: Visit GitHub Pages
    N->>S: getAvailableDates()
    S->>G: GET /sources/dates.json
    G->>J: Read dates.json
    J-->>G: Return dates array
    G-->>S: Return dates
    S-->>N: Return dates
    N->>S: getNewsByDate('2025-07-14')
    S->>G: GET /sources/*/2025-07-14.json
    G->>J: Read JSON files
    J-->>G: Return articles
    G-->>S: Return articles
    S->>S: Process & paginate client-side
    S-->>N: Return processed articles
    N->>U: Display news
```

## 📁 **File Structure Flow**

```mermaid
graph LR
    subgraph "GitHub Repository"
        A[sources/] --> B[dates.json]
        A --> C[theverge/]
        A --> D[techcrunch/]
        A --> E[blognone/]
        A --> F[hackernews/]
        
        C --> G[2025-07-14.json]
        C --> H[2025-07-13.json]
        D --> I[2025-07-14.json]
        D --> J[2025-07-13.json]
        E --> K[2025-07-14.json]
        E --> L[2025-07-13.json]
        F --> M[2025-07-14.json]
        F --> N[2025-07-13.json]
    end
    
    subgraph "Static Site"
        O[index.html] --> P[StaticNewsFeed.js]
        P --> Q[StaticNewsFetcher.js]
    end
    
    Q --> B
    Q --> G
    Q --> I
    Q --> K
    Q --> M
```

## 🔧 **Component Reuse Flow**

```mermaid
graph TD
    subgraph "Reused Components (No Changes)"
        A[NewsCard.tsx]
        B[NewsListItem.tsx]
        C[ViewToggle.tsx]
        D[DateSelector.tsx]
        E[useNewsView.ts]
        F[useBookmarks.ts]
        G[Header.tsx]
        H[Footer.tsx]
    end
    
    subgraph "Modified Components (Minimal Changes)"
        I[NewsFeed.tsx] --> J[StaticNewsFeed.tsx]
        K[page.tsx] --> L[static/page.tsx]
    end
    
    subgraph "New Components"
        M[StaticNewsFetcher.ts]
        N[StaticSourceFetcher.ts]
    end
    
    J --> A
    J --> B
    J --> C
    J --> D
    J --> E
    J --> F
    J --> M
    L --> J
    L --> G
    L --> H
```

## 🚀 **Deployment Flow**

```mermaid
graph TD
    subgraph "Development"
        A[Local Development] --> B[Test Static Build]
        B --> C[Verify Components]
    end
    
    subgraph "GitHub Actions Pipeline"
        D[Push to Main] --> E[Trigger Workflow]
        E --> F[Install Dependencies]
        F --> G[Run Crawler]
        G --> H[Generate JSON Files]
        H --> I[Build Static Site]
        I --> J[Deploy to GitHub Pages]
    end
    
    subgraph "Production"
        J --> K[Static Site Live]
        K --> L[Users Access Site]
        L --> M[Fetch JSON from GitHub]
        M --> N[Display News]
    end
    
    C --> D
```

## 📊 **Performance Comparison**

```mermaid
graph LR
    subgraph "Current (Server-Side)"
        A[User Request] --> B[Server Processing]
        B --> C[File I/O]
        C --> D[API Response]
        D --> E[Client Render]
    end
    
    subgraph "Static (GitHub Pages)"
        F[User Request] --> G[Static Files]
        G --> H[Direct JSON Fetch]
        H --> I[Client Processing]
        I --> J[Client Render]
    end
    
    style A fill:#ff9999
    style B fill:#ff9999
    style C fill:#ff9999
    style D fill:#ff9999
    style E fill:#99ff99
    
    style F fill:#99ff99
    style G fill:#99ff99
    style H fill:#99ff99
    style I fill:#99ff99
    style J fill:#99ff99
```

## ✅ **Key Benefits Visualization**

```mermaid
mindmap
  root((Static Hosting))
    Free Hosting
      GitHub Pages
      No server costs
      Global CDN
    Code Reuse
      95% existing code
      Same business logic
      Same UI components
    Performance
      Faster loading
      No server processing
      Direct file access
    Maintenance
      Single codebase
      Easy updates
      Dual deployment
    Reliability
      GitHub infrastructure
      Automatic scaling
      Built-in redundancy
``` 