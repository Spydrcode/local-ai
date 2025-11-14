# 10-Tool Unified Dashboard Refactoring Guide

## ✅ Status: ARCHITECTURE DESIGNED - READY FOR IMPLEMENTATION

This document outlines the complete refactoring of 50+ fragmented tools into 10 unified, agent-powered tools while preserving the existing agentic framework.

---

## 📋 Implementation Checklist

### Phase 1: Foundation ✅ COMPLETE

- [x] Created unified tool definitions (`lib/tools/unified-tools.ts`)
- [x] Created output schemas (`lib/tools/unified-tool-schemas.ts`)
- [x] Mapped existing agents to new tools
- [x] Designed tool categories and UI structure

### Phase 2: Agent Interfaces (IN PROGRESS)

- [ ] Audit all existing agent method signatures
- [ ] Create agent interface adapters for unified tools
- [ ] Update agent methods to accept intelligence parameter
- [ ] Test agent RAG integration with seeded vectors

### Phase 3: API Routes

- [ ] Implement `/api/tools/business-audit` (uses multiple agents)
- [ ] Implement `/api/tools/social-content` (platform router)
- [ ] Implement `/api/tools/blog-seo-writer` (content type router)
- [ ] Implement `/api/tools/website-copy` (page type router)
- [ ] Implement `/api/tools/review-manager` (action type router)
- [ ] Implement `/api/tools/email-hub` (email type router)
- [ ] Implement `/api/tools/ad-copy` (platform + goal router)
- [ ] Implement `/api/tools/objection-handler` (objection type router)
- [ ] Implement `/api/tools/pricing-strategy` (uses pricing agent)
- [ ] Implement `/api/tools/service-packages` (package type router)

### Phase 4: Dashboard UI

- [ ] Update `app/dashboard/page.tsx` with 4 categories
- [ ] Remove 50+ old tools, add 10 new tools
- [ ] Update tool result display formatting
- [ ] Add input forms for tools that need them
- [ ] Test tool execution flow

### Phase 5: Cleanup

- [ ] Remove deprecated API routes
- [ ] Keep all agent files (DO NOT DELETE)
- [ ] Update documentation
- [ ] Test all 10 tools end-to-end

---

## 🎯 THE 10 UNIFIED TOOLS

### 1. **Business Audit / Strategic Dashboard** 🎯

**Category**: Strategic Growth  
**Agents**: WebScraperAgent, BlueOceanStrategy, PorterForces, CompetitiveAnalysis, LocalSEO

**What it does**:

- Full SWOT analysis
- Porter's 5 Forces competitive analysis
- Blue Ocean opportunity identification
- Competitor intelligence
- Content gap analysis
- Local SEO recommendations
- Strategic priorities with timeframes

**Replaces**:

- All diagnostic tools
- Competitive analysis tools
- SEO audit tools
- Positioning tools

**API Endpoint**: `/api/tools/business-audit`

**Output Schema**: `BusinessAuditOutput`

---

### 2. **Social Content Generator** 📱

**Category**: Marketing & Content  
**Agents**: FacebookMarketingAgent, InstagramMarketingAgent, LinkedInMarketingAgent

**What it does**:

- Platform-specific content (FB, IG, LinkedIn, TikTok, GMB)
- Auto-generates topics from business intelligence
- Hashtag + emoji optimization
- Best posting times
- Engagement strategies

**Inputs**:

```typescript
{
  platform: 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'gmb',
  content_type?: 'promotional' | 'educational' | 'testimonial' | 'event',
  topic?: string, // Auto-generated if blank
  generate_variations?: boolean
}
```

**Replaces**:

- Facebook Post tool
- Instagram Post tool
- LinkedIn Post tool
- GMB Post tool
- Social Testimonial tool

**API Endpoint**: `/api/tools/social-content`

**Output Schema**: `SocialContentOutput`

---

### 3. **Blog + SEO Writer** ✍️

