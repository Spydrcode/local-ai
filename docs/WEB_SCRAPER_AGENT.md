# WebScraperAgent Documentation

## Overview

The **WebScraperAgent** is a specialized AI agent that orchestrates comprehensive website intelligence extraction. It extends the `UnifiedAgent` base class and coordinates with multiple data collectors to gather business data from websites.

## Architecture

```
WebScraperAgent
├── DataCollector (comprehensive data)
│   ├── Business info
│   ├── Competitors
│   ├── SEO metrics
│   ├── Social presence
│   ├── Reviews
│   └── Meta Ads (optional)
├── MarketingIntelligenceCollector
│   ├── Brand analysis
│   └── Content analysis
└── Scraper (puppeteer-core/playwright)
    └── Multi-page HTML extraction
```

## Features

### 1. **Comprehensive Scraping** (`scrapeAndAnalyze`)

Collects ALL intelligence data from a website:

- Business profile (name, services, location, contact)
- Competitor analysis
- SEO metrics (PageSpeed, meta tags, technical issues)
- Social media presence
- Customer reviews (aggregated from multiple sources)
- Meta Ads Library data (if enabled)
- Brand voice and messaging analysis
- Content topic analysis
- Raw HTML from multiple pages

**Usage:**

```typescript
import { webScraperAgent } from "./lib/agents/WebScraperAgent";

const result = await webScraperAgent.scrapeAndAnalyze({
  url: "https://example.com",
  paths: ["/", "/about", "/services", "/pricing"],
});

console.log(result.business); // Business data
console.log(result.competitors); // Competitor array
console.log(result.seo); // SEO metrics
console.log(result.social); // Social presence
console.log(result.reviews); // Review summary
console.log(result.brandAnalysis); // Brand voice analysis
console.log(result.contentAnalysis); // Content topics
```

### 2. **Quick Scrape** (`quickScrape`)

Fast extraction of basic business info from homepage only:

- Business name
- Industry/niche
- Core services
- Location
- Description

**Usage:**

```typescript
const quickData = await webScraperAgent.quickScrape("https://example.com");

console.log(quickData.businessName);
console.log(quickData.industry);
console.log(quickData.services);
```

### 3. **Targeted Scrape** (`targetedScrape`)

Extract only specific data types you need (faster, more efficient):

**Usage:**

```typescript
const targeted = await webScraperAgent.targetedScrape({
  url: "https://example.com",
  extractors: {
    business: true,
    seo: true,
    social: true,
    competitors: false, // Skip competitors
    reviews: false, // Skip reviews
    metaAds: false, // Skip Meta Ads
  },
});

console.log(targeted.business); // ✓ Included
console.log(targeted.seo); // ✓ Included
console.log(targeted.social); // ✓ Included
console.log(targeted.competitors); // undefined (skipped)
```

## Configuration

### Environment Variables

```env
# Required for Meta Ads Library data collection
META_ADS_LIBRARY_TOKEN=your_meta_ads_token

# OpenAI for AI agent analysis
OPENAI_API_KEY=sk-proj-...

# Puppeteer settings (auto-detected for Vercel)
VERCEL=1  # Set automatically on Vercel
```

### Agent Configuration

The agent is pre-configured with:

- **Temperature:** 0.3 (factual extraction)
- **Max Tokens:** 3000
- **JSON Mode:** Enabled
- **System Prompt:** Specialized for web intelligence extraction

## Data Collectors

### DataCollector Options

```typescript
new DataCollector({
  maxCompetitors: 10, // Max competitors to discover
  maxReviews: 50, // Max reviews to aggregate
  timeout: 60000, // 60 second timeout
  enableCache: true, // Cache results
  metaAdsToken: "...", // Meta Ads Library token
});
```

### MarketingIntelligenceCollector

Automatically analyzes:

- **Brand Voice:** Tone, style, personality from website content
- **Content Topics:** Main themes, keywords, content strategy

## Output Format

### WebScraperResult Interface

```typescript
interface WebScraperResult {
  // Core Data (from DataCollector)
  business?: BusinessData;
  competitors?: CompetitorData[];
  seo?: SEOMetrics;
  social?: SocialPresence;
  reviews?: ReviewSummary;
  metaAds?: MetaAdsIntelligence;

  // Marketing Intelligence
  brandAnalysis?: BrandAnalysis;
  contentAnalysis?: ContentAnalysis;

  // Raw Content
  rawPages?: Record<string, string>;

  // Metadata
  scrapedAt: string;
  url: string;
  metadata?: {
    collectedAt: string;
    duration: number;
    sources: string[];
    warnings?: string[];
  };
}
```

## API Endpoint Integration

### Create API Route

**File:** `app/api/web-scraper/route.ts`

```typescript
import { webScraperAgent } from "@/lib/agents/WebScraperAgent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url, mode = "comprehensive", paths, extractors } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let result;

    switch (mode) {
      case "quick":
        result = await webScraperAgent.quickScrape(url);
        break;

      case "targeted":
        result = await webScraperAgent.targetedScrape({ url, extractors });
        break;

      case "comprehensive":
      default:
        result = await webScraperAgent.scrapeAndAnalyze({ url, paths });
        break;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[API] Web scraper error:", error);
    return NextResponse.json(
      { error: "Scraping failed", message: error.message },
      { status: 500 }
    );
  }
}
```

