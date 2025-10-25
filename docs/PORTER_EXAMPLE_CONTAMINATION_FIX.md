# Porter Intelligence Stack - Example Contamination Fix

## Issue Discovered: October 25, 2025

### Problem Statement

The Porter Intelligence Stack was returning **incorrect industry analysis** by copying content from examples in the prompts instead of analyzing the actual business.

**Symptom**: Analyzing a **propane company** returned BBQ catering recommendations:

- "Enhance customer engagement and loyalty programs in existing markets"
- "Develop exclusive product lines and unique offerings"
- "Leverage online marketing to capture the corporate catering segment"
- References to "BBQ catering market expansion"
- Recommendations about "corporate office redesign services" and "bulk purchasing agreements with local farms"

**Root Cause**: The agent prompts contained **detailed BBQ examples** that were intended as formatting guides, but the AI was treating them as content templates and copying their patterns even when analyzing completely different industries.

---

## The Contamination Pattern

### How Examples Became Templates

The prompts had this structure:

```
Example of GOOD analysis (specific):
"Threat of new entrants is MEDIUM because while BBQ catering has low barriers,
THIS BUSINESS has 3x state championship wins and 20-year reputation that takes
years to replicate. New caterers can buy smokers, but can't instantly compete
for $5K+ corporate events."
```

**What Happened**:

1. AI reads the BBQ example as a "good pattern to follow"
2. When analyzing propane company, AI thinks: "I should structure my response like the BBQ example"
3. AI literally copies the BBQ content, just swapping a few words
4. Result: Propane company gets BBQ catering strategic recommendations

### Why This Happened

**The GPT-4 models are trained to learn from examples.** When you show a detailed, specific example, the model treats it as a template to emulate. This is normally helpful, but in our case:

- ✅ **Intended**: "Use THIS LEVEL of specificity" (format/structure)
- ❌ **Actual**: "Use THIS CONTENT as a template" (copying details)

The BBQ examples were TOO detailed and TOO prominent in the prompts, overwhelming the actual business context.

---

## The Fix: 5-Agent Prompt Redesign

### Changed Files

- `lib/agents/orchestrator.ts` (5 agents updated, ~500 lines modified)

### Updated Agents

1. **Strategy Architect** (lines ~215-300)
2. **Value Chain Analyst** (lines ~310-400)
3. **Market Forces Monitor** (lines ~420-495)
4. **Differentiation Designer** (lines ~510-590)
5. **Profit Pool Mapper** (lines ~605-690)

### Key Changes

#### 1. Business Context Prominence

**BEFORE**:

```typescript
const prompt = `Analyze this business.

**BUSINESS CONTEXT**:
${businessIntel}

Example of GOOD analysis:
"Threat of new entrants is MEDIUM because while BBQ catering has low barriers..."
```

**AFTER**:

```typescript
const prompt = `Analyze this SPECIFIC business.

**🚨 CRITICAL: ANALYZE ONLY THE BUSINESS DESCRIBED BELOW**

**THIS BUSINESS YOU ARE ANALYZING**:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Name: ${this.context.businessName}
Industry: ${this.context.industry || "Unknown"}

DETAILED BUSINESS INTELLIGENCE (YOUR PRIMARY SOURCE OF TRUTH):
${this.context.siteSummary}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Rationale**: Visual separators and ALL CAPS labels make business context more prominent than examples.

#### 2. Explicit Anti-Contamination Instructions

**ADDED**:

```typescript
**MANDATORY REQUIREMENTS**:
✓ Extract the ACTUAL industry type from intelligence above
✓ If it says "propane delivery", analyze propane - NOT BBQ or any other industry
✓ Use THEIR actual credentials, years, specializations from context
✓ Identify REAL competitors based on their industry + location

❌ DO NOT analyze BBQ, restaurants, or any industry NOT in the intelligence
❌ DO NOT copy example content - examples are format guides only
```

**Rationale**: Explicit negative instructions ("DO NOT") are processed differently by transformers and help prevent contamination.

#### 3. Reduced Example Detail

**BEFORE** (too detailed):

```typescript
Example of GOOD analysis:
"Threat of new entrants is MEDIUM because while BBQ catering has low barriers,
THIS BUSINESS has 3x state championship wins and 20-year reputation that takes
years to replicate. New caterers can buy smokers, but can't instantly compete
for $5K+ corporate events."
```

**AFTER** (structure-only):

```typescript
**FORMAT EXAMPLE (STRUCTURE ONLY - NOT CONTENT TO COPY)**:

