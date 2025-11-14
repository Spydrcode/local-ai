# Our Agentic Framework - Official Documentation

## Architecture Overview

Our system uses a **unified agent architecture** that ensures all AI-generated content is:

- **Specific** to the business (not generic)
- **Voice-matched** to their brand
- **Intelligence-driven** from scraped business data
- **RAG-enhanced** with 31 knowledge vectors
- **Contextual** using real business details

## Core Components

### 1. UnifiedAgent Base Class

**Location:** `lib/agents/unified-agent-system.ts`

All agents extend this base class which provides:

- Consistent AI client integration (OpenAI/Together/Ollama)
- Prompt structure and enhancement
- Context injection from business intelligence
- JSON mode support
- Tool execution framework
- Error handling

```typescript
export class UnifiedAgent {
  protected config: AgentConfig;

  async execute(
    userMessage: string,
    context?: Record<string, any>
  ): Promise<AgentResponse>;
  async executeWithTools(
    userMessage: string,
    context?: Record<string, any>
  ): Promise<AgentResponse>;
  protected buildSystemPrompt(context?: Record<string, any>): string;
}
```

### 2. Specialized Agent Classes

#### Content Marketing Agents

**Location:** `lib/agents/ContentMarketingAgents.ts`

- **BlogWriterAgent**: SEO-optimized blog posts (500-700 words)
  - Method: `generateBlogPost(params)` → BlogPostOutput
  - Method: `generateVariations(params)` → BlogPostOutput[]
  - Tones: educational, authoritative, conversational, inspirational

- **VideoScriptAgent**: Video scripts with visual directions
  - Method: `generateScript(params)` → VideoScriptOutput
  - Types: explainer, promotional, testimonial, educational, behind-the-scenes

- **NewsletterAgent**: Email newsletters with sections
  - Method: `generateNewsletter(params)` → NewsletterOutput
  - Styles: educational, promotional, storytelling, curated

- **FAQAgent**: FAQ generation from business context
  - Method: `generateFAQ(params)` → FAQOutput
  - Categories: services, pricing, process, quality, location

#### Social Media Agents

**Location:** `lib/agents/SocialMediaAgents.ts`

- **FacebookMarketingAgent**: Engagement-focused Facebook posts
  - Method: `generatePost(params)` → SocialPostOutput
  - Tones: friendly, professional, fun, educational

- **InstagramMarketingAgent**: Visual-first Instagram content
  - Method: `generatePost(params)` → SocialPostOutput
  - Styles: lifestyle, behind-the-scenes, educational, promotional

- **LinkedInMarketingAgent**: Professional LinkedIn posts
  - Method: `generatePost(params)` → SocialPostOutput
  - Styles: thought-leadership, industry-insights, company-updates, professional-tips

#### Strategic Agents

**Available via AgentRegistry.get():**

- strategic-analysis
- competitive-intelligence
- revenue-intelligence
- economic-intelligence
- benchmarking
- roi-prediction

### 3. Agent Registry

**Location:** `lib/agents/unified-agent-system.ts`

Centralized agent management:

```typescript
AgentRegistry.register(config); // Register agent
AgentRegistry.get(name); // Get agent instance
AgentRegistry.list(); // List all agents
AgentRegistry.verify(); // Validate configurations
```

### 4. Business Intelligence Pipeline

**Flow:**

```
User provides URL
  ↓
WebScraperAgent.analyze(url)
  ↓
Intelligence Object {
  business: { name, type, services, differentiators, location }
  brandAnalysis: { voice, tone, personality }
  seo: { keywords, metaDescription }
  reviews: { rating, count, highlights }
}
  ↓
Content Agents use intelligence in context
  ↓
RAG retrieval enhances prompts (31 vectors)
  ↓
LLM generates specific, personalized content
```

### 5. RAG Integration

**Location:** `lib/rag/content-marketing-rag.ts`

31 curated knowledge entries seeded to Pinecone:

```typescript
retrieveContentMarketingKnowledge(query, agentType, topK);
retrieveMultiTopicKnowledge(topics, agentType, topK);
retrieveCrossAgentKnowledge(query, topK);
enhancePromptWithRAG(basePrompt, query, agentType);
```

**Knowledge Coverage:**

