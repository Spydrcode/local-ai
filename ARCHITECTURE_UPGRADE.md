# Production-Grade Architecture Upgrade Plan

## Current State vs Target State

### Current (Simple Wrappers)
```
User → API Route → generateContent(prompt) → GPT-4o-mini → Generic Response
```

### Target (Production Multi-Agent System)
```
User → API Route → Orchestrator → Multi-Agent Pipeline → Real Data + Execution
                       ↓
    ┌─────────────────┴──────────────────┐
    │                                     │
    v                                     v
[Data Collection Layer]          [Agent Execution Layer]
- Real competitor scraping       - HBS SWOT Agent
- Google Places API              - Porter Analysis
- Review aggregation             - ReAct Economic Agent
- SEO metrics                    - Content Specialists
- Social media data              ↓
    │                         [Synthesis & Validation]
    │                              ↓
    └────────────→ [AgenticRAG Context] → [Execution Layer]
                                          - Publish to GMB
                                          - Schedule social posts
                                          - Generate & deploy content
```

## Phase 1: Core Infrastructure Wiring (Week 1)

### 1.1 Agent Orchestration Hub
**File:** `lib/agents/production-orchestrator.ts`

**Features:**
- Route requests to appropriate agent pipelines
- Manage multi-agent workflows with dependency resolution
- Circuit breakers and retry logic
- Caching layer (5min TTL for analysis, 1hr for market data)
- Metrics and observability

**Connects:**
- `lib/agents/core/AgentManager.ts` (existing)
- `lib/agents/core/Orchestrator.ts` (existing)
- `lib/agents/unified-agent-system.ts` (existing)

### 1.2 Data Collection Layer
**File:** `lib/data-collectors/index.ts`

**Modules:**
- `CompetitorScraper` - Scrape top 5-10 local competitors
- `ReviewAggregator` - Pull Google/Yelp reviews and ratings
- `GooglePlacesClient` - Business listings, hours, photos, Q&A
- `SEOMetrics` - Page speed, mobile usability, meta tags
- `SocialMediaAnalyzer` - Profile detection and basic metrics

**Implementation:**
```typescript
interface DataCollectionResult {
  business: BusinessData;
  competitors: CompetitorData[];
  reviews: ReviewData[];
  seoMetrics: SEOMetrics;
  socialPresence: SocialData;
}

class DataCollector {
  async collect(url: string): Promise<DataCollectionResult>
  async getCompetitors(business: BusinessData): Promise<CompetitorData[]>
  async getReviews(businessName: string, location: string): Promise<ReviewData[]>
  async analyzeSEO(url: string): Promise<SEOMetrics>
}
```

### 1.3 AgenticRAG Integration
**Upgrade:** `lib/rag/agentic-rag.ts`

**New Features:**
- Store competitor data in vectors
- Index market research and trends
- Cache analysis results for 24hrs
- Cross-business pattern learning

## Phase 2: Multi-Agent Workflows (Week 2)

### 2.1 Strategic Analysis Workflow
**File:** `lib/workflows/strategic-analysis.ts`

**Pipeline:**
```
1. Data Collection (parallel)
   → Scrape business website
   → Find competitors
   → Pull reviews
   → Get SEO metrics

2. Analysis (parallel with synthesis)
   → HBS SWOT Agent
   → Porter 5 Forces (via RAG)
   → ReAct Economic Agent
   → Competitive Intelligence

3. Synthesis
   → Cross-agent validation
   → Priority scoring
   → Confidence levels
   → Action recommendations

4. Output
   → Structured analysis with citations
   → Quick wins with ROI estimates
   → Risk flags and opportunities
```

**Replaces:**
- `app/api/analyze/route.ts` (current simple wrapper)
- `app/api/grow-analysis/route.ts` (current strategic-analysis only)

### 2.2 Content Generation Workflow
**File:** `lib/workflows/content-generation.ts`

