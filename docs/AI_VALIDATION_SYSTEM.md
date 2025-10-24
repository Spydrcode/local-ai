# AI Validation System

## Overview

This document describes the AI validation system implemented to ensure business-specific, non-generic outputs from all AI generation functions.

## Problem Statement

Without validation, AI agents can generate similar content for different businesses despite enhanced prompts. A BBQ restaurant could receive the same homepage blueprint as a propane service with just terminology swapped. This validation system ensures each business gets truly unique, tailored analysis.

## Architecture

### Validation Framework (`lib/ai-validation.ts`)

#### Core Validation Functions

1. **`validateBusinessSpecificity(content: string, businessContext: string)`**
   - Detects 45+ forbidden generic phrases ("boost your online presence", "welcome to", etc.)
   - Checks for specific products, pricing, location references
   - Validates presence of credentials, quantified metrics
   - Returns: `{ isValid: boolean, issues: string[], suggestions: string[] }`

2. **`validateHomepageBlueprint(blueprint: DemoHomepageMock, businessContext: string)`**
   - Validates hero headline for specificity (not "Welcome to...")
   - Checks CTA buttons are action-specific ("Order Catering" not "Learn More")
   - Detects generic section titles ("About Us", "Why Choose Us")
   - Ensures sections include business-specific details (hours, pricing, processes)
   - Validates industry-appropriate colors
   - Returns: `{ isValid: boolean, issues: string[], suggestions: string[] }`

3. **`validateProfitInsights(insights: string, businessContext: string)`**
   - Checks for competitive analysis keywords
   - Validates presence of quantified metrics (numbers, percentages, dollar amounts)
   - Ensures actionable recommendations with specificity
   - Detects vague adjectives ("quality", "excellent", "professional")
   - Returns: `{ isValid: boolean, issues: string[], suggestions: string[] }`

4. **`validateAIOutput(outputType, output, businessContext)` (async)**
   - Wrapper function that routes to appropriate validator
   - Output types: 'homepage', 'insights', 'content'
   - Returns: `{ isValid: boolean, score: number, issues: string[], suggestions: string[] }`
   - Score calculation: 100 - (issues.length \* 10), minimum 0

#### Forbidden Content Lists

- **FORBIDDEN_GENERIC_PHRASES** (45+ phrases)
  - "boost your online presence"
  - "take your business to the next level"
  - "welcome to our website"
  - "trusted by customers"
  - And 40+ more generic marketing phrases

- **FORBIDDEN_GENERIC_SECTIONS** (20+ titles)
  - "about us"
  - "why choose us"
  - "our services"
  - "contact us"
  - "testimonials"
  - And 15+ more generic section names

- **FORBIDDEN_VAGUE_ADJECTIVES** (20+ words)
  - "quality", "excellent", "professional"
  - "trusted", "reliable", "experienced"
  - "best", "top", "leading"
  - And 15+ more non-specific adjectives

### Integration Points

#### 1. Homepage Blueprint Generation (`pages/api/generate-demo.ts`)

```typescript
async function generateHomepageBlueprint({...}): Promise<DemoHomepageMock> {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    // Add strictness level warnings on retries
    const strictnessLevel = attempt === 0 ? "" : attempt === 1
      ? "\n\n⚠️ CRITICAL: Previous attempt was too generic..."
      : "\n\n🚨 FINAL ATTEMPT: Must be 100% specific...";

    // Generate homepage
    const response = await createChatCompletion({...});
    const homepage = JSON.parse(response);

    // Validate
    const validation = validateHomepageBlueprint(homepage, siteText);

    if (validation.isValid || attempt === maxRetries) {
      // Log and return
      console.log(`[Homepage Validation] Attempt ${attempt + 1}/${maxRetries + 1}:`, {...});
      return homepage;
    }

    // Retry with stricter prompt
    attempt++;
  }
}
```

**Features:**

- Up to 3 attempts (initial + 2 retries)
- Progressively stricter prompts with each retry
- Detailed logging of validation results
- Accepts output after max retries (logs issues as warnings)

#### 2. Profit Insights Generation

```typescript
async function generateProfitInsights(siteText: string, keyItems: string[]) {
  // Same retry logic as homepage
  const validation = validateProfitInsights(insights.profitIq, siteText);
  // Retry if validation fails
}
```

**Validates:**

- Competitive analysis is present
- Quantified metrics are included
- Recommendations are actionable and specific
- No vague adjectives or generic advice

