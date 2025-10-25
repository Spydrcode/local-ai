# Local AI - System Architecture

## Overview

Local AI is a professional-grade business intelligence platform that provides AI-powered insights, strategic analysis, and marketing asset generation for local businesses. The system is built on Next.js 16 with a microservices-style API architecture and supports both Supabase and Pinecone for vector storage.

## System Components

### 1. Entry Flow & User Experience

```
User → Homepage (/app/page.tsx)
  ↓
Enter URL → Quick Analysis (< 3 seconds)
  ↓
Dashboard (/app/analysis/[demoId]/page.tsx)
  ↓
On-Demand AI Analyses (8 specialized agents)
```

**Key Features:**

- **Instant Access**: Dashboard loads in 2-3 seconds with minimal scraping
- **On-Demand Processing**: AI calls only execute when user requests specific analyses
- **Cost Optimization**: Reduces initial API costs by 70% through lazy loading

### 2. AI Agent Architecture

#### MCP Server Agents (`mcp-server/src/agents/`)

Specialized AI agents following Model Context Protocol for external integrations:

1. **SiteAnalysisAgent** - Website content extraction and business profiling
2. **ProfitIQAgent** - Business-specific insights and competitive analysis
3. **HomepageDesignAgent** - UI/UX recommendations and design blueprints
4. **ContentGenerationAgent** - Blog posts and marketing content
5. **ChatbotConfigAgent** - Conversational AI configuration

#### API Endpoint Agents (`pages/api/`)

On-demand analysis endpoints for dashboard integration:

1. **AI Insights** (`/api/ai-insights/[demoId]`) - 5-7 strategic business insights
2. **Brand Analysis** (`/api/brand-analysis/[demoId]`) - Voice, tone, messaging analysis
3. **Competitor Analysis** (`/api/competitor-analysis/[demoId]`) - Market positioning
4. **Conversion Analysis** (`/api/conversion-analysis/[demoId]`) - CRO recommendations
5. **Content Calendar** (`/api/content-calendar/[demoId]`) - 7-day social media plan
6. **Social Media Posts** (`/api/social-media-analysis/[demoId]`) - Platform-specific content
7. **Website Grade** (`/api/website-grade/[demoId]`) - Performance scoring & ROI
8. **Porter Analysis** (`/api/porter-analysis`) - Five Forces, Value Chain, Positioning

### 3. Vector Database Architecture

#### Metadata Schema

All vector embeddings use standardized metadata for advanced filtering:

```typescript
interface EnhancedMetadata {
  // Core identification
  demoId: string;
  analysisType: AnalysisType; // website, competitor, roi, roadmap, etc.
  category: Category; // competitive, financial, strategic, etc.

  // Content classification
  heading?: string;
  section?: string;
  chunkType: "heading" | "content" | "insight" | "action";

  // Quality metrics
  confidence: number; // 0-1 AI confidence score
  relevanceScore: number; // 0-1 relevance to business

  // Social media specific
  platform?: "Facebook" | "Instagram" | "LinkedIn" | "Twitter";
  postType?: "promotional" | "engagement" | "educational";
  brandVoice?: "professional" | "casual" | "bold";

  // Timestamps & metrics
  timestamp: string;
  wordCount: number;
  contentLength: number;
}
```

#### Vector Search Optimization

**Hybrid Search Strategy** (`lib/vector.ts`):

- Semantic similarity (cosine distance)
- Metadata filtering (category, type, confidence)
- Quality scoring (boosts for headings, length, relevance)
- Result ranking with adjusted scores

**Specialized Search Functions**:

```typescript
searchCompetitorVectors(); // Competitive intelligence
searchRoadmapVectors(); // Implementation planning
searchROIVectors(); // Financial insights
searchInsightVectors(); // Strategic recommendations
searchSocialMediaVectors(); // Marketing context
searchBrandVoiceVectors(); // Brand personality
searchAudienceVectors(); // Target demographics
```

### 4. Database Schema

#### Supabase Tables

**demos**