**Pipeline:**
```
1. Context Gathering (AgenticRAG)
   → Retrieve business analysis
   → Pull competitor positioning
   → Get brand voice samples
   → Fetch recent performance data

2. Content Planning
   → Identify content gaps
   → Generate topic clusters
   → Plan distribution strategy

3. Content Creation (specialized agents)
   → Social Media Copy Agent
   → Blog Writer Agent
   → Email Sequence Agent
   → Ad Copy Agent

4. Optimization
   → SEO optimization
   → A/B variant generation
   → Platform-specific formatting

5. Execution (optional)
   → Schedule to GMB
   → Queue social posts
   → Send to email platform
```

**Replaces:**
- All 35 tools in `app/api/tools/*/route.ts`

### 2.3 Competitor Intelligence Workflow
**File:** `lib/workflows/competitor-intelligence.ts`

**Pipeline:**
```
1. Discovery
   → Google search for local competitors
   → Scrape competitor websites
   → Find their social profiles

2. Analysis
   → Pricing comparison
   → Service offering gaps
   → Content strategy analysis
   → Review sentiment comparison

3. Market Positioning
   → Competitive matrix
   → Differentiation opportunities
   → Market share estimates
```

## Phase 3: External API Integrations (Week 3)

### 3.1 Google APIs
**File:** `lib/integrations/google/`

**APIs to Integrate:**
- Google Places API (Free tier: 0-100,000 requests/month)
- Google My Business API (for posting)
- Google PageSpeed Insights API (Free)

**Use Cases:**
- Competitor discovery and mapping
- Review aggregation and monitoring
- Auto-posting to GMB
- SEO performance tracking

### 3.2 SEO & Web Data APIs
**File:** `lib/integrations/seo/`

**Options (choose 1-2):**
- **Moz API** - Domain Authority, backlinks ($99/mo for 20k rows)
- **DataForSEO** - Cheaper alternative ($0.03 per SERP page)
- **Bright Data** - Web scraping (pay-as-you-go)

**Alternative (Free/Scraping):**
- Playwright-based SERP scraping (existing)
- OpenPageRank (free DA alternative)
- Manual meta tag extraction

### 3.3 Review Aggregation
**File:** `lib/integrations/reviews/`

**Sources:**
- Google Places API (reviews included)
- Manual Yelp scraping (Playwright)
- Facebook page scraping (if public)

### 3.4 Social Media Publishing
**File:** `lib/integrations/social/`

**APIs:**
- Meta Graph API (Facebook/Instagram posting)
- Twitter/X API v2
- LinkedIn API
- Google My Business API

**Features:**
- OAuth flow for user authorization
- Post scheduling (via BullMQ)
- Media upload and optimization
- Analytics retrieval

## Phase 4: Execution Layer (Week 4)

### 4.1 Job Queue System
**Upgrade:** Use existing BullMQ dependency

**File:** `lib/queue/job-processor.ts`

**Job Types:**
- `scrape-competitors` - Daily competitor monitoring
- `publish-content` - Scheduled social posts
- `review-monitoring` - New review alerts
- `seo-audit` - Weekly SEO checks
- `analysis-refresh` - Re-run analysis monthly

### 4.2 Publishing Engine
**File:** `lib/publishing/publisher.ts`

**Features:**
```typescript
interface PublishingEngine {
  // Schedule content across platforms
  schedulePost(content: Content, platforms: Platform[], schedule: Date): Promise<void>

  // Immediate publishing
  publishNow(content: Content, platform: Platform): Promise<PublishResult>

  // Media handling
  uploadMedia(file: Buffer, platform: Platform): Promise<MediaUrl>

  // Status tracking
  getPublishStatus(jobId: string): Promise<JobStatus>
}
```

### 4.3 Webhook Handlers
**File:** `app/api/webhooks/`