**Category**: Marketing & Content  
**Agents**: BlogWriterAgent, LocalSEOAgent

**What it does**:

- Blog posts (500-700 words)
- Service pages
- Location pages
- Meta tags
- SEO keyword integration
- Auto-topic generation

**Inputs**:

```typescript
{
  content_type: 'blog' | 'service-page' | 'location-page' | 'meta-tags',
  topic?: string, // Auto-generated
  tone?: 'educational' | 'authoritative' | 'conversational' | 'inspirational'
}
```

**Replaces**:

- Blog Writer
- Local SEO Meta
- Location Page Writer

**API Endpoint**: `/api/tools/blog-seo-writer`

**Output Schema**: `BlogSEOOutput`

---

### 4. **Website Copy & Brand Messaging** 🌐

**Category**: Marketing & Content  
**Agents**: BlogWriterAgent, FAQAgent

**What it does**:

- Landing pages
- About Us pages
- Why Choose Us pages
- USP generation
- Positioning statements
- Case studies
- FAQ sections
- Service descriptions

**Inputs**:

```typescript
{
  page_type: 'landing-page' | 'about-us' | 'why-choose-us' | 'usp' |
             'positioning-statement' | 'case-study' | 'faq' | 'service-description',
  focus?: string // Uses business differentiators by default
}
```

**Replaces**:

- Landing Page tool
- Why Choose Us tool
- USP Generator
- Positioning Statement
- Case Study Writer
- FAQ Builder

**API Endpoint**: `/api/tools/website-copy`

**Output Schema**: `WebsiteCopyOutput`

---

### 5. **Review & Reputation Manager** ⭐

**Category**: Operations & Reputation  
**Agents**: FacebookMarketingAgent, InstagramMarketingAgent

**What it does**:

- Respond to positive reviews
- Respond to negative reviews
- Request testimonials
- Turn reviews into social posts
- Reputation management strategies

**Inputs**:

```typescript
{
  action_type: 'respond-positive' | 'respond-negative' |
               'request-testimonial' | 'create-social-post',
  review_text?: string,
  rating?: '1' | '2' | '3' | '4' | '5'
}
```

**Replaces**:

- Review Responder
- Negative Review Handler
- Testimonial Request
- Social Testimonial

**API Endpoint**: `/api/tools/review-manager`

**Output Schema**: `ReviewManagerOutput`

---

### 6. **Email Marketing & Automation Hub** 📧

**Category**: Marketing & Content  
**Agents**: NewsletterAgent

**What it does**:

- Welcome sequences
- Sales sequences
- Win-back emails
- Referral requests
- Testimonial requests
- Newsletters
- Transactional emails
- Follow-up emails

**Inputs**:

```typescript
{
  email_type: 'welcome-sequence' | 'sales-sequence' | 'win-back' |
              'referral-request' | 'testimonial-request' | 'newsletter' |
              'booking-confirmation' | 'invoice-followup' | 'networking-followup',
  email_count?: '1' | '3' | '5' // For sequences
}
```

**Replaces**:

- Win-Back Email
- Referral Request
- Testimonial Request
- Newsletter Creator
- Booking Confirmation
- Invoice Follow-up
- Networking Follow-up
- Sales Sequence

**API Endpoint**: `/api/tools/email-hub`

**Output Schema**: `EmailHubOutput`

---

### 7. **Ad Copy Generator** 📢

**Category**: Marketing & Content  
**Agents**: FacebookMarketingAgent, InstagramMarketingAgent

**What it does**:

- Facebook ads
- Instagram ads
- Google ads
- Multiple variations
- Audience targeting recommendations
- Creative suggestions
- Budget recommendations

**Inputs**:

```typescript
{
  platform: 'facebook' | 'instagram' | 'google',
  campaign_goal: 'awareness' | 'traffic' | 'leads' | 'sales',
  variation_count?: '3' | '5' | '10'
}
```