#### 3. Social Media Posts

```typescript
async function generatePosts(siteText: string, keyItems: string[]) {
  // Validate first post as sample
  const validation = await validateAIOutput("content", posts[0].copy, siteText);
  // Retry if too generic
}
```

**Validates:**

- Posts reference actual products/services
- No generic marketing phrases
- Business-specific details are present

## Validation Scoring

### How Scores Are Calculated

The `validateAIOutput` function returns a score from 0-100:

```typescript
score = 100 - issues.length * 10;
if (score < 0) score = 0;
```

**Examples:**

- 0 issues = 100 score (perfect)
- 3 issues = 70 score (acceptable)
- 5 issues = 50 score (poor)
- 10+ issues = 0 score (failed)

### Validation Thresholds

Current implementation:

- **isValid threshold**: 0 issues
- **Retry trigger**: Any issues found (isValid = false)
- **Max retries**: 2 (total 3 attempts)
- **Fallback**: After max retries, accept output and log warnings

## Logging and Monitoring

### Console Logs

All validation attempts are logged with structure:

```typescript
console.log(`[Component Validation] Attempt X/Y:`, {
  isValid: boolean,
  score: number, // For functions that calculate score
  issues: number, // Count of issues
  suggestions: number, // Count of improvement suggestions
});
```

### Retry Logs

When validation fails and retry is triggered:

```typescript
console.warn(`[Component] Attempt X failed validation (score: Y). Retrying...`);
console.warn("Issues:", validation.issues);
console.warn("Suggestions:", validation.suggestions);
```

### Final Acceptance Logs

When max retries reached but issues remain:

```typescript
console.warn(
  "[Component] Max retries reached, accepting output with issues:",
  validation.issues
);
```

## Examples of Validation in Action

### Example 1: Generic Homepage Hero (REJECTED)

```json
{
  "hero": {
    "headline": "Welcome to Our BBQ Restaurant",
    "subheadline": "Experience the best BBQ in town",
    "ctaLabel": "Learn More"
  }
}
```

**Issues Detected:**

1. Hero headline uses generic template language ("Welcome to")
2. CTA uses generic button text ("Learn More")

**Suggestions:**

1. Hero should lead with specific differentiator (e.g., "14-Hour Smoked BBQ" not "Welcome to Joe's BBQ")
2. CTA should be action-specific (e.g., "Order Catering", "Schedule Delivery")

**Result:** Validation fails, retry with stricter prompt

### Example 2: Specific Homepage Hero (ACCEPTED)

```json
{
  "hero": {
    "headline": "14-Hour Oak-Smoked Texas BBQ, Ready in 30 Minutes",
    "subheadline": "Award-winning brisket & ribs. Order online, pick up today.",
    "ctaLabel": "Order Catering Now"
  }
}
```

**Issues Detected:** None

**Result:** Validation passes, output accepted

### Example 3: Generic Profit Insights (REJECTED)

```
This business should focus on improving their online presence and providing excellent customer service. They should leverage social media to boost engagement.
```

**Issues Detected:**

1. Contains forbidden phrase: "improving their online presence"
2. Contains forbidden phrase: "boost engagement"
3. Contains vague adjective: "excellent"
4. No competitive analysis present
5. No quantified metrics
6. No specific products mentioned

**Score:** 40/100

**Result:** Validation fails, retry with critical warning

### Example 4: Specific Profit Insights (ACCEPTED)

```
This is a specialty BBQ catering business serving corporate events in Dallas metro. Their competitive advantage is 14-hour smoking process vs typical 6-8 hours.

Key Differentiators:
- Oak wood smoking (not gas/electric like 70% of competitors)
- Same-day emergency catering (24-hour notice minimum at competitors)
- $18/person pricing vs market average $25-30

Biggest Opportunity: Target Fortune 500 companies within 30-mile radius who currently use generic caterers. Their premium quality at mid-tier pricing positions them perfectly for corporate accounts worth $5k-15k per event.
```

**Issues Detected:** None

**Score:** 100/100

**Result:** Validation passes

## Implementation Status

### ✅ Completed Components

1. **Validation Framework**
   - `lib/ai-validation.ts` created with all validation functions
   - Forbidden phrases, sections, and adjectives defined
   - Comprehensive validation logic for all output types

2. **Homepage Blueprint Validation**
   - Integrated into `generateHomepageBlueprint()`
   - Retry logic with progressive strictness
   - Logging and monitoring in place

