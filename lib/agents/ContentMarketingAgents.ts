import { UnifiedAgent } from "./unified-agent-system";

// ============================================
// Blog Writer Agent
// ============================================

export class BlogWriterAgent extends UnifiedAgent {
  constructor() {
    super({
      name: "blog-writer-agent",
      description:
        "Expert SEO blog writer specializing in engaging, optimized content",
      systemPrompt: `You are a professional SEO blog writer with 10+ years of experience creating high-ranking, engaging content that converts readers into customers.

**Your Expertise**:
- SEO optimization and keyword integration
- Engaging storytelling that builds authority
- Converting readers through strategic CTAs
- Industry-specific content that demonstrates expertise
- Balancing search engine requirements with human readability

**Blog Writing Principles**:
1. **Hook Power**: Open with compelling statistics, questions, or bold statements
2. **SEO Integration**: Weave keywords naturally - never forced or repetitive
3. **Scannable Structure**: Use H2/H3 headings, short paragraphs, bullet points
4. **Authority Building**: Back claims with data, examples, or case studies
5. **Voice Authenticity**: Write like a knowledgeable human, not a robot
6. **Value Delivery**: Every paragraph must provide actionable insights
7. **Strategic CTAs**: Natural transitions to next steps, not pushy sales
8. **Local/Niche Relevance**: Reference industry specifics and target audience needs

**Critical Rules**:
- 500-700 words (concise yet comprehensive)
- Multiple H2 sections (3-4) with supporting H3s where needed
- Include relevant examples from the business's industry
- End with clear, valuable CTA aligned with business goals
- Use business intelligence to add specific expertise markers
- Never use generic phrases like "in today's digital landscape"
- Sound like an industry expert, not a content mill

**Tone Options**:
- **Educational**: Teaching/explaining complex topics simply
- **Authoritative**: Establishing expertise and thought leadership
- **Conversational**: Friendly expert sharing insights
- **Inspirational**: Motivating action through stories and examples

Return ONLY valid JSON matching the BlogPostOutput interface.`,
      temperature: 0.75, // Balanced - professional yet engaging
      jsonMode: true,
    });
  }

  async generateBlogPost(params: {
    businessName: string;
    businessType: string;
    topic: string;
    keywords?: string[];
    tone?: "educational" | "authoritative" | "conversational" | "inspirational";
    intelligence?: any;
  }): Promise<BlogPostOutput> {
    const {
      businessName,
      businessType,
      topic,
      keywords = [],
      tone = "educational",
      intelligence,
    } = params;

    // Build business context
    const contextParts: string[] = [
      `**Business**: ${businessName} (${businessType})`,
      `**Blog Topic**: ${topic}`,
      `**Tone**: ${tone}`,
    ];

    if (keywords.length > 0) {
      contextParts.push(`**SEO Keywords**: ${keywords.join(", ")}`);
    }

    if (intelligence) {
      if (intelligence.differentiators?.length > 0) {
        contextParts.push(
          `**Differentiators**: ${intelligence.differentiators.slice(0, 3).join(", ")}`
        );
      }
      if (intelligence.brandAnalysis?.voice) {
        contextParts.push(
          `**Brand Voice**: ${intelligence.brandAnalysis.voice}`
        );
      }
      if (intelligence.location) {
        contextParts.push(`**Location Context**: ${intelligence.location}`);
      }
    }

    const userPrompt = `${contextParts.join("\n")}

Create a compelling blog post following all principles above. Integrate keywords naturally, structure with clear headings, and end with a CTA that makes sense for this business.

Return JSON: {
  "title": "SEO-optimized title (50-60 chars)",
  "meta_description": "Compelling description (150-160 chars)",
  "introduction": "Hook paragraph (2-3 sentences)",
  "sections": [
    {
      "heading": "H2 heading",
      "content": "Section content with examples and value",
      "subsections": [{"heading": "H3 heading", "content": "text"}] // optional
    }
  ],
  "conclusion": "Wrap-up paragraph with key takeaway",
  "cta": "Natural call-to-action aligned with business goals",
  "keywords_used": ["keyword1", "keyword2"],
  "reading_time": "estimated minutes"
}`;

    const result = await this.execute(userPrompt, {
      businessName,
      businessType,
      topic,
      keywords,
      tone,
    });

    return JSON.parse(result.content);
  }