**Replaces**:

- Ad Copy tool

**API Endpoint**: `/api/tools/ad-copy`

**Output Schema**: `AdCopyOutput`

---

### 8. **Objection Handler & Sales Assistant** 💬

**Category**: Sales & Conversion  
**Agents**: BlueOceanStrategy, PorterForcesAgent

**What it does**:

- Price objections
- Timing objections
- Competitor objections
- Need objections
- Trust objections
- Strategic responses with competitive context

**Inputs**:

```typescript
{
  objection_type: 'price' | 'timing' | 'competitor' | 'need' | 'trust' | 'authority',
  objection_text?: string // Specific objection
}
```

**Replaces**:

- Objection Handler tool

**API Endpoint**: `/api/tools/objection-handler`

**Output Schema**: `ObjectionHandlerOutput`

---

### 9. **Pricing Strategy Analyzer** 💵

**Category**: Strategic Growth  
**Agents**: PricingIntelligenceAgent, CompetitiveAnalysisAgent

**What it does**:

- Analyze current pricing
- Competitor pricing comparison
- Optimal pricing tiers
- Psychological pricing strategies
- Implementation roadmap

**Replaces**:

- Pricing Strategy tool

**API Endpoint**: `/api/tools/pricing-strategy`

**Output Schema**: `PricingStrategyOutput`

---

### 10. **Service Package & Offer Designer** 📦

**Category**: Strategic Growth  
**Agents**: BlueOceanStrategy, BlogWriterAgent

**What it does**:

- Tiered pricing packages
- Service bundles
- Upsell paths
- Value ladders
- Package descriptions
- Comparison tables

**Inputs**:

```typescript
{
  package_type: 'tiered-pricing' | 'bundles' | 'upsells' | 'value-ladder',
  tier_count?: '2' | '3' | '4'
}
```

**Replaces**:

- Service Packages tool
- Loyalty Program Designer

**API Endpoint**: `/api/tools/service-packages`

**Output Schema**: `ServicePackageOutput`

---

## 🏗️ ARCHITECTURE PRESERVATION

### ✅ What MUST Remain Unchanged

1. **All Agent Classes**
   - BlogWriterAgent
   - FacebookMarketingAgent
   - InstagramMarketingAgent
   - LinkedInMarketingAgent
   - VideoScriptAgent
   - NewsletterAgent
   - FAQAgent
   - WebScraperAgent
   - BlueOceanStrategy
   - PorterForcesAgent
   - PricingIntelligenceAgent
   - CompetitiveAnalysisAgent
   - LocalSEOAgent

2. **Agent Registry System**
   - `lib/agents/unified-agent-system.ts`
   - `AgentRegistry.get(name)`
   - `AgentRegistry.register(config)`

3. **RAG Integration**
   - `lib/rag/content-marketing-rag.ts`
   - 31 seeded vectors in Pinecone
   - `retrieveContentMarketingKnowledge()`

4. **Flow Pattern**

   ```
   User Input → Tool (wrapper) → Agent → LLM → Structured Output
   ```

5. **Business Intelligence Pipeline**
   - WebScraperAgent extracts intelligence
   - Intelligence passed to all agents via `intelligence` parameter
   - Agents auto-generate topics/content from intelligence

---

## 🔧 IMPLEMENTATION NOTES

### Agent Method Signatures to Check

Before building API routes, verify these agent methods:

```typescript
// FacebookMarketingAgent
generatePost({ businessName, businessType, topic, postType?, intelligence })
generateVariations({ businessName, businessType, topic, intelligence, count? })

// InstagramMarketingAgent
generatePost({ businessName, businessType, topic, visualType?, intelligence })
generateVariations({ businessName, businessType, topic, intelligence, count? })

// LinkedInMarketingAgent
generatePost({ businessName, businessType, topic, contentType?, intelligence })
generateVariations({ businessName, businessType, topic, intelligence, count? })

// BlogWriterAgent
generateBlogPost({ businessName, businessType, topic, keywords?, tone?, intelligence })
generateVariations({ businessName, businessType, topic, intelligence, count? })

// NewsletterAgent
generateNewsletter({ businessName, businessType, newsletterTopic, newsletterType?, intelligence })

// FAQAgent
generateFAQ({ businessName, businessType, intelligence })
```

