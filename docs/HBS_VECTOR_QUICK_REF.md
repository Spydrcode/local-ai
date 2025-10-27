# HBS Vector Search - Quick Reference Card

## 🚀 Setup (One-Time)

```bash
npm run setup:pinecone-hbs
```

## 📦 Import

```typescript
import {
  searchSWOTVectors,
  searchBusinessModelVectors,
  searchGTMStrategyVectors,
  getHBSStrategicContext,
  searchHBSCombinedInsights,
} from "@/lib/vector-hbs";
```

---

## 🔍 Search Functions

### SWOT Analysis

```typescript
// All SWOT content
searchSWOTVectors(demoId, "competitive position");

// Specific quadrant
searchSWOTVectors(demoId, "growth opportunities", "opportunities", 5);
searchSWOTVectors(demoId, "competitive threats", "threats", 5);
searchSWOTVectors(demoId, "core competencies", "strengths", 5);
searchSWOTVectors(demoId, "resource gaps", "weaknesses", 5);
```

**Quadrants:** `'strengths'` | `'weaknesses'` | `'opportunities'` | `'threats'`

### Business Model Canvas

```typescript
// All canvas blocks
searchBusinessModelVectors(demoId, "business model design");

// Specific block
searchBusinessModelVectors(demoId, "target customers", "customer_segments", 3);
searchBusinessModelVectors(demoId, "unique value", "value_propositions", 3);
searchBusinessModelVectors(demoId, "revenue models", "revenue_streams", 3);
searchBusinessModelVectors(demoId, "distribution", "channels", 3);
searchBusinessModelVectors(demoId, "key resources", "key_resources", 3);
```

**Blocks:** `'customer_segments'` | `'value_propositions'` | `'channels'` | `'customer_relationships'` | `'revenue_streams'` | `'key_resources'` | `'key_activities'` | `'key_partnerships'` | `'cost_structure'`

### GTM Strategy

```typescript
// All GTM components
searchGTMStrategyVectors(demoId, "go-to-market plan");

// Specific component
searchGTMStrategyVectors(demoId, "market entry", "entry", 3);
searchGTMStrategyVectors(demoId, "distribution channels", "channels", 5);
searchGTMStrategyVectors(demoId, "pricing strategy", "pricing", 3);
searchGTMStrategyVectors(demoId, "customer acquisition", "acquisition", 5);
searchGTMStrategyVectors(demoId, "product launch", "launch", 3);
```

**Components:** `'entry'` | `'channels'` | `'pricing'` | `'acquisition'` | `'launch'`

### Comprehensive Context

```typescript
// Get all HBS vectors at once
const context = await getHBSStrategicContext(demoId);
// Returns: { swot: [...], businessModel: [...], gtm: [...] }
```

### Cross-Agent Insights

```typescript
// All insight types
searchHBSCombinedInsights(demoId, "strategic priorities", undefined, 0.8, 10);

// Specific insight type
searchHBSCombinedInsights(
  demoId,
  "growth opportunities",
  "opportunity",
  0.8,
  10
);
searchHBSCombinedInsights(demoId, "competitive threats", "threat", 0.75, 10);
searchHBSCombinedInsights(demoId, "strategic warnings", "warning", 0.7, 10);
```

**Insight Types:** `'opportunity'` | `'threat'` | `'warning'` | `'observation'`

---

## 🎯 Common Patterns

### Dashboard Context Loading

```typescript
const [swot, bmc, gtm] = await Promise.all([
  searchSWOTVectors(demoId, "strategic position"),
  searchBusinessModelVectors(demoId, "business model"),
  searchGTMStrategyVectors(demoId, "market strategy"),
]);
```

### High-Confidence Filtering

```typescript
const critical = await searchHBSCombinedInsights(
  demoId,
  "strategic recommendations",
  undefined,
  0.9, // 90%+ confidence
  20
);
```

### Cross-Agent Synthesis

```typescript
// SWOT → BMC → GTM chain
const opps = await searchSWOTVectors(
  demoId,
  "opportunities",
  "opportunities",
  3
);
const valueProps = await searchBusinessModelVectors(
  demoId,
  opps[0].content,
  "value_propositions",
  3
);
const gtm = await searchGTMStrategyVectors(
  demoId,
  valueProps[0].content,
  "entry",
  3
);
```

### Competitor Analysis Context

```typescript
const [threats, positioning] = await Promise.all([
  searchSWOTVectors(demoId, "competitive threats", "threats", 5),
  searchGTMStrategyVectors(demoId, "competitive positioning", "entry", 3),
]);
```

---

## 📊 Vector Counts Per Demo

| Agent     | Vectors | Components                                               |
| --------- | ------- | -------------------------------------------------------- |
| **SWOT**  | 15+     | 4 quadrants, 4 TOWS, 6 PESTEL, position, insights        |
| **BMC**   | 10+     | 9 canvas blocks, assumptions, insights                   |
| **GTM**   | 6+      | entry, beachhead, channels, pricing, acquisition, launch |
| **Total** | 30+     | Granular, searchable components                          |

---

## 🔑 Metadata Fields

### All Vectors

- `demoId` - Links to demo
- `hbsFramework` - "SWOT" | "Business Model Canvas" | "GTM Strategy"
- `hbsAgentName` - "SWOTAgent" | "OsterwalderAgent" | "GTMPlannerAgent"
- `confidence` - 0.0-1.0 quality score
- `tags` - Array of searchable tags

### SWOT Specific

- `swotQuadrant` - "strengths" | "weaknesses" | "opportunities" | "threats"
- `towsStrategy` - "SO" | "ST" | "WO" | "WT"
- `pestelFactor` - "political" | "economic" | "social" | "technological" | "environmental" | "legal"
- `strategicPosition` - "aggressive" | "conservative" | "defensive" | "competitive"

### BMC Specific

- `canvasBlock` - Which of 9 blocks
- `revenueModel` - "subscription" | "transaction" | "freemium" | etc.
- `canvasCoherence` - 0.0-1.0 alignment score

### GTM Specific

- `gtmApproach` - "land_and_expand" | "bowling_pin" | "big_bang" | "segmented_rollout"
- `channelType` - "direct_sales" | "inside_sales" | "partners" | "online" | etc.
- `pricingModel` - "value_based" | "competitive" | "cost_plus" | etc.
- `ltvCacRatio` - Unit economics number

---

## 💾 Storage (Automatic)

Vectors stored automatically when agents execute:

```bash
POST /api/hbs/swot-analysis/{demoId}     # Stores 15+ SWOT vectors
POST /api/hbs/business-model/{demoId}    # Stores 10+ BMC vectors
POST /api/hbs/gtm-strategy/{demoId}      # Stores 6+ GTM vectors
```

---

## 🎓 Documentation

- **Full Guide:** `docs/HBS_VECTOR_OPTIMIZATION.md`
- **Summary:** `docs/HBS_VECTOR_OPTIMIZATION_SUMMARY.md`
- **Code:** `lib/vector-hbs.ts`
- **Setup:** `scripts/setup-pinecone-hbs.ts`
