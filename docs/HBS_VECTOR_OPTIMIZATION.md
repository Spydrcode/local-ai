# HBS Agent Vector Optimization - Complete Guide

## Overview

The Harvard Business School (HBS) Agent ecosystem now has **full vector storage optimization** for semantic search, cross-agent synthesis, and intelligent context retrieval.

## ✅ What's Been Optimized

### **1. Vector Storage**

All 3 HBS agents now automatically store results in Pinecone/Supabase:

- ✅ **SWOTAgent** - SWOT quadrants, TOWS strategies, PESTEL factors, strategic position
- ✅ **OsterwalderAgent** - 9 Business Model Canvas blocks, assumptions, coherence analysis
- ✅ **GTMPlannerAgent** - Market entry, channels, pricing, acquisition, launch plans

### **2. New Analysis Types**

Extended `AnalysisType` enum in `lib/vector.ts`:

```typescript
| "hbs_swot"           // SWOT + TOWS + PESTEL
| "hbs_business_model" // Business Model Canvas
| "hbs_gtm"            // Go-To-Market Strategy
| "hbs_synthesis"      // Cross-agent synthesis
```

### **3. Rich HBS Metadata**

New `HBSVectorMetadata` interface with 40+ specialized fields:

**Core Fields:**

- `hbsFramework` - "SWOT" | "Business Model Canvas" | "GTM Strategy"
- `hbsAgentName` - Which agent generated this insight
- `hbsLayer` - "strategy" | "market" | "synthesis"

**SWOT-Specific:**

- `swotQuadrant` - "strengths" | "weaknesses" | "opportunities" | "threats"
- `towsStrategy` - "SO" | "ST" | "WO" | "WT"
- `pestelFactor` - "political" | "economic" | "social" | "technological" | "environmental" | "legal"
- `strategicPosition` - "aggressive" | "conservative" | "defensive" | "competitive"

**Business Model Canvas:**

- `canvasBlock` - 9 blocks (customer_segments, value_propositions, channels, etc.)
- `revenueModel` - "subscription" | "transaction" | "freemium" | "licensing" | etc.
- `canvasCoherence` - 0-1 alignment score

**GTM Strategy:**

- `gtmApproach` - "land_and_expand" | "bowling_pin" | "big_bang" | "segmented_rollout"
- `channelType` - "direct_sales" | "inside_sales" | "partners" | "online" | etc.
- `pricingModel` - "value_based" | "competitive" | "cost_plus" | "penetration" | etc.
- `launchPhase` - "pre_launch" | "soft_launch" | "full_launch" | "post_launch"
- `ltvCacRatio` - Unit economics metric

### **4. Specialized Search Functions**

New functions in `lib/vector-hbs.ts`:

```typescript
// Search SWOT analysis
searchSWOTVectors(demoId, query, quadrant?, topK)

// Search Business Model Canvas
searchBusinessModelVectors(demoId, query, canvasBlock?, topK)

// Search GTM Strategy
searchGTMStrategyVectors(demoId, query, component?, topK)

// Get comprehensive strategic context
getHBSStrategicContext(demoId)

// Search across all HBS agents
searchHBSCombinedInsights(demoId, query, insightType?, minConfidence, topK)
```

### **5. Automated Vector Storage**

All 3 API endpoints now store vectors automatically:

- `pages/api/hbs/swot-analysis/[demoId].ts` ✅
- `pages/api/hbs/business-model/[demoId].ts` ✅
- `pages/api/hbs/gtm-strategy/[demoId].ts` ✅

---

## 📊 Vector ID Patterns

### SWOT Analysis Vectors

```
{demoId}-swot-strengths          // Strengths quadrant
{demoId}-swot-weaknesses         // Weaknesses quadrant
{demoId}-swot-opportunities      // Opportunities quadrant
{demoId}-swot-threats            // Threats quadrant
{demoId}-tows-SO                 // Strength-Opportunity strategies
{demoId}-tows-ST                 // Strength-Threat strategies
{demoId}-tows-WO                 // Weakness-Opportunity strategies
{demoId}-tows-WT                 // Weakness-Threat strategies
{demoId}-pestel-political        // Political factors
{demoId}-pestel-economic         // Economic factors
{demoId}-pestel-social           // Social factors
{demoId}-pestel-technological    // Technological factors
{demoId}-pestel-environmental    // Environmental factors
{demoId}-pestel-legal            // Legal factors
{demoId}-strategic-position      // Strategic position classification
{demoId}-swot-insight-{type}-{n} // Individual insights
```

