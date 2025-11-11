# Agent Migration Status - Full Agentic Framework with RAG

## Goal
Migrate all 4 new strategic frameworks to use proper agent architecture with RAG capabilities for architectural consistency.

## ✅ Completed

### 1. Agent Classes Created (4/4)
- ✅ **DigitalMaturityAgent** - `lib/agents/strategic-frameworks/DigitalMaturityAgent.ts`
- ✅ **PESTELAgent** - `lib/agents/strategic-frameworks/PESTELAgent.ts`
- ✅ **BusinessModelCanvasAgent** - `lib/agents/strategic-frameworks/BusinessModelCanvasAgent.ts`
- ✅ **LeanCanvasAgent** - `lib/agents/strategic-frameworks/LeanCanvasAgent.ts`

All agents include:
- Extends UnifiedAgent base class
- RAG integration via VectorRepository
- Typed input/output interfaces
- Knowledge retrieval methods
- Comprehensive prompts with RAG context injection
- Error handling and validation

### 2. API Endpoints Updated (1/4)
- ✅ **digital-maturity** - Uses digitalMaturityAgent
- ⏳ **pestel-analysis** - Needs update to use pestelAgent
- ⏳ **business-model-canvas** - Needs update to use businessModelCanvasAgent
- ⏳ **lean-canvas** - Needs update to use leanCanvasAgent

---

## ⏳ Remaining Tasks

### CRITICAL: Fix TypeScript Errors
**Issue:** `'supabaseAdmin' is possibly 'null'` in digital-maturity endpoint
**Fix:** Add null checks or use non-null assertion

### 1. Update Remaining API Endpoints (3 files)

#### `/pages/api/strategic-frameworks/pestel-analysis/[demoId].ts`
```typescript
import { pestelAgent } from '@/lib/agents/strategic-frameworks/PESTELAgent';

// Replace generateContent() call with:
const result = await pestelAgent.execute({
  businessName: demo.business_name,
  websiteUrl: demo.website_url,
  industry: demo.industry || 'general',
  location: demo.location,
  siteSummary: demo.site_summary,
});
```

#### `/pages/api/strategic-frameworks/business-model-canvas/[demoId].ts`
```typescript
import { businessModelCanvasAgent } from '@/lib/agents/strategic-frameworks/BusinessModelCanvasAgent';

// Replace generateContent() call with:
const result = await businessModelCanvasAgent.execute({
  businessName: demo.business_name,
  websiteUrl: demo.website_url,
  industry: demo.industry || 'general',
  siteSummary: demo.site_summary,
  revenueModel: demo.revenue_model,
});
```

#### `/pages/api/strategic-frameworks/lean-canvas/[demoId].ts`
```typescript
import { leanCanvasAgent } from '@/lib/agents/strategic-frameworks/LeanCanvasAgent';

// Replace generateContent() call with:
const result = await leanCanvasAgent.execute({
  businessName: demo.business_name,
  websiteUrl: demo.website_url,
  industry: demo.industry || 'general',
  siteSummary: demo.site_summary,
  stage: 'mvp', // or extract from demo
});
```

### 2. Register Agents in AgentRegistry

**File:** `lib/agents/unified-agent-system.ts`

Add after line 520:

```typescript
// Strategic Framework Agents
AgentRegistry.register({
  name: 'digital-maturity',
  description: 'Assesses digital maturity across 8 dimensions with industry benchmarking',
  systemPrompt: `[Use DigitalMaturityAgent's system prompt]`,
  temperature: 0.7,
  maxTokens: 4000,
  jsonMode: true,
});

AgentRegistry.register({
  name: 'pestel-analysis',
  description: 'Analyzes external macro-environmental factors across 6 dimensions',
  systemPrompt: `[Use PESTELAgent's system prompt]`,
  temperature: 0.7,
  maxTokens: 4000,
  jsonMode: true,
});

AgentRegistry.register({
  name: 'business-model-canvas',
  description: 'Maps complete business model across 9 building blocks',
  systemPrompt: `[Use BusinessModelCanvasAgent's system prompt]`,
  temperature: 0.7,
  maxTokens: 4500,
  jsonMode: true,
});

