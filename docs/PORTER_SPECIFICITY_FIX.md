# Porter Agent Specificity Fix

## Problem Identified (Oct 25, 2025)

The Porter Intelligence agents were returning **generic boilerplate analysis** instead of **business-specific insights**:

### Example of Generic Output (Before Fix):

```
Threat of New Entrants: medium
"The barriers to entry vary by industry; however, if there are moderate capital
requirements and established brand loyalty, new entrants may find it challenging
to compete."
```

This could apply to **any business** in **any industry**. Not useful.

### What Michael Porter Would Say (After Fix):

```
Threat of New Entrants: medium
"While BBQ catering has low capital barriers ($50K for commercial smoker and truck),
THIS BUSINESS has 3x Colorado State Championship wins and 20-year reputation that
takes years to replicate. New caterers can buy equipment, but can't instantly compete
for $5K+ corporate events where clients demand proven championship-quality results."
```

This is **specific to the business**, references **actual differentiators**, and provides **strategic insight**.

---

## Root Cause

The issue was **NOT** in the Porter base methodology (which is excellent). The problem was in the **agent user prompts**:

### Old Prompt (Too Generic):

```typescript
const prompt = `Analyze this business and provide strategic recommendations:

Business: ${businessName}
Website: ${websiteUrl}
Summary: ${siteSummary}

Provide Five Forces Analysis...
```

**Problem**: The AI had business details but wasn't **explicitly instructed** to use them. It defaulted to generic Porter frameworks.

### New Prompt (Enforces Specificity):

```typescript
const prompt = `Analyze this SPECIFIC business using Porter's Five Forces.

**DETAILED BUSINESS INTELLIGENCE**:
${siteSummary}

**CRITICAL INSTRUCTIONS**:
You MUST analyze THIS SPECIFIC business, not generic industry patterns. Reference:
- Their actual products/services by name
- Their specific target customers
- Their unique differentiators and positioning
- Their actual competitors (if mentioned)
- Their geographic market (if mentioned)

Example of GOOD analysis (specific):
"Threat of new entrants is MEDIUM because while BBQ catering has low barriers,
THIS BUSINESS has 3x state championship wins and 20-year reputation that takes
years to replicate..."

Example of BAD analysis (generic):
"Threat of new entrants varies by industry; if there are moderate capital
requirements, new entrants may find it challenging."
```

**Solution**: Explicitly show the AI what "good" vs "bad" analysis looks like, demand specificity, and require referencing actual business details.

---

## Agents Updated

### 1. Strategy Architect ✅

- **Before**: Generic Five Forces ("barriers vary by industry")
- **After**: Specific threat assessment using business's actual competitive advantages
- **Change**: Added examples of good/bad analysis, required referencing actual differentiators

### 2. Value Chain Analyst ✅

- **Before**: Generic value chain template ("receive materials, improve procurement")
- **After**: Specific activity breakdown (e.g., "Source post oak wood from Texas supplier, $800/cord vs $400 local")
- **Change**: Required naming actual suppliers/processes/costs, added cost driver analysis

### 3. Market Forces Analyst ✅

- **Before**: Generic competitor categories ("main players exist")
- **After**: Specific competitor names, threat levels, and differentiation gaps
- **Change**: Instructed to infer real competitors from location/industry, assess specific threats

### 4. Differentiation Designer ✅

- **Before**: Generic value props ("high-quality service with attention to detail")
- **After**: Specific positioning using actual credentials and methods
- **Change**: Enforced Porter positioning formula with business-specific details

### 5. Profit Pool Mapper ✅

- **Before**: Generic product categories ("various products with different margins")
- **After**: Actual product/service analysis with 2x2 matrix classification
- **Change**: Required analyzing ACTUAL offerings from business intelligence, estimating specific margins

---

## Key Principles Applied

### ❌ What NOT to Accept (Generic)

- "Improve your operations"
- "Competitors exist in this market"
- "Barriers to entry vary by industry"
- "Focus on quality and customer service"
- "Market conditions may affect pricing"

### ✅ What to DEMAND (Specific)

- "Automate scheduling with Calendly saves 15 hrs/week ($18K annually)"
- "Competitor: Smokey Joe's BBQ - HIGH threat for dine-in, LOW for catering (your differentiator)"
- "Entry barriers: $50K equipment + 3-5 years to build reputation + certification requirements"
- "Premium positioning via championship wins justifies $22-25/person vs competitor's $15-18"
- "Corporate events demand grew 15% post-2024 as companies return to in-person gatherings"

### Specificity Checklist

Every agent output must include:

- [ ] References actual products/services BY NAME
- [ ] Uses numbers/percentages when possible ($X, Y%, Z hours)
- [ ] Compares to REAL competitors (even if inferred)
- [ ] Cites business's actual differentiators (awards, years, methods, location)
- [ ] Provides actionable insights tied to specific activities

---

## Example Transformation

### BBQ Catering Business

**Generic Analysis (Before)**:

