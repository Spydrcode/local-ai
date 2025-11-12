# Enhanced Data Collection & Business Context Integration

## Implementation Complete ✅

This document summarizes the implementation of Meta Ads Library API integration, enhanced data collection, and business context management across the Local.AI platform.

---

## 1. Meta Ads Library API Integration

### Implementation: `lib/data-collectors/meta-ads-library.ts`

**Features:**

- Full Meta Ads Library API integration
- Competitive intelligence collection
- Ad creative analysis (headlines, body copy, CTAs)
- Platform distribution analysis (Facebook, Instagram, Messenger, Audience Network)
- Spend and impression range tracking
- Automated opportunity identification

**Key Functions:**

```typescript
// Search for ads by keyword
searchAds(params: { searchTerms, countries, limit })

// Get ads from specific Facebook page
getPageAds(pageId, limit)

// Analyze competitor advertising strategy
analyzeCompetitor({ competitorName, pageId })

// Collect intelligence for multiple competitors
collectCompetitiveIntelligence({ competitors, industry })
```

**Data Structures:**

- `MetaAdInsight` - Individual ad data with creative, platforms, targeting
- `CompetitorAdsProfile` - Aggregated competitor advertising profile
- `MetaAdsIntelligence` - Industry-wide competitive intelligence

**Configuration:**
Set environment variable: `META_ADS_LIBRARY_TOKEN`

Get token from: https://www.facebook.com/ads/library/api

---

## 2. Enhanced Data Collector Orchestrator

### Updated: `lib/data-collectors/index.ts`

**New Capabilities:**

- Accepts `BusinessContext` parameter for personalized collection
- Integrates Meta Ads Library data collection
- Merges business context with scraped data
- Returns enriched `DataCollectionResult` with:
  - Traditional data (website, competitors, reviews, SEO, social)
  - Meta Ads competitive intelligence
  - Business context

**Updated Interface:**

```typescript
interface DataCollectionResult {
  business: BusinessData;
  competitors: CompetitorData[];
  reviews: ReviewSummary;
  seo: SEOMetrics;
  social: SocialPresence;
  metaAds?: MetaAdsIntelligence;        // NEW
  businessContext?: BusinessContext;     // NEW
  metadata: { ... }
}
```

**Usage:**

```typescript
const collector = new DataCollector({
  metaAdsToken: process.env.META_ADS_LIBRARY_TOKEN,
});

const result = await collector.collect(url, businessContext);
```

---

## 3. Business Context Collection UI

### New Component: `components/BusinessContextForm.tsx`

**Form Fields:**

- **Basic Information**
  - Industry
  - Sub-Niche
  - Target Audience

- **Primary Services**
  - Dynamic array of services
  - Add/remove functionality

- **Competitors**
  - Name and website
  - Optional Facebook Page ID for Meta Ads
  - Stored as structured array

- **Marketing Goals**
  - Multiple goal tracking
  - Tag-based UI

- **Current Challenges**
  - Business pain points
  - Used for personalized recommendations

- **Budget & Location**
  - Monthly marketing budget
  - Currency selection
  - Geographic scope (multi-location support)

**Features:**

- Real-time validation
- Tag-based chip UI for arrays
- Responsive design
- Dark theme consistent with platform

### New Page: `app/business-context/page.tsx`

**Features:**

- Full-page business context form
- localStorage persistence
- Auto-save functionality
- Clear data option
- Success notifications
- Informational cards explaining benefits

**Navigation:**
Access at: `/business-context`

---

## 4. Framework Orchestrator Integration

### Updated: `lib/agents/marketing-orchestrator.ts`

**Changes:**

- Added `DataCollector` alongside `MarketingIntelligenceCollector`
- Enhanced `MarketingContext` interface with `businessContext` field
- Enhanced `MarketingStrategyResult` with `metaAdsIntelligence` field
- Configured with Meta Ads Library token from environment

**Impact:**
All marketing orchestrators now have access to:

- Business context data
- Competitor advertising intelligence
- Enhanced targeting information

---

## 5. New API Endpoints

### A. Enhanced Data Collection

**Endpoint:** `POST /api/data-collection/enhanced`

**Request:**