**Endpoints:**
- `/api/webhooks/google-reviews` - New review notifications
- `/api/webhooks/social-mentions` - Brand mentions
- `/api/webhooks/stripe` - Payment events (existing)

## Phase 5: Metrics & Monitoring (Week 5)

### 5.1 Agent Performance Metrics
**File:** `lib/metrics/agent-metrics.ts`

**Track:**
- Agent execution time
- Success/failure rates
- Cache hit rates
- Token usage per agent
- Cost per analysis

### 5.2 Business Metrics Dashboard
**File:** `app/api/metrics/route.ts`

**Expose:**
- Analysis quality scores
- Content performance
- ROI tracking for quick wins
- User engagement metrics

### 5.3 Health Monitoring
**Upgrade:** `app/api/system/health/route.ts`

**Add:**
- External API health checks
- Database connection status
- Queue processing status
- Cache performance
- Error rate monitoring

## Implementation Priority

### Week 1: Foundation
- [ ] Wire ProductionOrchestrator to replace generateContent
- [ ] Integrate HBS agents into analyze endpoint
- [ ] Add AgenticRAG to all content generation
- [ ] Set up basic data collector (website scraping only)

### Week 2: Intelligence
- [ ] Add competitor scraping (Playwright-based)
- [ ] Integrate ReAct agents for market analysis
- [ ] Build strategic analysis workflow
- [ ] Add cross-agent synthesis

### Week 3: Data Sources
- [ ] Google Places API integration
- [ ] Review aggregation (Google + scraping)
- [ ] Basic SEO metrics (PageSpeed + manual)
- [ ] Social profile detection

### Week 4: Execution
- [ ] BullMQ job queue setup
- [ ] GMB posting via Google API
- [ ] Social media OAuth + publishing
- [ ] Content scheduling interface

### Week 5: Production Ready
- [ ] Full metrics and monitoring
- [ ] Error handling and retry logic
- [ ] Rate limiting per API
- [ ] Cost optimization (caching, batching)
- [ ] Documentation and testing

## API Keys Required

### Immediate (Free Tier Available)
- [x] OpenAI API (existing)
- [x] Supabase (existing)
- [x] Pinecone (existing)
- [ ] Google Places API (Free: 100k requests/mo)
- [ ] Google PageSpeed Insights (Free)

### Phase 2 (Paid but Optional)
- [ ] Google My Business API (Free but requires OAuth)
- [ ] Meta Graph API (Free for posting)
- [ ] Moz API or DataForSEO ($99/mo or pay-per-use)

### Phase 3 (Premium Features)
- [ ] Twitter API ($100/mo for posting)
- [ ] LinkedIn API (Free for personal, paid for company pages)
- [ ] Advanced SEO tools (optional)

## Cost Estimate (Monthly)

### Minimal (MVP)
- OpenAI: ~$50-200 (existing usage)
- Supabase: Free tier
- Pinecone: Free tier
- Google APIs: Free tier
**Total: $50-200/mo**

### Production (Full Features)
- OpenAI: ~$200-500
- Supabase: $25 (Pro tier)
- Pinecone: $70 (Standard)
- Google APIs: Free tier
- SEO API: $99 (DataForSEO)
- Social APIs: Free tiers
**Total: ~$400-700/mo**

## Success Metrics

### Quality Improvements
- Analysis specificity score (human eval)
- Quick win relevance rating
- Content uniqueness (vs generic templates)
- Competitive insight accuracy

### Technical Improvements
- Agent execution time: <30s for full analysis
- Cache hit rate: >60% for repeat businesses
- API error rate: <1%
- Cost per analysis: <$0.50

### Business Value
- User retention: +50%
- Feature engagement: +200%
- Referral rate: +30%
- Premium conversion: +100%

---

## Next Steps

1. Review this plan - confirm priorities
2. Set up Google Cloud project for APIs
3. Start with Week 1 foundation work
4. Parallel work on data collectors
5. Incremental deployment with feature flags