### Dashboard Integration

**Add to `app/dashboard/page.tsx`:**

```typescript
const handleWebScraper = async (
  url: string,
  mode: "quick" | "targeted" | "comprehensive"
) => {
  try {
    setLoading(true);

    const response = await fetch("/api/web-scraper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        mode,
        extractors: {
          // For targeted mode
          business: true,
          seo: true,
          social: true,
          competitors: false,
        },
      }),
    });

    const { data } = await response.json();

    // Store in sessionStorage for all tools to use
    sessionStorage.setItem("webScraperResult", JSON.stringify(data));

    setResults(data);
  } catch (error) {
    console.error("Scraping error:", error);
  } finally {
    setLoading(false);
  }
};
```

## Use Cases

### 1. **Marketing Strategy Generation**

```typescript
// Collect comprehensive data
const data = await webScraperAgent.scrapeAndAnalyze({ url: clientWebsite });

// Pass to MarketingOrchestrator
const strategy = await marketingOrchestrator.executeFullMarketingStrategy({
  website: clientWebsite,
  businessInfo: data.business,
  competitors: data.competitors,
  seo: data.seo,
  social: data.social,
});
```

### 2. **Competitive Analysis Dashboard**

```typescript
// Quick scrape for multiple competitors
const competitorUrls = [
  "competitor1.com",
  "competitor2.com",
  "competitor3.com",
];
const competitorData = await Promise.all(
  competitorUrls.map((url) => webScraperAgent.quickScrape(url))
);

// Display side-by-side comparison
```

### 3. **SEO Audit Tool**

```typescript
// Targeted scrape for SEO data only
const seoData = await webScraperAgent.targetedScrape({
  url: clientWebsite,
  extractors: { business: true, seo: true },
});

// Generate SEO recommendations
```

### 4. **Content Strategy Builder**

```typescript
// Get brand + content analysis
const data = await webScraperAgent.scrapeAndAnalyze({ url: clientWebsite });

// Use for content generation
const blogPost = await generateBlogPost({
  brandVoice: data.brandAnalysis.tone,
  topics: data.contentAnalysis.mainTopics,
  keywords: data.seo.metaTags.keywords,
});
```

## Performance

### Scraping Times (Approximate)

| Mode          | Pages Scraped | Data Collected      | Time          |
| ------------- | ------------- | ------------------- | ------------- |
| Quick         | 1 (homepage)  | Basic business info | 3-5 seconds   |
| Targeted      | 1-4 pages     | Selected data types | 10-20 seconds |
| Comprehensive | 4-6 pages     | ALL intelligence    | 30-60 seconds |

### Optimization Tips

1. **Use Quick Scrape** for real-time user-facing features
2. **Use Targeted Scrape** when you know what data you need
3. **Use Comprehensive Scrape** for background jobs, reports, strategy generation
4. **Enable caching** in DataCollector to avoid re-scraping
5. **Set appropriate timeouts** based on your use case

## Error Handling

The agent includes comprehensive error handling:

```typescript
try {
  const result = await webScraperAgent.scrapeAndAnalyze({ url });
} catch (error) {
  if (error.message.includes("timeout")) {
    // Handle timeout (website too slow)
  } else if (error.message.includes("404")) {
    // Handle not found
  } else if (error.message.includes("blocked")) {
    // Handle bot detection
  } else {
    // Generic error
  }
}
```

## Best Practices

1. **Always validate URLs** before scraping
2. **Use targetedScrape** for specific use cases (faster, cheaper)
3. **Cache results** when possible (sessionStorage, Redis, etc.)
4. **Set reasonable timeouts** to avoid hanging requests
5. **Handle errors gracefully** - websites may block bots
6. **Respect robots.txt** (not enforced, but good practice)
7. **Rate limit** API endpoints that use the agent

## Troubleshooting

### Common Issues

**Issue:** Scraping fails on Vercel

- **Solution:** Uses puppeteer-core with @sparticuz/chromium automatically

**Issue:** Meta Ads data not collected

- **Solution:** Set META_ADS_LIBRARY_TOKEN environment variable

**Issue:** Competitor discovery returns empty

- **Solution:** Some websites don't list competitors - this is expected

**Issue:** Reviews not found

- **Solution:** Google My Business listing may not exist for this business

**Issue:** Timeout errors

- **Solution:** Increase timeout in DataCollector options or use quickScrape

## Example Implementation

See `lib/agents/marketing-orchestrator.ts` for a complete example of using WebScraperAgent in a production workflow.

## Next Steps

1. Create `/api/web-scraper` endpoint (see API Integration above)
2. Add WebScraperAgent to dashboard UI
3. Configure environment variables
4. Test with sample websites
5. Integrate with existing tools (marketing strategy, SEO audit, etc.)

## Related Files

- `lib/agents/WebScraperAgent.ts` - Main agent implementation
- `lib/data-collectors/index.ts` - Comprehensive data collector
- `lib/data-collectors/marketing-intelligence-collector.ts` - Brand & content analysis
- `lib/scraper.ts` - Multi-page scraping with puppeteer
- `lib/agents/unified-agent-system.ts` - Base agent class
- `lib/agents/marketing-orchestrator.ts` - Example usage

---

**Status:** ✅ Implemented and ready to use
**Last Updated:** 2025-01-12