### Business Model Canvas Vectors

```
{demoId}-bmc-customer_segments      // Customer segments block
{demoId}-bmc-value_propositions     // Value propositions block
{demoId}-bmc-channels               // Channels block
{demoId}-bmc-customer_relationships // Customer relationships block
{demoId}-bmc-revenue_streams        // Revenue streams block
{demoId}-bmc-key_resources          // Key resources block
{demoId}-bmc-key_activities         // Key activities block
{demoId}-bmc-key_partnerships       // Key partnerships block
{demoId}-bmc-cost_structure         // Cost structure block
{demoId}-bmc-assumptions            // Critical assumptions
{demoId}-bmc-insight-{type}-{n}     // Individual insights
```

### GTM Strategy Vectors

```
{demoId}-gtm-entry         // Market entry strategy
{demoId}-gtm-beachhead     // Beachhead market
{demoId}-gtm-channels      // Channel strategy
{demoId}-gtm-pricing       // Pricing strategy
{demoId}-gtm-acquisition   // Acquisition strategy
{demoId}-gtm-launch        // Launch plan
{demoId}-gtm-insight-{type}-{n} // Individual insights
```

---

## 🚀 Usage Examples

### Store HBS Agent Results

```typescript
// SWOT Analysis (automatic in API)
import { storeSWOTVectors } from "@/lib/vector-hbs";
await storeSWOTVectors(demoId, swotOutput);

// Business Model Canvas (automatic in API)
import { storeBusinessModelVectors } from "@/lib/vector-hbs";
await storeBusinessModelVectors(demoId, bmcOutput);

// GTM Strategy (automatic in API)
import { storeGTMStrategyVectors } from "@/lib/vector-hbs";
await storeGTMStrategyVectors(demoId, gtmOutput);
```

### Search SWOT Insights

```typescript
import { searchSWOTVectors } from "@/lib/vector-hbs";

// Search all SWOT analysis
const allSWOT = await searchSWOTVectors(
  "demo-123",
  "competitive advantages and market opportunities",
  undefined, // No quadrant filter
  10
);

// Search only opportunities
const opportunities = await searchSWOTVectors(
  "demo-123",
  "growth opportunities",
  "opportunities", // Filter to opportunities quadrant
  5
);

// Search only threats
const threats = await searchSWOTVectors(
  "demo-123",
  "competitive threats and market risks",
  "threats",
  5
);
```

### Search Business Model Canvas

```typescript
import { searchBusinessModelVectors } from "@/lib/vector-hbs";

// Search all canvas blocks
const allBMC = await searchBusinessModelVectors(
  "demo-123",
  "revenue model and customer acquisition",
  undefined,
  10
);

// Search specific block
const revenueStreams = await searchBusinessModelVectors(
  "demo-123",
  "subscription revenue models",
  "revenue_streams",
  3
);

const valueProps = await searchBusinessModelVectors(
  "demo-123",
  "unique value propositions",
  "value_propositions",
  5
);
```

### Search GTM Strategy

```typescript
import { searchGTMStrategyVectors } from "@/lib/vector-hbs";

// Search all GTM components
const allGTM = await searchGTMStrategyVectors(
  "demo-123",
  "market entry and customer acquisition strategy",
  undefined,
  10
);

// Search channel strategy
const channels = await searchGTMStrategyVectors(
  "demo-123",
  "distribution channels and sales model",
  "channels",
  5
);

// Search pricing strategy
const pricing = await searchGTMStrategyVectors(
  "demo-123",
  "pricing models and tiers",
  "pricing",
  3
);
```

### Get Comprehensive Strategic Context

```typescript
import { getHBSStrategicContext } from "@/lib/vector-hbs";

// Get all HBS agent results for demo
const context = await getHBSStrategicContext("demo-123");

console.log(context);
// {
//   swot: [/* 10 most relevant SWOT vectors */],
//   businessModel: [/* 10 most relevant BMC vectors */],
//   gtm: [/* 10 most relevant GTM vectors */]
// }
```

### Search Combined HBS Insights