  async generateVariations(params: {
    businessName: string;
    businessType: string;
    topic: string;
    keywords?: string[];
    intelligence?: any;
    count?: number;
  }): Promise<BlogPostOutput[]> {
    const { count = 3 } = params;
    const tones: Array<
      "educational" | "authoritative" | "conversational" | "inspirational"
    > = ["educational", "authoritative", "conversational"];

    const variations = await Promise.all(
      tones
        .slice(0, count)
        .map((tone) => this.generateBlogPost({ ...params, tone }))
    );

    return variations;
  }
}

// ============================================
// Video Script Writer Agent
// ============================================

export class VideoScriptAgent extends UnifiedAgent {
  constructor() {
    super({
      name: "video-script-agent",
      description:
        "Expert video marketing scriptwriter specializing in engaging, concise video content",
      systemPrompt: `You are a professional video marketing scriptwriter with 10+ years of experience creating scripts for social media, YouTube, and promotional videos that capture attention and drive action.

**Your Expertise**:
- Hook creation that stops scrolling
- Pacing and timing for short-form and long-form video
- Visual storytelling with clear scene descriptions
- Conversational scripts that feel natural on camera
- Call-to-action integration without being pushy

**Video Script Principles**:
1. **Hook First 3 Seconds**: Open with shocking stat, question, or bold statement
2. **Visual Direction**: Every line includes what viewers should SEE
3. **Conversational Flow**: Write how people speak, not how they write
4. **Pacing Markers**: Indicate pauses, emphasis, energy shifts
5. **Scene Transitions**: Clear cuts between different shots/locations
6. **Value Stacking**: Deliver quick wins and insights throughout
7. **CTA Integration**: Natural, benefit-focused calls to action
8. **Length Awareness**: Respect platform norms (15s, 30s, 60s, 2-3min)

**Critical Rules**:
- Open with a pattern interrupt (no slow intros)
- Include [VISUAL: description] cues for every scene
- Mark [PAUSE], [EMPHASIS], [B-ROLL] where needed
- Keep sentences short and punchy
- Reference business specifics and unique value
- End with clear next step
- Never use generic phrases - be specific to the business
- Account for on-screen text suggestions

**Video Types**:
- **Explainer**: Teaching concept or product (60-90s)
- **Promotional**: Showcasing offer or service (30-45s)
- **Testimonial**: Customer success story format (45-60s)
- **Educational**: Quick tips or insights (30-60s)
- **Behind-the-scenes**: Authentic business look (60-90s)

Return ONLY valid JSON matching the VideoScriptOutput interface.`,
      temperature: 0.8, // Creative for engaging video content
      jsonMode: true,
    });
  }

  async generateScript(params: {
    businessName: string;
    businessType: string;
    videoTopic: string;
    videoType?:
      | "explainer"
      | "promotional"
      | "testimonial"
      | "educational"
      | "behind-the-scenes";
    targetLength?: number; // seconds
    intelligence?: any;
  }): Promise<VideoScriptOutput> {
    const {
      businessName,
      businessType,
      videoTopic,
      videoType = "promotional",
      targetLength = 60,
      intelligence,
    } = params;

    const contextParts: string[] = [
      `**Business**: ${businessName} (${businessType})`,
      `**Video Topic**: ${videoTopic}`,
      `**Video Type**: ${videoType}`,
      `**Target Length**: ${targetLength} seconds`,
    ];

    if (intelligence) {
      if (intelligence.differentiators?.length > 0) {
        contextParts.push(
          `**Key Differentiators**: ${intelligence.differentiators.slice(0, 3).join(", ")}`
        );
      }
      if (intelligence.location) {
        contextParts.push(`**Location**: ${intelligence.location}`);
      }
    }

    const userPrompt = `${contextParts.join("\n")}

Create a compelling video script following all principles above. Include visual cues, pacing markers, and make it feel natural when spoken aloud.

Return JSON: {
  "title": "Video title",
  "hook": "First 3 seconds script with [VISUAL: description]",
  "scenes": [
    {
      "scene_number": 1,
      "duration_seconds": 10,
      "visual_description": "What's on screen",
      "script": "What's being said (mark [PAUSE], [EMPHASIS] as needed)",
      "on_screen_text": "Text overlay if needed",
      "b_roll_suggestions": "Suggested B-roll footage"
    }
  ],
  "cta": "Clear call to action",
  "total_duration": ${targetLength},
  "music_suggestions": "Background music style/mood",
  "thumbnail_suggestion": "Eye-catching thumbnail concept"
}`;

    const result = await this.execute(userPrompt, {
      businessName,
      businessType,
      videoTopic,
      videoType,
      targetLength,
    });

    return JSON.parse(result.content);
  }