```json
{
  "url": "https://example.com",
  "businessContext": {
    "industry": "Restaurant",
    "subNiche": "Texas BBQ Catering",
    "targetAudience": "Corporate events, 100-500 people",
    "primaryServices": ["Catering", "BBQ Platters", "Event Planning"],
    "competitors": [
      { "name": "Competitor A", "website": "https://competitor-a.com" }
    ],
    "marketingGoals": ["Increase catering bookings by 30%"],
    "currentChallenges": ["Low online visibility"],
    "budget": { "monthly": 2000, "currency": "USD" },
    "geographicScope": ["Dallas-Fort Worth", "Houston"]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "business": { ... },
    "competitors": [ ... ],
    "reviews": { ... },
    "seo": { ... },
    "social": { ... },
    "metaAds": {
      "competitors": [ ... ],
      "industryInsights": { ... },
      "opportunities": [ ... ]
    },
    "businessContext": { ... },
    "metadata": {
      "collectedAt": "2025-11-12T...",
      "duration": 45000,
      "sources": ["website-scrape", "competitor-discovery", "meta-ads-library"]
    }
  }
}
```

### B. Meta Ads Competitive Intelligence

**Endpoint:** `POST /api/meta-ads/competitive-intel`

**Request:**

```json
{
  "competitors": [
    { "name": "Restaurant A", "pageId": "123456789" },
    { "name": "Restaurant B" }
  ],
  "industry": "Restaurant"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "competitors": [
      {
        "pageName": "Restaurant A",
        "totalActiveAds": 15,
        "platforms": ["Facebook", "Instagram"],
        "topMessages": ["Daily specials", "Happy hour"],
        "topCTAs": ["Order Now", "Reserve Table"],
        "recentAds": [ ... ]
      }
    ],
    "industryInsights": {
      "totalAdsAnalyzed": 30,
      "commonPlatforms": ["Facebook", "Instagram"],
      "popularCTAs": ["Order Now", "Reserve Table", "Learn More"],
      "averageAdCount": 15
    },
    "opportunities": [
      "Instagram advertising appears underutilized - potential opportunity"
    ]
  }
}
```

**Search Endpoint:** `GET /api/meta-ads/competitive-intel?keyword=restaurant&countries=US`

---

## 6. React Hooks & Utilities

### New Hook: `lib/hooks/useBusinessContext.ts`

**Usage:**

```typescript
import { useBusinessContext } from "@/lib/hooks/useBusinessContext";

function MyComponent() {
  const {
    context, // Current business context
    isLoading, // Loading state
    saveContext, // Save full context
    updateContext, // Update partial context
    clearContext, // Clear all context
    hasContext, // Boolean check
  } = useBusinessContext();

  // Auto-fill form with business context
  useEffect(() => {
    if (context) {
      setIndustry(context.industry);
      setTargetAudience(context.targetAudience);
    }
  }, [context]);
}
```

**Utility Functions:**

```typescript
// Get context synchronously
const context = getStoredBusinessContext();

// Check if context exists
if (hasBusinessContext()) { ... }

// Get marketing context from business context
const marketingCtx = getMarketingContextFromBusinessContext();
```

---

## 7. Environment Variables

Add to `.env.local`:

```env
# Meta Ads Library API Token
META_ADS_LIBRARY_TOKEN=your_token_here
```

**Getting a Token:**

1. Visit https://www.facebook.com/ads/library/api
2. Create a Meta Developer account if needed
3. Create an app and get access token
4. Add token to environment variables

---

## 8. Integration Points

### Existing Pages That Can Leverage New Features:

**1. Demo Builder (`/demo`)**

- Auto-fill industry, target audience from business context
- Use competitor data for better insights
- Include Meta Ads intelligence in recommendations

**2. Content Creator (`/content`)**

- Pre-populate business info from context
- Use competitor messaging analysis for differentiation
- Suggest ad copy based on successful competitor CTAs

**3. Tools (`/tools`)**

- Auto-fill business context in all tools
- Reference competitor strategies
- Personalize recommendations

**4. Analysis Pages**

- Porter Intelligence Stack
- HBS Frameworks
- Strategic Frameworks
  → All can leverage business context for better analysis

---

## 9. Usage Examples