```typescript
import { searchHBSCombinedInsights } from "@/lib/vector-hbs";

// Search all HBS insights
const insights = await searchHBSCombinedInsights(
  "demo-123",
  "strategic growth opportunities",
  undefined, // All insight types
  0.8, // Min confidence
  15
);

// Search only opportunities
const opportunities = await searchHBSCombinedInsights(
  "demo-123",
  "market expansion opportunities",
  "opportunity",
  0.75,
  10
);

// Search only threats
const threats = await searchHBSCombinedInsights(
  "demo-123",
  "competitive threats and risks",
  "threat",
  0.7,
  10
);
```

---

## 🎯 Advanced Query Patterns

### Cross-Agent Synthesis

```typescript
// Get SWOT opportunities
const swotOpps = await searchSWOTVectors(
  demoId,
  "opportunities",
  "opportunities",
  5
);

// Get corresponding BMC value propositions
const valueProps = await searchBusinessModelVectors(
  demoId,
  swotOpps[0].content, // Use SWOT opportunity as query
  "value_propositions",
  3
);

// Get GTM strategy for those value props
const gtmStrategy = await searchGTMStrategyVectors(
  demoId,
  valueProps[0].content, // Chain BMC → GTM
  "entry",
  3
);
```

### Dashboard Context Loading

```typescript
// Load complete strategic picture for dashboard
const [swot, bmc, gtm] = await Promise.all([
  searchSWOTVectors(demoId, "strategic position", undefined, 10),
  searchBusinessModelVectors(demoId, "business model design", undefined, 10),
  searchGTMStrategyVectors(demoId, "go-to-market plan", undefined, 10),
]);

// Now render unified dashboard with all 3 frameworks
```

### Filtered High-Confidence Insights

```typescript
// Get only high-confidence strategic recommendations
const highConfidence = await searchHBSCombinedInsights(
  demoId,
  "strategic recommendations",
  undefined,
  0.9, // 90%+ confidence only
  20
);

// Filter by priority
const criticalInsights = highConfidence.filter(
  (result) => result.metadata?.priority === "critical"
);
```

---

## 🛠️ Setup & Configuration

### 1. Install Dependencies

Already installed in your project:

```json
"@pinecone-database/pinecone": "^6.1.2"
```

### 2. Configure Environment

Add to `.env.local`:

```bash
# Vector Provider (supabase or pinecone)
VECTOR_PROVIDER=pinecone

# Pinecone Configuration
PINECONE_API_KEY=your-api-key-here
PINECONE_INDEX_NAME=local-ai-demos
```

### 3. Setup Pinecone Index

Run the HBS-optimized setup script:

```bash
npm run setup:pinecone-hbs
```

This will:

- Create or verify Pinecone index
- Configure for 1536 dimensions (OpenAI ada-002)
- Set cosine similarity metric
- Display HBS metadata schema
- Show vector ID patterns
- Provide usage examples

### 4. Verify Setup

Check index stats:

```typescript
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index("local-ai-demos");
const stats = await index.describeIndexStats();

console.log("Total vectors:", stats.totalRecordCount);
console.log("Index fullness:", stats.indexFullness);
```

---

## 📈 Performance Optimizations

### Granular Chunking Strategy

Instead of storing entire agent outputs as single vectors, we chunk strategically:

**SWOT**: 4 quadrants + 4 TOWS strategies + 6 PESTEL factors + position = 15 vectors

- Enables targeted search (e.g., "get only opportunities")
- Reduces irrelevant context
- Improves semantic precision

**Business Model Canvas**: 9 blocks + assumptions = 10 vectors

- Each canvas block searchable independently
- Value proposition separate from cost structure
- Customer segments separate from revenue streams

**GTM Strategy**: 6 components (entry, beachhead, channels, pricing, acquisition, launch)

- Market entry strategy separate from pricing
- Channel strategy independent of launch plan
- Enables component-specific queries

### Parallel Storage

All vectors upserted in single batch operation:

```typescript
await upsertChunks(chunks); // Batch upsert 15+ vectors at once
```

### Rich Metadata Filtering

Pre-filter before semantic search:

```typescript
const results = await index.query({
  vector: queryEmbedding,
  topK: 10,
  filter: {
    demoId: { $eq: demoId },
    hbsFramework: { $eq: "SWOT" },
    swotQuadrant: { $eq: "opportunities" },
    confidence: { $gte: 0.8 },
  },
});
```

