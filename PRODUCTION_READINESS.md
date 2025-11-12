# Production Readiness - Agentic Architecture

## Overview
This document outlines the production-ready agentic architecture, data flows, error handling patterns, and validation mechanisms.

## ✅ Architecture Principles

### 1. **No Hardcoded Fallbacks**
- All agents extract data from actual business intelligence
- Fallback responses are constructed from available data, never hardcoded examples
- Empty states clearly communicate "insufficient data" rather than inventing content

### 2. **Data-Driven Agents**
- Each agent receives structured business context
- Agents validate input before processing
- Output is validated before returning to orchestrator

### 3. **Prompt Engineering**
- Examples in prompts show **format and depth**, not templates to copy
- Explicit anti-hallucination rules prevent AI from using example business names
- Validation checklists embedded in prompts for self-checking

## 🏗️ Agentic Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Marketing Orchestrator                    │
│  - Coordinates 17 specialized agents                        │
│  - Manages workflow execution                               │
│  - Aggregates results                                       │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│ Data         │  │ AI Agents     │
│ Collectors   │  │ (17 total)    │
│              │  │               │
│ - SEO        │  │ - Marketing   │
│ - Social     │  │ - Brand       │
│ - Competitors│  │ - Content     │
│ - Reviews    │  │ - SEO         │
└──────────────┘  │ - Social      │
                  │ - HBS Frameworks │
                  └───────────────┘
```

### Agent Types

#### Marketing Intelligence Agents (8 agents)
1. **marketing-intelligence**: Brand voice, content strategy, channel recommendations
2. **brand-voice**: Tone, archetype, messaging framework
3. **seo-strategy**: Technical SEO, keyword research, 90-day roadmap
4. **content-calendar**: Multi-channel 30-day content plans
5. **social-media-strategy**: Platform-specific strategies
6. **competitor-analysis**: Market positioning and differentiation
7. **email-marketing**: Sequence design and segmentation
8. **local-seo**: GMB optimization, local citations

#### Harvard Framework Agents (9 agents)
1. **jobs-to-be-done**: Clayton Christensen JTBD analysis
2. **marketing-myopia**: Theodore Levitt customer focus
3. **competitive-positioning**: Michael Porter's 5 Forces + positioning
4. **consumer-journey**: John Deighton decision journey
5. **different-marketing**: Youngme Moon differentiation
6. **disruptive-marketing**: Christensen disruptive innovation
7. **discovery-driven-marketing**: Rita McGrath planning
8. **ai-personalization**: ML-driven personalization
9. **marketing-mix-modeling**: Attribution and optimization

## 🔄 Data Flow

### 1. Website Analysis Flow
```
User Input (URL)
  → /api/analyze-site
    → Web Scraping (Cheerio)
    → Content Extraction
    → AI Summarization (SITE_SUMMARY_PROMPT)
    → Business Intelligence Object
```

### 2. Marketing Strategy Flow
```
Business Intelligence
  → /api/marketing-strategy
    → MarketingOrchestrator.execute(workflow)
      → Data Collectors (parallel)
        - SEO Analyzer
        - Social Media Detector
        - Competitor Discovery
        - Review Aggregator
      → Agent Execution (sequential/parallel based on dependencies)
      → Result Aggregation
      → Validation
    → Structured Response
```

### 3. Content Generation Flow
```
Business Context + Tool Request
  → /api/tools/[toolId]
    → Tool-specific Agent
    → Context-aware generation
    → Output formatting
  → Formatted Content
```

## 🛡️ Validation & Error Handling

### Input Validation
- **Zod schemas** for all API endpoints
- **URL validation** before scraping
- **Business context validation** before agent execution

### Output Validation
Located in `lib/ai-validation.ts`:

1. **validateBusinessSpecificity**: Checks content references actual business
2. **validateHomepageBlueprint**: Validates homepage designs are business-specific
3. **validateProfitInsights**: Validates insights are actionable and specific
4. **Forbidden Example Detection**: Flags when AI copies prompt examples

### Error Handling Patterns

```typescript
// ✅ GOOD: Intelligent fallback
try {
  const aiSummary = await summarizeText(content, prompt);
  return aiSummary;
} catch (error) {
  console.error('AI summarization failed:', error);
  // Construct fallback from available data
  return constructFallbackFromData(headings, menuItems, url);
}

