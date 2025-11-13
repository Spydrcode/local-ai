/**
 * Social Media Content Agents
 *
 * Specialized agents for creating platform-specific social media content
 * Each agent has expertise in their platform's best practices and audience
 */

import { UnifiedAgent, type AgentConfig } from "./unified-agent-system";

/**
 * Facebook Marketing Agent
 * Expert in Facebook engagement, community building, and conversational posts
 */
export class FacebookMarketingAgent extends UnifiedAgent {
  constructor() {
    const config: AgentConfig = {
      name: "facebook-marketing-agent",
      description:
        "Expert Facebook marketer specializing in engagement-driven posts with emojis and conversational tone",
      systemPrompt: `You are a professional Facebook marketing expert with 10+ years of experience creating viral, engaging Facebook content for small businesses.

**Your Expertise**:
- Crafting scroll-stopping hooks that make people stop and read
- Using emojis naturally to enhance emotion and readability (not excessive)
- Writing conversational, authentic posts that sound human
- Creating content that drives comments, shares, and meaningful engagement
- Understanding Facebook's algorithm and what content performs best
- Storytelling that connects with local community audiences

**Facebook Content Principles**:
1. **Hook First**: First 1-2 sentences must grab attention (shows before "See More")
2. **Conversational Tone**: Write like you're talking to a friend, not making an announcement
3. **Emoji Strategy**: Use 3-5 emojis throughout post to break up text and add emotion
4. **Short Paragraphs**: 1-2 sentences per paragraph for mobile readability
5. **Engagement Triggers**: Ask questions, request opinions, invite comments
6. **Value First**: Give something (tip, story, insight) before asking for anything
7. **Clear CTA**: End with simple, friendly call-to-action

**Content Types You Excel At**:
- Behind-the-scenes stories
- Customer success stories
- Tips and how-tos
- Local community engagement
- Seasonal/timely content
- Educational posts
- Promotional posts (value-focused)

**Critical Rules**:
- NEVER sound corporate or robotic
- NEVER use excessive emojis (looks spammy)
- NEVER write long blocks of text
- ALWAYS use line breaks between paragraphs
- ALWAYS reference the specific business and their unique value
- ALWAYS match the business's brand voice if provided

**Tone Variations**:
- Friendly: Warm, welcoming, conversational
- Professional: Polished but still personable
- Fun: Playful, lighthearted, engaging
- Educational: Informative but accessible

Generate posts that get real engagement, not just likes. Every post should feel authentic and valuable to the target audience.`,
      temperature: 0.8, // Higher for creative, varied content
      maxTokens: 1000,
      jsonMode: true,
    };

    super(config);
  }

  /**
   * Generate Facebook post with variations
   */
  async generatePost(params: {
    businessName: string;
    businessType: string;
    topic?: string;
    tone?: "friendly" | "professional" | "fun" | "educational";
    intelligence?: any;
  }): Promise<{
    post: string;
    hashtags: string;
    best_time_to_post: string;
    engagement_tips: string;
    variations?: string[];
  }> {
    const {
      businessName,
      businessType,
      topic = "general promotional post",
      tone = "friendly",
      intelligence,
    } = params;

    // Build context from intelligence
    let context = `Business: ${businessName} (${businessType})`;
    if (intelligence?.business?.services) {
      context += `\nServices: ${intelligence.business.services.slice(0, 3).join(", ")}`;
    }
    if (intelligence?.business?.location) {
      context += `\nLocation: ${intelligence.business.location}`;
    }
    if (intelligence?.brandAnalysis?.tone) {
      context += `\nBrand Voice: ${intelligence.brandAnalysis.tone}`;
    }

    const prompt = `Create an engaging Facebook post for ${businessName}, a ${businessType} business.

${context}

**Topic**: ${topic}
**Desired Tone**: ${tone}

**Requirements**:
- Hook that stops the scroll in first line
- 2-3 short paragraphs (mobile-friendly)
- 3-5 emojis used naturally throughout
- Conversational, authentic voice
- Question or engagement trigger
- Clear but friendly call-to-action
- Total length: 100-150 words

${intelligence ? "**CRITICAL**: Reference their actual services, location, or unique differentiators from the intelligence data." : ""}

Return a JSON object with:
- post: The complete Facebook post text with emojis and line breaks
- hashtags: 3-5 relevant local/industry hashtags
- best_time_to_post: Recommended day/time based on industry
- engagement_tips: 2-3 tips to maximize this post's engagement`;

    const result = await this.execute(prompt, { businessName, topic, tone });

    return JSON.parse(result.content);
  }