### Cross-Agent Context Chain

SWOT → BMC → GTM dependency chain enables:

1. SWOT identifies opportunities
2. BMC designs value propositions for those opportunities
3. GTM plans market entry for those value propositions

---

## 🎓 Integration with Existing Systems

### Porter Intelligence Stack

HBS agents complement Porter agents:

- **Porter**: Competitive analysis (Five Forces, Value Chain)
- **SWOT**: Strategic position (internal/external factors)
- **BMC**: Business model design (value creation/capture)
- **GTM**: Market execution (channels, pricing, launch)

### Economic Intelligence

Macro trends feed into HBS analysis:

- **Economic**: GDP growth, inflation, interest rates → PESTEL political/economic factors
- **Regulatory**: Government shutdown risk → SWOT threats
- **Predictions**: Profit forecasts → BMC revenue stream validation

### Cross-Agent Synthesis

All agents contribute to unified strategic plan:

```typescript
const synthesis = {
  competitive: await searchPorterAgentVectors(...),
  economic: await searchEconomicIntelligenceVectors(...),
  strategic: await searchSWOTVectors(...),
  businessModel: await searchBusinessModelVectors(...),
  market: await searchGTMStrategyVectors(...)
};
```

---

## 🔧 Maintenance & Monitoring

### Monitor Index Health

```bash
npm run setup:pinecone-hbs
```

Shows:

- Total vector count
- Index fullness percentage
- Namespace distribution
- Recent activity

### Update Vectors After Agent Changes

When SWOTAgent/OsterwalderAgent/GTMPlannerAgent outputs change, re-run analysis:

```bash
curl -X POST http://localhost:3000/api/hbs/swot-analysis/{demoId}
curl -X POST http://localhost:3000/api/hbs/business-model/{demoId}
curl -X POST http://localhost:3000/api/hbs/gtm-strategy/{demoId}
```

Vectors automatically updated with new results.

### Clean Up Old Vectors

Delete vectors for deleted demos:

```typescript
import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index("local-ai-demos");

// Delete all vectors for demo
await index.deleteMany({
  filter: { demoId: { $eq: "demo-to-delete" } },
});
```

---

## ✅ Success Metrics

**Before HBS Vector Optimization:**

- ❌ No vector storage for HBS agents
- ❌ No semantic search across SWOT/BMC/GTM
- ❌ Manual cross-agent synthesis
- ❌ Generic context retrieval

**After HBS Vector Optimization:**

- ✅ 30+ vectors per demo (SWOT + BMC + GTM)
- ✅ Component-specific search (e.g., only opportunities, only revenue streams)
- ✅ Rich metadata filtering (framework, agent, confidence, component)
- ✅ Cross-agent context chaining (SWOT → BMC → GTM)
- ✅ Automated storage on agent execution
- ✅ Specialized search functions for each framework

---

## 🎯 Next Steps

1. **Run HBS Agents** on existing demos to populate vectors

   ```bash
   # For each demo
   POST /api/hbs/swot-analysis/{demoId}
   POST /api/hbs/business-model/{demoId}
   POST /api/hbs/gtm-strategy/{demoId}
   ```

2. **Build Dashboards** using vector-powered context
   - SWOT dashboard with opportunity/threat filtering
   - BMC dashboard with canvas block drill-down
   - GTM dashboard with launch phase tracking

3. **Enable Cross-Agent Synthesis** for unified strategic plans
   - Orchestrator uses vector search to gather context
   - Synthesizes Porter + Economic + SWOT + BMC + GTM
   - Generates unified action plan

4. **Optimize Query Performance** with metadata filters
   - Pre-filter by framework before semantic search
   - Use confidence thresholds (>0.8 for critical decisions)
   - Limit topK to 5-10 for fast response times

5. **Monitor & Iterate** on vector quality
   - Track search relevance scores
   - Adjust chunking strategy if needed
   - Update metadata schema as agents evolve

---

## 📚 Resources

- **Code**: `lib/vector-hbs.ts` - HBS vector storage & search
- **API Endpoints**: `pages/api/hbs/*` - Automated vector storage
- **Setup Script**: `scripts/setup-pinecone-hbs.ts` - Index configuration
- **Documentation**: This file - Complete usage guide

**All HBS agents are now fully optimized for vector storage and semantic search! 🎉**