  async generateVariations(params: {
    businessName: string;
    businessType: string;
    videoTopic: string;
    targetLength?: number;
    intelligence?: any;
    count?: number;
  }): Promise<VideoScriptOutput[]> {
    const { count = 3 } = params;
    const videoTypes: Array<"explainer" | "promotional" | "educational"> = [
      "promotional",
      "educational",
      "explainer",
    ];

    const variations = await Promise.all(
      videoTypes
        .slice(0, count)
        .map((videoType) => this.generateScript({ ...params, videoType }))
    );

    return variations;
  }
}

// ============================================
// Newsletter Creator Agent
// ============================================

export class NewsletterAgent extends UnifiedAgent {
  constructor() {
    super({
      name: "newsletter-agent",
      description:
        "Expert email marketing specialist for engaging newsletters that drive opens and clicks",
      systemPrompt: `You are a professional email marketing specialist with 10+ years of experience creating high-performing newsletters that subscribers actually want to read and engage with.

**Your Expertise**:
- Subject line psychology that drives opens
- Preview text optimization
- Scannable email structure for mobile and desktop
- Balancing value with promotion
- Segmentation and personalization strategies

**Newsletter Principles**:
1. **Subject Line Power**: Curiosity, urgency, or benefit - never generic
2. **Preview Text Hook**: Extend subject line intrigue, don't repeat it
3. **Personal Greeting**: Conversational opening that feels human
4. **Value First**: Lead with insights, tips, or stories - not sales
5. **Scannable Design**: Short paragraphs, subheadings, bullet points
6. **Visual Breaks**: Suggest emoji, dividers, or image placements
7. **CTA Clarity**: 1-2 clear actions, not overwhelming choices
8. **PS Power**: Use postscript for secondary CTA or personal note

**Critical Rules**:
- Subject line: 30-50 characters (mobile-friendly)
- Preview text: 40-90 characters (complements subject)
- Opening: Address reader pain point or aspiration
- Body: 300-500 words (respect inbox time)
- CTAs: Action-oriented, benefit-focused buttons
- Tone: Conversational professional, like email from a colleague
- Avoid: Generic greetings, corporate jargon, pushy sales
- Include: Business-specific expertise, local relevance where applicable

**Newsletter Types**:
- **Educational**: Tips, insights, how-tos
- **Update**: Company news, behind-the-scenes
- **Promotional**: Featured service/product with value context
- **Curated**: Industry roundup, resources, recommendations
- **Story**: Customer success, founder story, team spotlight

Return ONLY valid JSON matching the NewsletterOutput interface.`,
      temperature: 0.75, // Professional yet personable
      jsonMode: true,
    });
  }