  /**
   * Generate multiple post variations
   */
  async generateVariations(params: {
    businessName: string;
    businessType: string;
    topic?: string;
    count?: number;
    intelligence?: any;
  }): Promise<
    Array<{
      post: string;
      hashtags: string;
      tone: string;
    }>
  > {
    const variations = [];
    const tones: Array<"friendly" | "professional" | "fun" | "educational"> = [
      "friendly",
      "professional",
      "fun",
    ];
    const count = params.count || 3;

    for (let i = 0; i < count; i++) {
      const tone = tones[i % tones.length];
      const result = await this.generatePost({ ...params, tone });
      variations.push({
        post: result.post,
        hashtags: result.hashtags,
        tone,
      });
    }

    return variations;
  }
}

/**
 * Instagram Marketing Agent
 * Expert in visual storytelling, Instagram aesthetics, and hashtag strategy
 */
export class InstagramMarketingAgent extends UnifiedAgent {
  constructor() {
    const config: AgentConfig = {
      name: "instagram-marketing-agent",
      description:
        "Expert Instagram marketer specializing in visual storytelling and scroll-stopping captions",
      systemPrompt: `You are a professional Instagram marketing expert who creates scroll-stopping, engagement-driven content for small businesses.

**Your Expertise**:
- Writing captions that complement visual content perfectly
- Strategic emoji usage (Instagram is emoji-heavy!)
- Hashtag research and optimization (mix of popular and niche)
- Visual storytelling that connects emotionally
- Understanding Instagram's algorithm and content trends
- Creating content that drives saves, shares, and profile visits

**Instagram Content Principles**:
1. **Visual First**: Always suggest what photo/video to pair with caption
2. **Short & Punchy**: First line is crucial (shows before "more")
3. **Emoji Strategy**: Use 5-10 emojis throughout - this is Instagram! ✨💯
4. **Line Breaks**: Use line breaks for visual appeal and readability
5. **Storytelling**: Connect emotionally through stories, not just promotions
6. **Hashtag Strategy**: 10-15 hashtags (5 popular, 5 niche, 5 branded)
7. **Call-to-Action**: Clear CTA in caption or first comment

**Content Formats You Excel At**:
- Carousel post captions (educational/storytelling)
- Reel captions (short, punchy, trending)
- Story-style captions (behind-the-scenes)
- Before/after transformations
- Tips and value posts
- Customer spotlights
- Product/service showcases

**Critical Rules**:
- ALWAYS include visual suggestions
- ALWAYS use plenty of emojis (Instagram culture)
- NEVER write long paragraphs without line breaks
- ALWAYS include 10-15 strategic hashtags
- ALWAYS match the business's aesthetic if provided
- NEVER sound overly salesy

**Caption Lengths**:
- Micro (< 50 chars): For strong visuals that speak for themselves
- Short (50-125 chars): Quick tips, announcements, quotes
- Medium (125-200 chars): Storytelling, educational, engagement
- Long (200+ chars): Deep storytelling, value-packed education

Generate captions that stop the scroll and drive meaningful engagement, not just double-taps.`,
      temperature: 0.85, // Higher for creative, trendy content
      maxTokens: 1200,
      jsonMode: true,
    };

    super(config);
  }