- Facebook: 6 entries (engagement, algorithm, storytelling, CTAs, timing, emojis)
- Instagram: 4 entries (visual-first, hashtags, stories, reels)
- LinkedIn: 4 entries (thought-leadership, B2B, professional tone, networking)
- Blog: 5 entries (SEO, structure, authority, headlines, CTAs)
- Video: 4 entries (hooks, pacing, B-roll, mobile-first)
- Newsletter: 4 entries (subject lines, personalization, structure, CTAs)
- FAQ: 4 entries (common questions, trust-building, SEO, conversational)

## Our Prompt System

### Agent System Prompts

Each agent has a detailed system prompt defining:

1. **Expertise** - What the agent specializes in
2. **Principles** - Core rules and best practices
3. **Critical Rules** - Never break these
4. **Tone/Style Options** - Available variations
5. **Output Format** - JSON structure expected

**Example (BlogWriterAgent):**

```typescript
systemPrompt: `You are a professional SEO blog writer with 10+ years of experience...

**Your Expertise**:
- SEO optimization and keyword integration
- Engaging storytelling that builds authority
...

**Blog Writing Principles**:
1. **Hook Power**: Open with compelling statistics...
2. **SEO Integration**: Weave keywords naturally...
...

**Critical Rules**:
- 500-700 words (concise yet comprehensive)
- Never use generic phrases like "in today's digital landscape"
- Sound like an industry expert, not a content mill
...`;
```

### Context Injection

Intelligence data flows into agents via context parameter:

```typescript
await agent.execute(userPrompt, {
  businessName: "Joe's BBQ",
  businessType: "BBQ Catering",
  differentiators: ["14-hour smoked brisket", "competition-grade"],
  location: "Denver Metro",
  brandVoice: "confident, authentic, competitive",
});
```

The UnifiedAgent automatically enhances the prompt with this context.

## How Our Framework Differs from Generic Examples

### ❌ Generic Approach (What We DON'T Do)

```json
{
  "tool": "social_content",
  "agent": ["MarketingContentAgent"],
  "inputs": ["platform", "tone", "audience"],
  "output": "Generic social media post"
}
```

### ✅ Our Agentic Framework (What We DO)

```typescript
// 1. Scrape business intelligence
const intelligence = await WebScraperAgent.analyze(url);

// 2. Select specialized agent
const agent = facebookMarketingAgent; // Platform-specific expert

// 3. Agent auto-generates topic from intelligence
const topic = intelligence.differentiators[0]; // "14-hour smoked brisket"

// 4. RAG retrieval adds best practices
const knowledge = await retrieveContentMarketingKnowledge(
  topic,
  "facebook-marketing"
);

// 5. Agent generates with full context
const post = await agent.generatePost({
  businessName: intelligence.business.name,
  businessType: intelligence.business.type,
  topic, // Auto-generated, not user-provided
  tone: intelligence.brandAnalysis.voice,
  intelligence, // Full context
});

// Result: "🔥 Our 14-hour hickory-smoked brisket isn't just BBQ..."
// Specific to Joe's BBQ, not generic restaurant content
```

## API Route Pattern

All tool API routes follow this pattern:

```typescript
// app/api/tools/[tool-name]/route.ts
import { agentInstance } from "@/lib/agents/AgentFile";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { business_name, business_type, intelligence } = await request.json();

  // Validation
  if (!business_name || !business_type) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Let agent auto-generate topic if not provided
  let topic = request.topic;
  if (!topic && intelligence) {
    topic = generateTopicFromIntelligence(intelligence);
  }

  // Call specialized agent method
  const result = await agentInstance.generateContent({
    businessName: business_name,
    businessType: business_type,
    topic,
    intelligence,
  });

  return NextResponse.json(result);
}
```

## Agent Method Signatures

### Content Marketing Agents

**BlogWriterAgent:**

```typescript
generateBlogPost(params: {
  businessName: string;
  businessType: string;
  topic: string;
  keywords?: string[];
  tone?: "educational" | "authoritative" | "conversational" | "inspirational";
  intelligence?: any;
}): Promise<BlogPostOutput>

generateVariations(params: {
  businessName: string;
  businessType: string;
  topic: string;
  keywords?: string[];
  intelligence?: any;
  count?: number;
}): Promise<BlogPostOutput[]>
```