### Example 1: Enhanced Demo Generation

```typescript
// In demo generation
const businessContext = getStoredBusinessContext();
const collector = new DataCollector({
  metaAdsToken: process.env.META_ADS_LIBRARY_TOKEN,
});

const data = await collector.collect(url, businessContext);

// Now you have:
// - data.metaAds.opportunities - competitive gaps to exploit
// - data.businessContext.targetAudience - for personalization
// - data.competitors - with Meta Ads intelligence
```

### Example 2: Competitor Ad Analysis Dashboard

```typescript
// Fetch competitor ads
const response = await fetch("/api/meta-ads/competitive-intel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    competitors: businessContext.competitors,
    industry: businessContext.industry,
  }),
});

const { data } = await response.json();

// Display:
// - Top performing ad messages
// - Platform distribution
// - Opportunities to differentiate
```

### Example 3: Auto-filled Marketing Strategy

```typescript
const context = getStoredBusinessContext();

const strategyRequest = {
  website: "https://example.com",
  businessName: "My Business",
  industry: context.industry,
  targetAudience: context.targetAudience,
  goals: context.marketingGoals,
  currentChallenges: context.currentChallenges,
  businessContext: context, // Full context for deep analysis
};
```

---

## 10. Benefits

**For Users:**

- ✅ Fill out business context once, use everywhere
- ✅ Get personalized insights based on actual competitors
- ✅ See real competitor advertising strategies
- ✅ Identify gaps in competitive landscape
- ✅ Save time with auto-filled forms

**For Developers:**

- ✅ Centralized business context management
- ✅ Reusable React hooks
- ✅ Type-safe interfaces throughout
- ✅ Flexible API endpoints
- ✅ Easy integration with existing orchestrators

**For AI Agents:**

- ✅ Rich business context for better recommendations
- ✅ Real competitive data vs hallucinations
- ✅ Targeted insights for specific sub-niches
- ✅ Budget-aware recommendations
- ✅ Location-specific strategies

---

## 11. Next Steps

**Recommended Enhancements:**

1. **Persist to Database**
   - Store business context in Supabase
   - Associate with user accounts
   - Enable multi-device sync

2. **Visual Competitor Ad Analysis**
   - Build UI to display competitor ads
   - Show ad creative thumbnails
   - Visualize platform distribution

3. **Automated Insights**
   - Daily/weekly competitor ad monitoring
   - Alert when competitors launch new campaigns
   - Track messaging changes over time

4. **Enhanced Orchestrators**
   - Update all framework orchestrators to use business context
   - Add Meta Ads data to Porter Intelligence Stack
   - Include competitor ad analysis in HBS frameworks

5. **Export & Reporting**
   - Generate PDF reports with competitor insights
   - Export ad creative analysis
   - Create competitive positioning maps

---

## 12. Testing

**To test the implementation:**

1. **Navigate to Business Context page:**

   ```
   http://localhost:3000/business-context
   ```

2. **Fill out the form with sample data:**
   - Industry: "Restaurant"
   - Competitors: Add 2-3 real restaurant competitors
   - Marketing goals, challenges, etc.

3. **Test API endpoints:**

   ```bash
   # Enhanced data collection
   curl -X POST http://localhost:3000/api/data-collection/enhanced \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'

   # Meta Ads search (requires token)
   curl "http://localhost:3000/api/meta-ads/competitive-intel?keyword=restaurant&countries=US"
   ```

4. **Check localStorage:**
   Open DevTools → Application → Local Storage → `businessContext`

5. **Use in other pages:**
   - Go to `/demo` - form should auto-fill
   - Go to `/content` - business info pre-populated
   - Go to `/tools` - context available

---

## Summary

✅ **Completed:**

- Meta Ads Library API integration
- Enhanced data collector with business context
- Business context collection UI
- API endpoints for enhanced data collection
- React hooks for context management
- Integration with marketing orchestrators

🎯 **Ready for Use:**
All components are implemented and ready to use. Set `META_ADS_LIBRARY_TOKEN` environment variable to enable Meta Ads features.

📊 **Impact:**

- More personalized AI recommendations
- Real competitive intelligence
- Time savings through auto-fill
- Better targeting and positioning insights