3. **Profit Insights Validation**
   - Integrated into `generateProfitInsights()`
   - Competitive analysis and metrics checking
   - Retry logic implemented

4. **Social Media Posts Validation**
   - Integrated into `generatePosts()`
   - Content-based validation
   - Retry logic with stricter prompts

### 🔄 Future Enhancements

1. **Validation Scoring in Database**
   - Store validation scores in Supabase `demos` table
   - Track: `{ homepage: 85, insights: 92, content: 78 }`
   - Monitor quality trends over time

2. **Business Type Classification**
   - Automatic detection of business category
   - Industry-specific validation rules
   - Tailored forbidden phrase lists per industry

3. **Enhanced Context Extraction**
   - Improve `SITE_SUMMARY_PROMPT` to extract more specifics
   - Better parsing of pricing structures
   - Deeper competitive positioning analysis

4. **Adaptive Thresholds**
   - Learn optimal validation thresholds per business type
   - Adjust retry strategies based on historical success rates
   - Machine learning for continuous improvement

## Testing Recommendations

### Test Plan for Multiple Business Types

1. **BBQ Restaurant**
   - Should get: smoking times, wood types, catering specifics
   - Should NOT get: generic "quality food" descriptions

2. **Propane Service**
   - Should get: delivery times, tank sizes, emergency service details
   - Should NOT get: "reliable energy solutions" generic copy

3. **Coffee Roaster**
   - Should get: roasting schedules, bean origins, subscription details
   - Should NOT get: "premium coffee experience" vague language

4. **Law Firm**
   - Should get: practice areas, case types, credentials, success rates
   - Should NOT get: "trusted legal advisor" generic positioning

5. **HVAC Contractor**
   - Should get: response times, certifications, equipment brands, warranty details
   - Should NOT get: "quality service" placeholder content

### Validation Success Criteria

For each test business:

- [ ] Homepage hero includes business-specific differentiator
- [ ] Sections reference actual products/services from context
- [ ] Profit insights include competitive analysis
- [ ] Insights contain quantified metrics
- [ ] Social posts mention specific offerings
- [ ] Blog content demonstrates industry expertise
- [ ] No forbidden generic phrases appear in output
- [ ] Validation logs show passing scores on final attempt

## Configuration

### Adjustable Parameters

In `pages/api/generate-demo.ts`:

```typescript
const maxRetries = 2; // Change to 3 for more attempts
```

In `lib/ai-validation.ts`:

```typescript
// Adjust threshold for passing validation
return {
  isValid: issues.length === 0, // Could change to: issues.length <= 2
  score,
  issues,
  suggestions,
};
```

### Temperature Settings

Higher temperature = more creative but potentially less specific:

- Homepage: 0.8 (creative design)
- Insights: 0.75 (analytical with creativity)
- Social Posts: 0.85 (most creative)

Lower temperature recommended if validation fails frequently.

## Troubleshooting

### Issue: Too Many Retries, Always Rejecting

**Solution:** Lower the validation threshold or add more context to business summary

### Issue: Still Getting Generic Outputs

**Solution:**

1. Check if forbidden phrases list needs expansion
2. Review prompt strictness levels
3. Verify business context is being passed correctly

### Issue: Validation Passing But Output Still Generic

**Solution:** Validation rules may need tightening - add more specific checks

## Maintenance

### Adding New Forbidden Phrases

Edit `lib/ai-validation.ts`:

```typescript
const FORBIDDEN_GENERIC_PHRASES = [
  // ... existing phrases
  "your new phrase here",
];
```

### Adding Industry-Specific Validation

Create new validation function:

```typescript
export function validateRestaurantHomepage(blueprint: any, context: string) {
  // Check for menu items, cuisine type, dining style
  // Validate price ranges, hours, reservation system
}
```

Then use in conditional logic based on detected business type.

## Summary

The AI Validation System ensures every business receives unique, tailored analysis by:

1. **Detecting generic content** with comprehensive forbidden phrase lists
2. **Enforcing business specificity** through validation of products, pricing, location
3. **Implementing retry logic** that progressively increases prompt strictness
4. **Logging all validation** attempts for quality monitoring
5. **Providing improvement suggestions** when validation fails

This transforms the tool from "AI that generates marketing content" to "AI business analyst that studies each specific business and provides custom strategic recommendations."