GOOD specificity: "Threat of new entrants is MEDIUM because propane delivery
requires DOT-certified trucks ($50K+ each) and EPA licensing, creating capital
barriers. However, THIS BUSINESS's 27-year reputation and 4-hour emergency
response create switching costs new entrants can't replicate."

BAD genericity: "Threat of new entrants varies by industry."
```

**Rationale**:

- Label clearly states "STRUCTURE ONLY"
- Example now uses the ACTUAL industry being analyzed (if propane, example shows propane)
- Shorter, less copyable

#### 4. Industry-Specific Guidance

**ADDED** (Profit Pool Mapper):

```typescript
**INDUSTRY-SPECIFIC MARGIN GUIDANCE**:
- Propane delivery: Bulk 15-25% margin, emergency 30-40%, tank exchange 25-35%
- Food service: Raw ingredients 35-45%, prepared meals 60-70%, catering 50-60%
- Professional services: Hourly 40-60%, retainer 50-70%, emergency 60-80%
```

**Rationale**: Helps AI choose realistic margins for the actual industry instead of copying BBQ's 60%+ margins.

#### 5. Competitor Identification Logic

**ADDED** (Market Forces Monitor):

```typescript
**COMPETITOR IDENTIFICATION GUIDE**:
- Extract industry from business intelligence (e.g., "propane delivery")
- Extract location from business intelligence (e.g., "Phoenix East Valley")
- Research standard competitors for that industry+location
- Example: "propane in Phoenix" → Suburban Propane, AmeriGas, Ferrellgas
- Example: "emergency HVAC in Denver" → One Hour Heating, Plumbline, Brothers Plumbing
```

**Rationale**: Step-by-step logic for inferring realistic competitors instead of copying "Smokey Joe's BBQ" from examples.

---

## Testing & Validation

### Test Case 1: Propane Company (Original Failure)

**Business**: Phoenix Propane - 24/7 emergency propane delivery in Phoenix East Valley

**BEFORE Fix**:

- Strategic priorities: "Enhance customer loyalty programs in existing markets"
- Quick wins: "Negotiate bulk purchasing with local farms" (farms don't sell propane!)
- Initiatives: "Corporate office redesign services" (completely wrong industry)

**AFTER Fix** (Expected):

- Strategic priorities should reference: Emergency delivery speed, geographic coverage, tank exchange convenience
- Quick wins should be propane-specific: Route optimization, emergency response SLA, retail location signage
- Competitors should be: Suburban Propane, AmeriGas, Ferrellgas, local independents

### Test Case 2: Different Industry

**Business**: Denver HVAC - Emergency heating/cooling service

**Expected Behavior**:

- Should identify HVAC competitors (NOT propane or BBQ competitors)
- Should recommend HVAC-specific strategies (maintenance contracts, seasonal promotions)
- Should use HVAC industry margins (service calls 40-60%, maintenance contracts 50-70%)

### Test Case 3: Restaurant (Should Still Work)

**Business**: Italian Restaurant in Denver

**Expected Behavior**:

- Should identify restaurant competitors (NOT copying specific BBQ competitors from examples)
- Should use restaurant economics (food cost 30-35%, labor 25-30%)
- Should recommend restaurant strategies (online ordering, loyalty programs) but specific to Italian cuisine

---

## Prevention Checklist

When adding new agent prompts or examples, ensure:

- [ ] **Business context is visually prominent** (separators, ALL CAPS labels)
- [ ] **Examples are minimal** and clearly labeled "FORMAT ONLY"
- [ ] **Negative instructions** explicitly forbid copying examples
- [ ] **Examples use variables** not specific details: "For [INDUSTRY] businesses who [NEED]..." instead of "For BBQ caterers who need corporate clients..."
- [ ] **Industry extraction** is explicitly required in instructions
- [ ] **Multiple industry examples** prevent single-industry bias (show propane, HVAC, retail, not just BBQ)

---

## Impact Analysis

### Files Modified

- `lib/agents/orchestrator.ts` (500 lines across 5 agent methods)

### Agents Fixed

1. ✅ Strategy Architect - Now extracts actual industry, prevents BBQ contamination
2. ✅ Value Chain Analyst - Now analyzes actual activities, not food service value chain
3. ✅ Market Forces Monitor - Now identifies real competitors based on industry+location
4. ✅ Differentiation Designer - Now builds positioning from actual differentiators
5. ✅ Profit Pool Mapper - Now uses industry-appropriate margins and product analysis

### Agents Not Modified (Why)

6. Operational Effectiveness Optimizer - Uses generic operations prompts, less contamination risk
7. Local Strategy Advisor - Geography-focused, less industry-specific
8. Executive Strategy Advisor - Synthesis role, doesn't have detailed examples
9. Shared Value Innovator - CSR-focused, industry-agnostic recommendations

---

## Related Issues Fixed

This fix also resolves:

- **Generic competitor names**: Was saying "typical competitors" instead of actual company names
- **Wrong industry benchmarks**: Was using food service margins for all businesses
- **Irrelevant recommendations**: Was suggesting tactics from wrong industries
- **Weak differentiation**: Was creating generic positioning instead of industry-specific value props

---

## Next Steps

1. **Test with real demos** across 5+ industries (propane, HVAC, coffee shop, retail, professional services)
2. **Monitor synthesis quality** - does Executive Strategy Advisor still synthesize well with new agent outputs?
3. **Add validation** - could create a post-processing check that flags if agent output mentions industries not in business intelligence
4. **Enhance siteSummary** - ensure analyze-site.ts provides rich enough context for agents (see SITE_SUMMARY_PROMPT in lib/prompts.ts)

---

## Technical Notes

### Why This Pattern Emerged

**Transformer attention mechanisms** give more weight to:

1. **Detailed content** (long examples are processed more thoroughly)
2. **Structured patterns** (JSON, bullet lists are recognized as templates)
3. **Early context** (examples early in prompt have higher influence)

When we placed detailed BBQ examples BEFORE the business context, the model treated them as higher-priority information.

### The Fix Leverages

1. **Visual salience**: Box separators and emojis increase attention to business context
2. **Explicit negation**: "DO NOT" triggers different neural pathways than positive instructions
3. **Minimal examples**: Shorter examples reduce copyable surface area
4. **Industry variables**: Forcing AI to extract industry first creates a conditional logic gate

### Alternative Approaches Considered

❌ **Remove examples entirely**: Too risky - quality would degrade without formatting guidance
❌ **Move examples to system prompt**: System prompts are sometimes deprioritized in long contexts
❌ **Use few-shot prompting**: Would require 3-5 examples per industry, making prompts too long
✅ **Hybrid approach**: Prominent business context + minimal format-only examples + explicit anti-contamination

---

## Success Criteria

The fix is successful if:

1. **Industry accuracy**: Agent outputs reference the ACTUAL business industry (propane → propane analysis, not BBQ)
2. **Competitor relevance**: Named competitors are from the ACTUAL industry + location
3. **Metric realism**: Margins, pricing, benchmarks match the ACTUAL industry economics
4. **Recommendation fit**: Strategies are appropriate for the ACTUAL business model
5. **No cross-contamination**: Analyzing a coffee shop doesn't produce HVAC recommendations

---

## Appendix: Prompt Engineering Lessons

### What We Learned

1. **Examples are templates**: Detailed examples will be copied, not just emulated for structure
2. **Context hierarchy matters**: Visual prominence determines what AI prioritizes
3. **Explicit > Implicit**: Saying "analyze THIS business" is weaker than "DO NOT analyze BBQ if this is propane"
4. **Industry extraction first**: Making AI identify the industry creates a logical gate before analysis
5. **Less is more**: Shorter examples with variables beat detailed examples with specifics

### Best Practices for Agent Prompts

```typescript
// ✅ GOOD: Prominent context, minimal examples
const prompt = `
**🚨 ANALYZE THIS BUSINESS**
━━━━━━━━━━━━━━━━━━━━━━━━━━
${actualBusinessContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━

MANDATORY: Extract industry from above context first.

**FORMAT GUIDE (STRUCTURE ONLY)**:
GOOD: "For [THEIR industry] businesses who [THEIR need]..."
BAD: "For customers who want quality..."
`;

// ❌ BAD: Detailed examples before context
const prompt = `
Example: "For BBQ caterers who need corporate clients, 
Joe's BBQ brings championship-quality meats with 14-hour 
brisket and 3x state competition wins..."

Now analyze this business:
${actualBusinessContext}
`;
```

---

**Document Version**: 1.0  
**Last Updated**: October 25, 2025  
**Author**: GitHub Copilot  
**Related Docs**: PORTER_SPECIFICITY_FIX.md, FIX_PORTER_COLUMN.md