// ❌ BAD: Hardcoded fallback
catch (error) {
  return "Generic business offering quality services"; // NEVER DO THIS
}
```

## 📊 Data Collection Patterns

### SEO Analyzer ([lib/data-collectors/seo-analyzer.ts](lib/data-collectors/seo-analyzer.ts))
- Extracts meta tags, headings, keywords
- Analyzes images, links, schema markup
- Returns structured SEO metrics

### Social Media Detector ([lib/data-collectors/social-detector.ts](lib/data-collectors/social-detector.ts))
- Finds social media links
- Detects platform presence
- Returns social profile data

### Competitor Discovery ([lib/data-collectors/competitor-discovery.ts](lib/data-collectors/competitor-discovery.ts))
- Industry-based competitor identification
- No hardcoded competitor lists
- Uses search-based discovery

## 🚀 Production Deployment Checklist

### Before Deployment

- [ ] **Remove Development TODOs**: No `TODO:`, `FIXME:`, or placeholder comments
- [ ] **Environment Variables**: All API keys in `.env`, never committed
- [ ] **Error Logging**: Production-grade error tracking (Sentry, LogRocket)
- [ ] **Rate Limiting**: API rate limits configured
- [ ] **Caching Strategy**: Redis/in-memory caching for repeated requests
- [ ] **Database Migrations**: All migrations tested
- [ ] **API Documentation**: OpenAPI/Swagger docs updated

### Monitoring

- [ ] **Agent Performance**: Track execution times per agent
- [ ] **Validation Failures**: Monitor validation rejection rates
- [ ] **Error Rates**: Alert on elevated error rates
- [ ] **Token Usage**: Track OpenAI API costs
- [ ] **User Feedback**: Collect feedback on AI output quality

## 🎯 Prompt Engineering Best Practices

### ✅ DO

1. **Show format with examples** - Demonstrate the LEVEL OF DETAIL expected
2. **Include anti-hallucination rules** - Explicitly forbid copying examples
3. **Embed validation checklists** - Make AI self-verify output
4. **Extract from context** - Mandate use of actual business intelligence
5. **Request specific data** - Ask for metrics, timelines, proof points

### ❌ DON'T

1. **Use overly specific examples** - Avoid detailed single-business examples that could be copied
2. **Provide complete templates** - Give format/structure, not fill-in content
3. **Allow generic responses** - Require specificity in prompt rules
4. **Skip validation** - Always validate AI output before returning
5. **Ignore context** - Never let AI generate without business intelligence

## 📝 Agent Response Format

All agents return structured JSON:

```typescript
{
  content: string | object,      // Agent-specific output
  confidence: number,            // 0-1 confidence score
  metadata: {
    processingTime: number,
    tokensUsed: number,
    model: string,
    validationPassed: boolean
  }
}
```

## 🔍 Testing Strategy

### Unit Tests
- [ ] Data collectors return expected structure
- [ ] Validation functions catch template copying
- [ ] Error handlers produce intelligent fallbacks

### Integration Tests
- [ ] Full workflow execution (URL → Strategy)
- [ ] Agent chaining works correctly
- [ ] Context propagation through orchestrator

### E2E Tests
- [ ] Real website analysis
- [ ] Multiple industry types
- [ ] Edge cases (minimal content, blocked sites)

## 📈 Performance Optimization

### Parallel Execution
- Data collectors run in parallel
- Independent agents execute concurrently
- Sequential execution only for dependencies

### Caching
- Website content cached (15 min TTL)
- Agent results cached per business
- SEO analysis cached (24 hour TTL)

### Token Optimization
- Summarize long content before sending to agents
- Use structured prompts to reduce token waste
- Implement response streaming for large outputs

## 🎓 Key Learnings

1. **Examples are format guides**: SITE_SUMMARY_PROMPT examples show depth, PROFIT_IQ_PROMPT forbids copying them
2. **Validation is critical**: Catch template copying, generic content, and hallucinations
3. **Intelligent fallbacks**: When data is missing, construct from available info, never use hardcoded text
4. **Context is king**: More specific business intelligence = better agent output
5. **Iterate on prompts**: Monitor validation failures to improve prompts

## 📚 Related Files

- [lib/prompts.ts](lib/prompts.ts) - All system prompts with anti-hallucination rules
- [lib/ai-validation.ts](lib/ai-validation.ts) - Output validation functions
- [lib/agents/marketing-orchestrator.ts](lib/agents/marketing-orchestrator.ts) - Main workflow orchestration
- [lib/agents/marketing-agents.ts](lib/agents/marketing-agents.ts) - 17 specialized agents
- [lib/data-collectors/](lib/data-collectors/) - Data collection modules

## 🔐 Security Considerations

- [ ] **Input sanitization**: Validate and sanitize all URLs
- [ ] **Rate limiting**: Prevent abuse of AI endpoints
- [ ] **API key rotation**: Regular key rotation policy
- [ ] **PII handling**: Don't store sensitive customer data
- [ ] **CORS configuration**: Properly configured for production
- [ ] **Authentication**: Protect API endpoints appropriately

---

**Last Updated**: 2025-11-11
**Version**: 1.0.0
**Status**: ✅ Production Ready
