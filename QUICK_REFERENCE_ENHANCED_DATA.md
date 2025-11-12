# Quick Reference: Enhanced Data Collection & Business Context

## Environment Setup

```bash
# Add to .env.local
META_ADS_LIBRARY_TOKEN=your_token_here
```

Get token: https://www.facebook.com/ads/library/api

---

## Business Context Form

**URL:** `/business-context`

**Fields:**

- Industry & Sub-Niche
- Target Audience
- Primary Services
- Competitors (name + website/pageId)
- Marketing Goals
- Current Challenges
- Monthly Budget & Currency
- Geographic Scope

**Storage:** localStorage (key: `businessContext`)

---

## React Hook

```typescript
import { useBusinessContext } from "@/lib/hooks/useBusinessContext";

const { context, hasContext, saveContext, updateContext, clearContext } =
  useBusinessContext();
```

---

## API Endpoints

### 1. Enhanced Data Collection

```typescript
POST /api/data-collection/enhanced
{
  "url": "https://example.com",
  "businessContext": { ... }
}
```

### 2. Meta Ads Search

```typescript
GET /api/meta-ads/competitive-intel?keyword=restaurant&countries=US
```

### 3. Competitive Intelligence

```typescript
POST /api/meta-ads/competitive-intel
{
  "competitors": [
    { "name": "Restaurant A", "pageId": "123456789" }
  ],
  "industry": "Restaurant"
}
```

---

## Data Collector

```typescript
import { DataCollector } from "@/lib/data-collectors";

const collector = new DataCollector({
  metaAdsToken: process.env.META_ADS_LIBRARY_TOKEN,
});

const result = await collector.collect(url, businessContext);
```

---

## Response Structure

```typescript
{
  business: { ... },          // Scraped website data
  competitors: [ ... ],       // Competitor analysis
  reviews: { ... },           // Review aggregation
  seo: { ... },              // SEO metrics
  social: { ... },           // Social presence
  metaAds: {                 // NEW: Meta Ads intelligence
    competitors: [ ... ],
    industryInsights: { ... },
    opportunities: [ ... ]
  },
  businessContext: { ... },   // NEW: Business context
  metadata: { ... }
}
```

---

## Integration Examples

### Auto-fill Forms

```typescript
const { context } = useBusinessContext();

useEffect(() => {
  if (context) {
    setIndustry(context.industry);
    setTargetAudience(context.targetAudience);
  }
}, [context]);
```

### Enhanced AI Prompts

```typescript
const context = getStoredBusinessContext();

const prompt = `Generate content for ${context?.industry} business
Target: ${context?.targetAudience}
Services: ${context?.primaryServices?.join(", ")}`;
```

### Competitive Analysis

```typescript
const data = await collector.collect(url, context);

// Access Meta Ads insights
const opportunities = data.metaAds?.opportunities;
const topCTAs = data.metaAds?.industryInsights.popularCTAs;
const competitorAds = data.metaAds?.competitors;
```

---

## File Locations

**Core Files:**

- `lib/data-collectors/meta-ads-library.ts` - Meta Ads API
- `lib/data-collectors/index.ts` - Enhanced collector
- `lib/hooks/useBusinessContext.ts` - React hook
- `components/BusinessContextForm.tsx` - Form component
- `app/business-context/page.tsx` - Context page

**API Routes:**

- `pages/api/data-collection/enhanced.ts`
- `pages/api/meta-ads/competitive-intel.ts`

**Examples:**

- `examples/enhanced-data-collection-usage.tsx`

---

## Type Definitions

```typescript
import type {
  BusinessContext,
  MetaAdsIntelligence,
  CompetitorAdsProfile,
  MetaAdInsight,
  DataCollectionResult,
} from "@/lib/data-collectors";
```

---

## Common Patterns

### Pattern 1: Load and Use Context

```typescript
const context = getStoredBusinessContext();
if (!context) {
  // Redirect to /business-context
  router.push("/business-context");
  return;
}
// Use context...
```

### Pattern 2: Conditional Meta Ads Collection

```typescript
const collector = new DataCollector({
  metaAdsToken: process.env.META_ADS_LIBRARY_TOKEN,
});

const result = await collector.collect(url, businessContext);

if (result.metaAds) {
  // Meta Ads data available
  console.log("Opportunities:", result.metaAds.opportunities);
}
```

### Pattern 3: Update Partial Context

```typescript
const { updateContext } = useBusinessContext();

// Add a new competitor
updateContext({
  competitors: [
    ...context.competitors,
    { name: "New Competitor", website: "https://..." },
  ],
});
```

---

## Benefits Summary

✅ One-time setup, use everywhere  
✅ Real competitive data vs AI hallucinations  
✅ Auto-filled forms save time  
✅ Personalized AI insights  
✅ Identify market gaps  
✅ Track competitor advertising  
✅ Budget-aware recommendations  
✅ Location-specific strategies

---

## Troubleshooting

**Meta Ads not working?**

- Check `META_ADS_LIBRARY_TOKEN` is set
- Verify token has not expired
- Ensure competitors have Facebook pages

**Business context not saving?**

- Check browser localStorage is enabled
- Clear cache and try again
- Check browser console for errors

**Data collection slow?**

- Meta Ads collection adds ~1-2 seconds per competitor
- Consider limiting competitors to 3-5 for faster results
- Rate limiting: 1 second delay between competitor requests

---

For full documentation, see: `ENHANCED_DATA_COLLECTION.md`