AgentRegistry.register({
  name: 'lean-canvas',
  description: '1-page business plan focused on rapid iteration and validation',
  systemPrompt: `[Use LeanCanvasAgent's system prompt]`,
  temperature: 0.7,
  maxTokens: 4000,
  jsonMode: true,
});
```

### 3. Create RAG Knowledge Documents

**Create:** `scripts/seed-strategic-frameworks.ts`

Seed knowledge for each framework:

#### Digital Maturity Knowledge
```typescript
const digitalMaturityKnowledge = [
  {
    type: 'digital_maturity_knowledge',
    content: 'Industry benchmarks for digital maturity in SaaS: Average 3.2, Top 25% at 4.1...',
    metadata: { industry: 'saas', dimension: 'benchmarks' }
  },
  {
    type: 'digital_maturity_knowledge',
    content: 'Common digital transformation pitfalls: 1. Lack of executive sponsorship...',
    metadata: { category: 'best_practices' }
  },
  // Add 20-30 knowledge chunks per framework
];
```

#### PESTEL Knowledge
```typescript
const pestelKnowledge = [
  {
    type: 'pestel_knowledge',
    content: '2025 economic trends: Rising interest rates impact on small business lending...',
    metadata: { category: 'economic', year: 2025 }
  },
  {
    type: 'pestel_knowledge',
    content: 'AI regulation updates: EU AI Act implementation timeline and compliance requirements...',
    metadata: { category: 'legal_technological', region: 'EU' }
  },
  // Add current trends, regulations, technologies
];
```

#### Business Model Canvas Knowledge
```typescript
const businessModelKnowledge = [
  {
    type: 'business_model_knowledge',
    content: 'Successful SaaS business models: Freemium conversion rates 2-5%, PLG vs sales-led...',
    metadata: { industry: 'saas', pattern: 'revenue_model' }
  },
  {
    type: 'business_model_knowledge',
    content: 'Cost structure optimization: Typical SaaS gross margins 70-85%, COGS breakdown...',
    metadata: { category: 'cost_optimization' }
  },
  // Add industry patterns, optimization strategies
];
```

#### Lean Canvas Knowledge
```typescript
const leanCanvasKnowledge = [
  {
    type: 'lean_canvas_knowledge',
    content: 'MVP validation strategies: Smoke tests, concierge MVP, wizard of oz...',
    metadata: { stage: 'mvp', category: 'validation' }
  },
  {
    type: 'lean_canvas_knowledge',
    content: 'Common unfair advantages: Network effects, proprietary data, regulatory moats...',
    metadata: { category: 'unfair_advantage' }
  },
  // Add lean startup best practices
];
```

### 4. Seed Knowledge into Vector Database

**Options:**

**Option A: Use Supabase** (if already configured)
```typescript
// Insert into site_chunks table with embeddings
const { data, error } = await supabase
  .from('site_chunks')
  .insert(knowledgeWithEmbeddings);
```

**Option B: Use Pinecone** (if preferred)
```typescript
// Upload to Pinecone index
await pineconeIndex.upsert({
  vectors: knowledgeVectors
});
```

### 5. Update Existing 6 Frameworks (Optional - For Full Consistency)

To achieve complete architectural consistency, also migrate:
- Blue Ocean Strategy
- Ansoff Matrix
- BCG Matrix
- Positioning Map
- Customer Journey
- OKR Framework

---

## Architecture Overview

### Agent Flow:
```
API Endpoint
  ↓
Agent.execute(input)
  ↓
retrieveKnowledge() → Query Vector DB
  ↓
buildPrompt(input, ragContext)
  ↓
UnifiedAgent.execute(prompt) → AI Generation
  ↓
validateOutput()
  ↓
Return structured data
```

### Key Components:
1. **UnifiedAgent** - Base class with AI client integration
2. **VectorRepository** - RAG query abstraction
3. **Agent Classes** - Framework-specific logic
4. **API Endpoints** - Route handlers calling agents

---

## Testing Plan

### 1. Unit Test Agents
```bash
npm test lib/agents/strategic-frameworks/
```

### 2. Test API Endpoints
```bash
# Create demo
POST /api/quick-analyze
Body: {"url": "https://example.com"}

# Test each framework
GET /api/strategic-frameworks/digital-maturity/{demoId}
GET /api/strategic-frameworks/pestel-analysis/{demoId}
GET /api/strategic-frameworks/business-model-canvas/{demoId}
GET /api/strategic-frameworks/lean-canvas/{demoId}
```

### 3. Test RAG Integration
- Seed test knowledge
- Verify agents retrieve relevant context
- Check output quality improvement with RAG vs without

---

## Timeline Estimate

| Task | Time | Priority |
|------|------|----------|
| Fix TypeScript errors | 15 min | CRITICAL |
| Update 3 API endpoints | 30 min | HIGH |
| Register agents | 15 min | MEDIUM |
| Create knowledge docs | 2-3 hours | MEDIUM |
| Seed vectors | 1 hour | MEDIUM |
| Test all endpoints | 30 min | HIGH |
| **TOTAL** | **5 hours** | |

---

## Next Immediate Step

**Fix the TypeScript error** in digital-maturity endpoint, then update the remaining 3 API endpoints to use their respective agents.

After that, the frameworks will work with the agent architecture (RAG queries will gracefully fail to empty string if no knowledge seeded yet).

Then we can seed knowledge incrementally for quality improvement.