### Dashboard UI Update Pattern

```tsx
// OLD (50+ tools)
const toolCategories = [
  {
    id: "content-marketing",
    tools: [
      { id: "facebook-post", apiEndpoint: "/api/tools/facebook-post" },
      { id: "instagram-post", apiEndpoint: "/api/tools/instagram-post" },
      // ... 50 more
    ],
  },
];

// NEW (10 tools)
import { TOOL_CATEGORIES } from "@/lib/tools/unified-tools";

const toolCategories = TOOL_CATEGORIES; // 4 categories, 10 tools total
```

---

## 📊 MIGRATION IMPACT

### Files to Create

- ✅ `lib/tools/unified-tools.ts`
- ✅ `lib/tools/unified-tool-schemas.ts`
- ⏳ `app/api/tools/business-audit/route.ts`
- ⏳ `app/api/tools/social-content/route.ts`
- ⏳ `app/api/tools/blog-seo-writer/route.ts`
- ⏳ `app/api/tools/website-copy/route.ts`
- ⏳ `app/api/tools/review-manager/route.ts`
- ⏳ `app/api/tools/email-hub/route.ts`
- ⏳ `app/api/tools/ad-copy/route.ts`
- ⏳ `app/api/tools/objection-handler/route.ts`
- ⏳ `app/api/tools/pricing-strategy/route.ts`
- ⏳ `app/api/tools/service-packages/route.ts`

### Files to Modify

- ⏳ `app/dashboard/page.tsx` - Replace tool list
- ⏳ `lib/format-tool-output.ts` - Add formatting for new outputs

### Files to Delete

- ⏳ `app/api/tools/facebook-post/route.ts`
- ⏳ `app/api/tools/instagram-post/route.ts`
- ⏳ `app/api/tools/linkedin-post/route.ts`
- ⏳ (40+ more old tool routes)

### Files to PRESERVE (DO NOT DELETE)

- ✅ All files in `lib/agents/`
- ✅ `lib/rag/content-marketing-rag.ts`
- ✅ `lib/vector/content-marketing-knowledge-base.ts`
- ✅ `lib/agents/unified-agent-system.ts`

---

## 🚀 NEXT STEPS

1. **Audit Agent Interfaces** ⏳
   - Check actual method signatures for all agents
   - Document parameter requirements
   - Test intelligence parameter passing

2. **Build Reference Implementation** ⏳
   - Start with `/api/tools/social-content` (simplest)
   - Test end-to-end: UI → API → Agent → Output
   - Validate output schema matching

3. **Build Complex Multi-Agent Tool** ⏳
   - Implement `/api/tools/business-audit`
   - Test agent orchestration
   - Verify RAG integration

4. **Update Dashboard UI** ⏳
   - Replace tool categories
   - Test tool selection and execution
   - Add input forms where needed

5. **Full Migration** ⏳
   - Implement remaining 8 tools
   - Delete old routes
   - Update documentation

---

## ✅ ARCHITECTURE VALIDATION

This refactoring:

- ✅ Preserves all agents (no deletion)
- ✅ Maintains agent-to-tool mappings
- ✅ Keeps modular pipelines
- ✅ Supports agent orchestration
- ✅ Enforces Tool → Agent → Model separation
- ✅ Uses composable schemas
- ✅ Enables RAG integration
- ✅ Improves UX (10 vs 50+ tools)
- ✅ Reduces code duplication
- ✅ Maintains agentic intelligence

**The goal achieved**: 10 agent-powered tools, each using specialized agents, not a monolithic prompt.