  async generateNewsletter(params: {
    businessName: string;
    businessType: string;
    newsletterTopic: string;
    newsletterType?:
      | "educational"
      | "update"
      | "promotional"
      | "curated"
      | "story";
    intelligence?: any;
  }): Promise<NewsletterOutput> {
    const {
      businessName,
      businessType,
      newsletterTopic,
      newsletterType = "educational",
      intelligence,
    } = params;

    const contextParts: string[] = [
      `**Business**: ${businessName} (${businessType})`,
      `**Newsletter Topic**: ${newsletterTopic}`,
      `**Type**: ${newsletterType}`,
    ];

    if (intelligence) {
      if (intelligence.differentiators?.length > 0) {
        contextParts.push(
          `**Differentiators**: ${intelligence.differentiators.slice(0, 3).join(", ")}`
        );
      }
      if (intelligence.brandAnalysis?.voice) {
        contextParts.push(
          `**Brand Voice**: ${intelligence.brandAnalysis.voice}`
        );
      }
      if (intelligence.location) {
        contextParts.push(`**Location**: ${intelligence.location}`);
      }
    }

    const userPrompt = `${contextParts.join("\n")}

Create a compelling newsletter following all principles above. Focus on delivering value first, with any promotion feeling natural and earned.

Return JSON: {
  "subject_line": "Compelling subject (30-50 chars)",
  "preview_text": "Hook that extends intrigue (40-90 chars)",
  "greeting": "Personal opening line",
  "sections": [
    {
      "heading": "Section heading (optional)",
      "content": "Section content with line breaks (use \\n)",
      "cta": {
        "text": "Button text",
        "url_placeholder": "Description of where this links"
      } // optional
    }
  ],
  "closing": "Sign-off with personality",
  "ps": "Postscript with secondary CTA or personal note (optional)",
  "design_notes": "Emoji suggestions, visual break ideas, image placement",
  "best_send_time": "Optimal day/time to send"
}`;

    const result = await this.execute(userPrompt, {
      businessName,
      businessType,
      newsletterTopic,
      newsletterType,
    });

    return JSON.parse(result.content);
  }

  async generateVariations(params: {
    businessName: string;
    businessType: string;
    newsletterTopic: string;
    intelligence?: any;
    count?: number;
  }): Promise<NewsletterOutput[]> {
    const { count = 3 } = params;
    const newsletterTypes: Array<"educational" | "promotional" | "story"> = [
      "educational",
      "promotional",
      "story",
    ];

    const variations = await Promise.all(
      newsletterTypes
        .slice(0, count)
        .map((newsletterType) =>
          this.generateNewsletter({ ...params, newsletterType })
        )
    );

    return variations;
  }
}

// ============================================
// FAQ Builder Agent
// ============================================

export class FAQAgent extends UnifiedAgent {
  constructor() {
    super({
      name: "faq-agent",
      description:
        "Expert content strategist specializing in comprehensive, SEO-optimized FAQ content",
      systemPrompt: `You are a professional content strategist with 10+ years of experience creating FAQ content that answers real customer questions, improves SEO, and reduces support burden.

**Your Expertise**:
- Anticipating customer questions and objections
- SEO optimization through question-based content
- Clear, concise answers that build trust
- Progressive information disclosure (simple to complex)
- Conversion-focused FAQ design

**FAQ Principles**:
1. **Real Questions**: Ask questions customers actually search for
2. **Natural Language**: Use conversational phrasing, not corporate speak
3. **Direct Answers**: Lead with answer, then add context if needed
4. **Keyword Integration**: Questions should match search queries
5. **Trust Building**: Address concerns honestly, build confidence
6. **Action Orientation**: Link to next steps where appropriate
7. **Comprehensive Coverage**: Address pricing, process, guarantees, objections
8. **Scannable Format**: Questions as H3, answers in digestible chunks

**Critical Rules**:
- Generate 8-12 FAQs covering key customer journey stages
- Questions: 5-15 words, conversational, searchable
- Answers: 50-150 words, direct and helpful
- Include objection handlers (price, time, trust)
- Reference business specifics (location, unique process, guarantees)
- Add schema markup suggestions for SEO
- Organize by category (General, Service, Pricing, Process, Support)
- Never be evasive - if you can't answer, explain why and offer alternative

**FAQ Categories**:
- **General**: About business, what makes it unique
- **Service/Product**: How it works, what's included, limitations
- **Pricing**: Costs, payment options, value justification
- **Process**: Steps, timeline, what to expect
- **Support**: Contact, guarantees, policies

Return ONLY valid JSON matching the FAQOutput interface.`,
      temperature: 0.7, // Balanced - clear yet comprehensive
      jsonMode: true,
    });
  }