  /**
   * Generate Instagram post with variations
   */
  async generatePost(params: {
    businessName: string;
    businessType: string;
    topic?: string;
    captionLength?: "micro" | "short" | "medium" | "long";
    intelligence?: any;
  }): Promise<{
    caption: string;
    first_comment?: string;
    hashtags: string;
    visual_suggestion: string;
    best_time_to_post: string;
  }> {
    const {
      businessName,
      businessType,
      topic = "promotional post",
      captionLength = "medium",
      intelligence,
    } = params;

    // Build context
    let context = `Business: ${businessName} (${businessType})`;
    if (intelligence?.business?.services) {
      context += `\nServices: ${intelligence.business.services.slice(0, 3).join(", ")}`;
    }
    if (intelligence?.brandAnalysis?.aesthetic) {
      context += `\nBrand Aesthetic: ${intelligence.brandAnalysis.aesthetic}`;
    }

    const prompt = `Create a scroll-stopping Instagram post for ${businessName}, a ${businessType} business.

${context}

**Topic**: ${topic}
**Caption Length**: ${captionLength}

**Requirements**:
- Hook in first line (before "more")
- Plenty of emojis throughout! ✨ (5-10 minimum)
- Line breaks for readability
- Emotional connection or storytelling
- Clear call-to-action
- 10-15 strategic hashtags (mix popular/niche)
- Visual content suggestion

${intelligence ? "**CRITICAL**: Reference their actual services, style, or unique elements from the intelligence data." : ""}

Return a JSON object with:
- caption: The Instagram caption with emojis and line breaks (use \\n)
- first_comment: Optional detailed info or additional hashtags for first comment
- hashtags: 10-15 relevant hashtags (mix of sizes)
- visual_suggestion: Detailed description of ideal photo/video to post
- best_time_to_post: Recommended time based on industry`;

    const result = await this.execute(prompt, { businessName, topic });

    return JSON.parse(result.content);
  }

  /**
   * Generate multiple caption variations
   */
  async generateVariations(params: {
    businessName: string;
    businessType: string;
    topic?: string;
    count?: number;
    intelligence?: any;
  }): Promise<
    Array<{
      caption: string;
      hashtags: string;
      style: string;
    }>
  > {
    const variations = [];
    const styles: Array<"micro" | "short" | "medium" | "long"> = [
      "short",
      "medium",
      "long",
    ];
    const count = params.count || 3;

    for (let i = 0; i < count; i++) {
      const captionLength = styles[i % styles.length];
      const result = await this.generatePost({ ...params, captionLength });
      variations.push({
        caption: result.caption,
        hashtags: result.hashtags,
        style: captionLength,
      });
    }

    return variations;
  }
}

/**
 * LinkedIn Marketing Agent
 * Expert in professional thought leadership and B2B content
 */
export class LinkedInMarketingAgent extends UnifiedAgent {
  constructor() {
    const config: AgentConfig = {
      name: "linkedin-marketing-agent",
      description:
        "Expert LinkedIn marketer specializing in professional thought leadership and B2B engagement",
      systemPrompt: `You are a professional LinkedIn content strategist who creates thought leadership content that drives professional engagement.

**Your Expertise**:
- Crafting professional yet personable content
- Thought leadership positioning
- B2B storytelling and case studies
- Industry insights and trends commentary
- Professional networking and relationship building
- Content that drives profile views, connections, and leads

**LinkedIn Content Principles**:
1. **Hook with Value**: Start with insight, question, or bold statement
2. **Professional Voice**: Polished but human, not corporate
3. **Storytelling**: Share experiences, lessons, real examples
4. **Line Breaks**: Short paragraphs for mobile readability
5. **Moderate Emojis**: 2-4 emojis max (professional context)
6. **Call-to-Action**: Invite discussion, ask questions, encourage engagement
7. **Industry Relevant**: Connect to broader industry trends

**Content Types You Excel At**:
- Industry insights and commentary
- Customer success stories (professional angle)
- Behind-the-scenes business lessons
- Tips and best practices
- Company milestones and achievements
- Team spotlights
- Thought leadership pieces

**Critical Rules**:
- NEVER sound like a corporate press release
- NEVER oversell or be overly promotional
- ALWAYS add value or insight
- ALWAYS sound like a human professional, not a brand
- ALWAYS use line breaks between paragraphs
- NEVER use excessive emojis

**Tone Spectrum**:
- Thought Leadership: Insightful, authoritative, educational
- Storytelling: Personal, relatable, lesson-driven
- Inspirational: Motivational, uplifting, encouraging
- Educational: Informative, practical, actionable

**Length Sweet Spot**: 150-250 words (enough to provide value, not too long)

Generate posts that position the business owner as an industry expert while building genuine professional relationships.`,
      temperature: 0.75, // Moderate for professional yet creative content
      maxTokens: 1200,
      jsonMode: true,
    };

    super(config);
  }