**VideoScriptAgent:**

```typescript
generateScript(params: {
  businessName: string;
  businessType: string;
  topic: string;
  videoType?: "explainer" | "promotional" | "testimonial" | "educational" | "behind-the-scenes";
  targetLength?: "15s" | "30s" | "60s" | "2-3min";
  intelligence?: any;
}): Promise<VideoScriptOutput>

generateVariations(params): Promise<VideoScriptOutput[]>
```

**NewsletterAgent:**

```typescript
generateNewsletter(params: {
  businessName: string;
  businessType: string;
  topic: string;
  newsletterStyle?: "educational" | "promotional" | "storytelling" | "curated";
  intelligence?: any;
}): Promise<NewsletterOutput>

generateVariations(params): Promise<NewsletterOutput[]>
```

**FAQAgent:**

```typescript
generateFAQ(params: {
  businessName: string;
  businessType: string;
  category?: "services" | "pricing" | "process" | "quality" | "location";
  intelligence?: any;
}): Promise<FAQOutput>

generateVariations(params): Promise<FAQOutput[]>
```

### Social Media Agents

**FacebookMarketingAgent:**

```typescript
generatePost(params: {
  businessName: string;
  businessType: string;
  topic?: string;
  tone?: "friendly" | "professional" | "fun" | "educational";
  intelligence?: any;
}): Promise<SocialPostOutput>

generateVariations(params): Promise<SocialPostOutput[]>
```

**InstagramMarketingAgent:**

```typescript
generatePost(params: {
  businessName: string;
  businessType: string;
  topic?: string;
  style?: "lifestyle" | "behind-the-scenes" | "educational" | "promotional";
  intelligence?: any;
}): Promise<SocialPostOutput>

generateVariations(params): Promise<SocialPostOutput[]>
```

**LinkedInMarketingAgent:**

```typescript
generatePost(params: {
  businessName: string;
  businessType: string;
  topic?: string;
  style?: "thought-leadership" | "industry-insights" | "company-updates" | "professional-tips";
  intelligence?: any;
}): Promise<SocialPostOutput>

generateVariations(params): Promise<SocialPostOutput[]>
```

## Output Interfaces

```typescript
interface BlogPostOutput {
  title: string;
  meta_description: string;
  introduction: string;
  sections: Array<{
    heading: string;
    content: string;
    subsections?: Array<{ heading: string; content: string }>;
  }>;
  conclusion: string;
  cta: string;
  keywords_used: string[];
  reading_time: string;
}

interface VideoScriptOutput {
  title: string;
  hook: string;
  script: Array<{
    scene: number;
    visual_direction: string;
    spoken_text: string;
    on_screen_text?: string;
    timing: string;
  }>;
  cta: string;
  total_length: string;
  platform_notes: string;
}

interface NewsletterOutput {
  subject_line: string;
  preview_text: string;
  introduction: string;
  sections: Array<{
    heading: string;
    content: string;
  }>;
  cta: string;
  ps_section?: string;
  sending_tips: string;
}

interface FAQOutput {
  category: string;
  faqs: Array<{
    question: string;
    answer: string;
    search_keywords?: string[];
  }>;
  schema_markup: string; // JSON-LD for SEO
}

interface SocialPostOutput {
  post: string;
  hashtags: string;
  best_time_to_post: string;
  engagement_tips: string;
  variations?: string[];
}
```

## Critical Framework Rules

### ✅ DO:

1. Use existing specialized agents (BlogWriterAgent, FacebookMarketingAgent, etc.)
2. Let agents auto-generate topics from intelligence data
3. Pass full intelligence object in context
4. Use RAG retrieval to enhance prompts with best practices
5. Call specific agent methods (.generatePost, .generateBlogPost, etc.)
6. Return structured outputs matching our interfaces
7. Include business-specific details in all content

### ❌ DON'T:

1. Create generic "MarketingContentAgent" - use specialized agents
2. Force users to provide topics - generate from intelligence
3. Use example prompts from external sources
4. Call non-existent methods or incorrect parameters
5. Return generic content without business specifics
6. Mix up agent names (e.g., AgentRegistry.getAgent() doesn't exist - use .get())
7. Ignore intelligence data - it's the key to personalization

## Integration with 10 Unified Tools

When building the 10 unified tools for the dashboard, we should:

1. **Map Tools to Existing Agents**
   - business_audit → StrategicAnalysisAgent, CompetitiveIntelligenceAgent
   - social_content → FacebookMarketingAgent, InstagramMarketingAgent, LinkedInMarketingAgent
   - blog_seo_writer → BlogWriterAgent + LocalSEOAgent
   - email_hub → NewsletterAgent
   - website_copy → WebScraperAgent + ContentMarketingAgents
   - review_manager → FAQAgent + ReputationAgent
   - ad_copy → SocialMediaAgents with promotional tone
   - objection_handler → FAQAgent + CompetitiveIntelligenceAgent
   - pricing_tool → PricingIntelligenceAgent
   - package_designer → StrategicAnalysisAgent + RevenueIntelligenceAgent

2. **Use Standard Flow**

   ```
   Tool Request
     ↓
   Get Intelligence (if not provided)
     ↓
   Select Appropriate Agent(s)
     ↓
   Auto-generate parameters from intelligence
     ↓
   Call agent method(s)
     ↓
   Format response in standard structure
     ↓
   Return to dashboard
   ```

3. **Preserve Our Prompts**
   - Don't replace agent system prompts
   - Don't create new generic prompts
   - Use existing temperature settings
   - Keep JSON mode configurations

4. **Enhance with RAG**
   - Retrieve relevant knowledge before agent calls
   - Inject knowledge into context
   - Use platform-specific best practices

## Example: Building social_content Tool

```typescript
// app/api/tools/social-content/route.ts
import {
  facebookMarketingAgent,
  instagramMarketingAgent,
  linkedInMarketingAgent,
} from "@/lib/agents/SocialMediaAgents";
import { retrieveContentMarketingKnowledge } from "@/lib/rag/content-marketing-rag";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { platform, tone, business_name, business_type, intelligence } =
    await request.json();

  // Select agent based on platform
  let agent;
  let agentType;
  switch (platform) {
    case "facebook":
      agent = facebookMarketingAgent;
      agentType = "facebook-marketing";
      break;
    case "instagram":
      agent = instagramMarketingAgent;
      agentType = "instagram-marketing";
      break;
    case "linkedin":
      agent = linkedInMarketingAgent;
      agentType = "linkedin-marketing";
      break;
    default:
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  // Auto-generate topic from intelligence
  let topic;
  if (intelligence?.business?.differentiators?.[0]) {
    topic = intelligence.business.differentiators[0];
  } else {
    topic = `Why choose ${business_name}`;
  }

  // Get RAG knowledge
  const knowledge = await retrieveContentMarketingKnowledge(
    topic,
    agentType,
    3
  );

  // Generate post
  const result = await agent.generatePost({
    businessName: business_name,
    businessType: business_type,
    topic,
    tone,
    intelligence,
  });

  // Format in standard structure
  return NextResponse.json({
    analysis_id: `social_${Date.now()}`,
    tool_id: "social_content",
    summary: `Generated ${platform} post optimized for ${tone} tone`,
    scores: {
      overall: 85,
      content: 90,
      engagement: 88,
    },
    findings: [
      {
        title: "Platform optimization",
        detail: `Post formatted for ${platform} best practices`,
        urgency: "medium",
        actionable_recommendations: [
          `Post during ${result.best_time_to_post}`,
          result.engagement_tips,
        ],
      },
    ],
    structured_outputs: {
      post: result.post,
      hashtags: result.hashtags,
      platform,
      timing: result.best_time_to_post,
    },
    next_steps: [
      "Schedule post for optimal timing",
      "Prepare accompanying visuals",
      "Monitor engagement metrics",
    ],
  });
}
```

## Summary

Our agentic framework is:

- **Specialized**: Each agent is an expert in their domain
- **Intelligent**: Auto-generates parameters from business data
- **Enhanced**: RAG integration with 31 knowledge vectors
- **Contextual**: Uses full business intelligence
- **Tested**: Already working in production with existing API routes
- **Extensible**: Easy to add new agents or capabilities

**When building the 10 unified tools, we USE this framework, not replace it.**