```json
{
  "fiveForces": {
    "threatOfNewEntrants": {
      "level": "medium",
      "rationale": "Barriers to entry vary by industry; moderate capital requirements may challenge new entrants."
    },
    "competitiveRivalry": {
      "level": "high",
      "rationale": "Intense competition likely if market is saturated with similar offerings."
    }
  },
  "recommendedStrategy": "differentiation",
  "strategyRationale": "Focusing on differentiation allows standing out in crowded marketplace.",
  "tradeoffs": [
    "Higher marketing costs to establish unique brand",
    "Potentially higher production costs due to quality enhancements",
    "Narrower target market compared to broader cost leadership"
  ]
}
```

**Specific Analysis (After)**:

```json
{
  "fiveForces": {
    "threatOfNewEntrants": {
      "level": "medium",
      "rationale": "Equipment barriers are LOW ($50K for commercial smoker, truck, permits) BUT Joe's BBQ has 3x Colorado State Championship wins and 20-year reputation serving Denver Metro corporate clients. New caterers can buy smokers but can't instantly compete for $5K+ corporate events where clients demand proven championship results. Takes 3-5 years to build this credibility."
    },
    "competitiveRivalry": {
      "level": "high",
      "rationale": "Denver has 12+ BBQ options (Owlbear BBQ, Boney's, Wayne's Smoke Shack, food trucks) BUT most focus on dine-in/retail vs catering. Joe's dominates corporate catering segment (events 50-500 people) where quality matters more than price. Main threat: food trucks offering cheaper BBQ for smaller events under $1K."
    }
  },
  "recommendedStrategy": "focus_differentiation",
  "strategyRationale": "FOCUS on corporate catering segment (50-500 people) + DIFFERENTIATE via championship-quality meats. This business can't compete on price vs food trucks ($8/person) but dominates premium corporate segment ($22-25/person) where event planners need guaranteed quality and white-glove service. Their 14-hour hickory-smoked brisket and competition credentials justify premium pricing.",
  "tradeoffs": [
    "Give up retail counter-service opportunity (requires different location, staffing, hours) to focus resources on perfecting catering delivery/setup",
    "Accept smaller addressable market (corporate events only, not families or casual diners) to dominate high-margin segment",
    "Maintain premium pricing ($22-25/person) which excludes price-sensitive customers but protects quality positioning and margins"
  ],
  "strategicPriorities": [
    "Build partnerships with 3-5 Denver corporate event planners who book 20+ events/year - become their exclusive BBQ caterer via referral commission",
    "Create 'Championship BBQ' package for $2K-5K corporate events highlighting competition wins, include setup/breakdown, branded signage",
    "Add online advance ordering system for Game Day corporate events (Broncos, Nuggets, Avalanche) - competitors see 40% of quarterly revenue from sports event catering"
  ]
}
```

---

## Implementation Details

### Files Modified

- `lib/agents/orchestrator.ts` (5 agent prompts updated: Strategy Architect, Value Chain Analyst, Market Forces Analyst, Differentiation Designer, Profit Pool Mapper)

### Changes Made

1. Added **detailed business intelligence section** to every prompt
2. Included **examples of good vs bad analysis** showing specificity
3. Required **referencing actual business details** (products, competitors, differentiators)
4. Demanded **quantified insights** (percentages, dollar amounts, timelines)
5. Enforced **structural reasoning** tied to this business's activities

### What Stayed the Same

- Porter base methodology (600+ lines) - unchanged
- Agent system prompts via `getPorterAgentSystemPrompt()` - unchanged
- JSON response structures - unchanged
- Temperature, max tokens, other parameters - unchanged

Only the **user message prompts** were enhanced to enforce specificity.

---

## Testing

### Before Fix

Run Strategy Architect on any business:

```
Result: Generic Five Forces ("barriers vary", "competition is intense")
```

### After Fix

Run Strategy Architect on same business:

```
Result: Specific Five Forces naming actual competitors, barriers, differentiators
```

### Validation Checklist

For each agent result, verify:

- [ ] Does it name actual products/services from the business?
- [ ] Does it reference specific competitors (even if inferred)?
- [ ] Does it cite the business's unique differentiators?
- [ ] Could this analysis apply to ANY business in this industry? (If yes = FAIL)
- [ ] Does it provide actionable insights with numbers/specifics?

---

## Future Improvements

### Short-term (Next Sprint)

1. **Add competitor data enrichment**: Use Google Maps API to find REAL competitors by location/category
2. **Industry benchmarking**: Pull actual industry data (avg margins, growth rates, market size)
3. **Confidence scoring**: Lower confidence when business intelligence is thin, higher when rich

### Long-term (Q1 2026)

1. **Multi-turn refinement**: Let agents ask clarifying questions when details are missing
2. **Cross-agent validation**: Have agents review each other's specificity
3. **Example library**: Build database of "good" analysis examples by industry
4. **Automated specificity scoring**: Use AI to grade outputs on specificity scale 1-10

---

## Key Takeaway

**Porter's methodology is rigorous and specific.** The agents must be too.

Generic business advice is **worthless** because:

- Every business owner already knows "improve quality" or "focus on customer service"
- Competitors can read the same generic advice
- No actionable insights emerge from platitudes

**Specific strategic analysis has value** because:

- It references THIS business's actual activities and advantages
- It compares to REAL competitors and market dynamics
- It provides quantified, implementable recommendations
- It can only be generated by analyzing the specific business context

The fix ensures every Porter agent **thinks like Porter would**: grounded in specific activities, structural forces, and competitive dynamics of THIS particular business.