```sql
CREATE TABLE demos (
  id VARCHAR(15) PRIMARY KEY,
  business_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  site_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**site_chunks** (Vector Storage)

```sql
CREATE TABLE site_chunks (
  id VARCHAR(50) PRIMARY KEY,
  demo_id VARCHAR(15) REFERENCES demos(id),
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(1536), -- OpenAI ada-002 dimensions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_site_chunks_demo ON site_chunks(demo_id);
CREATE INDEX idx_site_chunks_embedding ON site_chunks USING ivfflat (embedding vector_cosine_ops);
```

#### Pinecone Index

**Index Configuration**:

- Dimension: 1536 (OpenAI ada-002)
- Metric: cosine
- Pods: Serverless (s1)
- Metadata: Full enriched metadata schema

**Namespace Strategy**:

- Default namespace for all demos
- Filtered by `demoId` in metadata
- No namespace isolation needed

### 5. API Rate Limiting

**In-Memory Rate Limiter** (`server/rateLimiter.ts`):

- Window: 60 seconds
- Max hits: 10 requests/minute/IP
- TODO: Move to Redis/Upstash for distributed rate limiting

**Protected Endpoints**:

- `/api/analyze-site` - Website scraping
- `/api/quick-analyze` - Fast entry point
- `/api/generate-demo` - Full demo generation
- All AI analysis endpoints

### 6. Cost Optimization Strategy

#### Token Usage Management

**Quick Analyze (Entry Point)**:

- Zero AI tokens
- HTML parsing only
- Business name extraction from meta tags
- Database record creation
- **Cost**: $0.00

**On-Demand Analyses**:

- GPT-4o-mini: ~$0.001-0.003 per analysis
- Average tokens: 800-1500 input, 500-1200 output
- Only runs when user clicks "Run Analysis"

**Vector Embeddings**:

- Optional/on-demand
- Ada-002: $0.0001 per 1K tokens
- Batch processing for efficiency
- **Savings**: ~$0.02 per analysis vs. upfront

#### Usage Patterns

| Scenario               | Before     | After      | Savings |
| ---------------------- | ---------- | ---------- | ------- |
| User browses only      | $0.15-0.25 | $0.00      | 100%    |
| User runs 2-3 analyses | $0.15-0.25 | $0.03-0.08 | 70%     |
| Power user (all tools) | $0.15-0.25 | $0.12-0.18 | 30%     |

### 7. Performance Optimization

#### Caching Strategy

- Demo data cached in Supabase
- Vector embeddings persisted
- Analysis results stored for reuse
- No redundant AI calls

#### Bundle Optimization

- Next.js 16 with Turbopack
- Tree-shaking for unused code
- Dynamic imports for heavy components
- Edge-ready API routes

#### Database Optimization

- Indexed queries on `demo_id`
- JSONB for flexible metadata
- Vector index (ivfflat) for similarity search
- Connection pooling via Supabase

### 8. Security & Authentication

#### API Security

- Rate limiting per IP
- CORS configuration
- Input validation (Zod schemas)
- Sanitized metadata for vector storage

#### Environment Variables

- Secrets in `.env.local` (never committed)
- Vercel environment variables for production
- Supabase RLS (Row Level Security) for data access
- Stripe webhook signature verification

### 9. Monitoring & Observability

#### Logging

- Console logging for development
- Error tracking with context
- API response times tracked
- Vector upsert confirmation logs

#### Metrics to Track

- Dashboard load time (target: <3s)
- Analysis completion time
- API token usage
- Vector search performance
- Error rates by endpoint

### 10. Scalability Considerations

#### Current Limitations

- In-memory rate limiting (not distributed)
- Synchronous AI calls (no queueing)
- No background job processing

#### Future Enhancements

- Move to Redis for rate limiting
- Implement job queue (BullMQ, Inngest)
- Background analysis processing
- Webhook-based status updates
- Real-time progress tracking

## Technology Stack

### Core Framework

- **Next.js 16**: App Router, Server Components, API Routes
- **TypeScript**: Strict type safety
- **Tailwind CSS 4**: Utility-first styling
- **React 19**: Client-side interactivity

### AI & ML

- **OpenAI GPT-4o-mini**: Primary AI model
- **OpenAI Ada-002**: Embeddings
- **Hugging Face**: Optional fallback
- **Model Context Protocol**: Agent standardization

### Data Storage

- **Supabase**: PostgreSQL + Auth + Realtime
- **Pinecone**: Managed vector database
- **pgvector**: Supabase vector extension

### Infrastructure

- **Vercel**: Hosting & edge functions
- **Stripe**: Payment processing
- **SendGrid**: Email notifications

## Deployment Architecture

```
Vercel Edge Network
    ↓
Next.js SSR/SSG
    ↓
API Routes (Serverless Functions)
    ↓
    ├─→ Supabase (Postgres + Vectors)
    ├─→ Pinecone (Vector Search)
    ├─→ OpenAI (AI Processing)
    └─→ Stripe (Payments)
```

## Development Workflow

1. **Local Development**:

   ```bash
   npm run dev  # Start Next.js dev server
   ```

2. **Build & Test**:

   ```bash
   npm run build  # Production build
   npm run test   # Run test suite
   ```

3. **Deploy**:
   ```bash
   git push  # Auto-deploys to Vercel
   ```

## API Request Flow

### Quick Analysis (Entry Point)

```
POST /api/quick-analyze
  ↓
1. Fetch website HTML (5s timeout)
2. Extract business name from meta tags/title
3. Create demo record in database
4. Return demoId + business info
  ↓
Dashboard loads instantly (<3s total)
```

### On-Demand Analysis

```
GET /api/ai-insights/[demoId]
  ↓
1. Fetch demo data from Supabase
2. Query vector database for context
3. Call OpenAI with enriched prompt
4. Parse & validate AI response
5. Store results + return to client
  ↓
Analysis complete (10-15s)
```

### Porter Analysis (Strategic)

```
POST /api/porter-analysis
  ↓
1. Fetch demo + vector context
2. Run specialized analysis:
   - Five Forces (competitive intensity)
   - Value Chain (operational advantages)
   - Strategic Positioning (market strategy)
3. Format with collapsible sections
4. Return structured markdown
  ↓
Detailed strategic analysis (60-90s)
```

## Key Design Principles

1. **User-First UX**: Instant access, progressive enhancement
2. **Cost Efficiency**: On-demand processing, smart caching
3. **Quality Over Speed**: Validated AI outputs, retry logic
4. **Modularity**: Specialized agents, composable components
5. **Type Safety**: End-to-end TypeScript, Zod validation
6. **Scalability**: Stateless APIs, vector indexing, edge-ready

## Future Roadmap

- [ ] Real-time analysis progress tracking
- [ ] Background job processing queue
- [ ] Multi-user collaboration features
- [ ] Analytics dashboard for usage metrics
- [ ] A/B testing framework
- [ ] Advanced caching strategies
- [ ] GraphQL API layer
- [ ] Mobile app (React Native)