  /**
   * Generate LinkedIn post with variations
   */
  async generatePost(params: {
    businessName: string;
    businessType: string;
    topic?: string;
    contentType?:
      | "thought-leadership"
      | "storytelling"
      | "inspirational"
      | "educational";
    intelligence?: any;
  }): Promise<{
    post: string;
    hashtags: string;
    best_time_to_post: string;
    engagement_tips: string;
  }> {
    const {
      businessName,
      businessType,
      topic = "industry insight",
      contentType = "educational",
      intelligence,
    } = params;

    // Build context
    let context = `Business: ${businessName} (${businessType})`;
    if (intelligence?.business?.services) {
      context += `\nExpertise: ${intelligence.business.services.slice(0, 3).join(", ")}`;
    }
    if (intelligence?.business?.yearsInBusiness) {
      context += `\nExperience: ${intelligence.business.yearsInBusiness} years`;
    }

    const prompt = `Create a professional LinkedIn post for ${businessName}, a ${businessType} business.

${context}

**Topic**: ${topic}
**Content Type**: ${contentType}

**Requirements**:
- Professional yet personable tone
- Hook that provides immediate value
- 150-250 words
- 2-4 emojis (professional context)
- Line breaks for readability
- Industry insights or lessons
- Question or discussion prompt at end
- 3-5 industry-relevant hashtags

${intelligence ? "**CRITICAL**: Position them as an industry expert using their actual experience, credentials, or success stories from the intelligence data." : ""}

Return a JSON object with:
- post: The complete LinkedIn post with appropriate line breaks (use \\n)
- hashtags: 3-5 professional industry hashtags
- best_time_to_post: Recommended time for B2B audience
- engagement_tips: Tips to maximize professional engagement`;

    const result = await this.execute(prompt, {
      businessName,
      topic,
      contentType,
    });

    return JSON.parse(result.content);
  }

  /**
   * Generate multiple post variations
   */
  async generateVariations(params: {
    businessName: string;
    businessType: string;
    topic?: string;
    count?: number;
    intelligence?: any;
  }): Promise<
    Array<{
      post: string;
      hashtags: string;
      contentType: string;
    }>
  > {
    const variations = [];
    const types: Array<"thought-leadership" | "storytelling" | "educational"> =
      ["thought-leadership", "storytelling", "educational"];
    const count = params.count || 3;

    for (let i = 0; i < count; i++) {
      const contentType = types[i % types.length];
      const result = await this.generatePost({ ...params, contentType });
      variations.push({
        post: result.post,
        hashtags: result.hashtags,
        contentType,
      });
    }

    return variations;
  }
}

// Export singleton instances
export const facebookMarketingAgent = new FacebookMarketingAgent();
export const instagramMarketingAgent = new InstagramMarketingAgent();
export const linkedInMarketingAgent = new LinkedInMarketingAgent();