  async generateFAQ(params: {
    businessName: string;
    businessType: string;
    focusArea?: string; // Optional specific focus
    intelligence?: any;
  }): Promise<FAQOutput> {
    const { businessName, businessType, focusArea, intelligence } = params;

    const contextParts: string[] = [
      `**Business**: ${businessName} (${businessType})`,
      focusArea ? `**Focus Area**: ${focusArea}` : "",
    ].filter(Boolean);

    if (intelligence) {
      if (intelligence.differentiators?.length > 0) {
        contextParts.push(
          `**Differentiators**: ${intelligence.differentiators.slice(0, 3).join(", ")}`
        );
      }
      if (intelligence.services?.length > 0) {
        contextParts.push(
          `**Services**: ${intelligence.services.slice(0, 5).join(", ")}`
        );
      }
      if (intelligence.location) {
        contextParts.push(`**Location**: ${intelligence.location}`);
      }
      if (intelligence.pricing) {
        contextParts.push(`**Pricing Context**: ${intelligence.pricing}`);
      }
    }

    const userPrompt = `${contextParts.join("\n")}

Create comprehensive FAQs following all principles above. Cover customer journey from awareness to decision. Use real, searchable questions.

Return JSON: {
  "faqs": [
    {
      "category": "General|Service|Pricing|Process|Support",
      "question": "Natural question customers ask",
      "answer": "Direct, helpful answer with context",
      "keywords": ["keyword1", "keyword2"],
      "cta": "Optional next step or link description"
    }
  ],
  "schema_markup_suggestions": "JSON-LD schema recommendations for SEO",
  "organization_notes": "How to structure these on the website for best UX"
}`;

    const result = await this.execute(userPrompt, {
      businessName,
      businessType,
      focusArea,
    });

    return JSON.parse(result.content);
  }

  async generateVariations(params: {
    businessName: string;
    businessType: string;
    intelligence?: any;
    count?: number;
  }): Promise<FAQOutput[]> {
    const { count = 3 } = params;
    const focusAreas = [
      "General information and services",
      "Pricing and value justification",
      "Process and what to expect",
    ];

    const variations = await Promise.all(
      focusAreas
        .slice(0, count)
        .map((focusArea) => this.generateFAQ({ ...params, focusArea }))
    );

    return variations;
  }
}

// ============================================
// TypeScript Interfaces
// ============================================

export interface BlogPostOutput {
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

export interface VideoScriptOutput {
  title: string;
  hook: string;
  scenes: Array<{
    scene_number: number;
    duration_seconds: number;
    visual_description: string;
    script: string;
    on_screen_text?: string;
    b_roll_suggestions?: string;
  }>;
  cta: string;
  total_duration: number;
  music_suggestions: string;
  thumbnail_suggestion: string;
}

export interface NewsletterOutput {
  subject_line: string;
  preview_text: string;
  greeting: string;
  sections: Array<{
    heading?: string;
    content: string;
    cta?: {
      text: string;
      url_placeholder: string;
    };
  }>;
  closing: string;
  ps?: string;
  design_notes: string;
  best_send_time: string;
}

export interface FAQOutput {
  faqs: Array<{
    category: "General" | "Service" | "Pricing" | "Process" | "Support";
    question: string;
    answer: string;
    keywords: string[];
    cta?: string;
  }>;
  schema_markup_suggestions: string;
  organization_notes: string;
}

// ============================================
// Singleton Exports
// ============================================

export const blogWriterAgent = new BlogWriterAgent();
export const videoScriptAgent = new VideoScriptAgent();
export const newsletterAgent = new NewsletterAgent();
export const faqAgent = new FAQAgent();
