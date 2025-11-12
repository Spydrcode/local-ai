/**
 * Tool Agent Helper
 * Provides a unified way for all tool APIs to use the agentic framework
 * Ensures consistency, proper error handling, and leverages the unified agent system
 */

import { AgentRegistry } from './unified-agent-system';

export interface ToolRequest {
  business_name: string;
  business_type: string;
  website_analysis?: any;
  [key: string]: any; // Allow additional tool-specific parameters
}

export interface ToolResponse {
  [key: string]: any; // Tool-specific response structure
  _metadata?: {
    model: string;
    business_name: string;
    business_type: string;
    executionTime: number;
    provider: string;
  };
}

/**
 * Execute a tool using the unified agent system
 */
export async function executeToolAgent(
  toolId: string,
  request: ToolRequest,
  options?: {
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }
): Promise<ToolResponse> {
  const startTime = Date.now();

  // Get or create the agent for this tool
  let agent = AgentRegistry.get(toolId);

  if (!agent) {
    // Register agent dynamically based on tool type
    const agentConfig = getToolAgentConfig(toolId);
    AgentRegistry.register(agentConfig);
    agent = AgentRegistry.get(toolId);
  }

  if (!agent) {
    throw new Error(`Failed to initialize agent for tool: ${toolId}`);
  }

  // Build context from request
  const context: Record<string, any> = {
    businessName: request.business_name,
    businessType: request.business_type,
  };

  // Add website analysis context if available
  if (request.website_analysis) {
    const analysis = request.website_analysis;
    context.differentiators = analysis.what_makes_you_different?.join(', ');
    context.strengths = analysis.your_strengths?.join(', ');
    context.niche = analysis.exact_sub_niche;
    context.opportunities = analysis.opportunities?.join(', ');
  }

  // Add any additional request parameters to context
  Object.keys(request).forEach(key => {
    if (key !== 'business_name' && key !== 'business_type' && key !== 'website_analysis') {
      context[key] = request[key];
    }
  });

  // Build the user message based on tool type
  const userMessage = buildToolUserMessage(toolId, request);

  // Execute the agent
  const response = await agent.execute(userMessage, context);

  // Parse the response
  let result: any;
  try {
    result = typeof response.content === 'string'
      ? JSON.parse(response.content)
      : response.content;
  } catch (error) {
    console.error('Failed to parse agent response:', error);
    throw new Error('Agent returned invalid JSON response');
  }

  // Add metadata
  result._metadata = {
    model: 'unified-agent-system',
    business_name: request.business_name,
    business_type: request.business_type,
    executionTime: Date.now() - startTime,
    provider: response.metadata.provider,
  };

  return result;
}

/**
 * Get agent configuration for a specific tool
 */
function getToolAgentConfig(toolId: string): any {
  const baseConfig = {
    name: toolId,
    temperature: 0.8,
    maxTokens: 2000,
    jsonMode: true,
  };

  // Define tool-specific configurations
  const toolConfigs: Record<string, any> = {
    'blog-writer': {
      ...baseConfig,
      description: 'Writes SEO-optimized blog posts',
      systemPrompt: `You are an expert content writer specializing in local business blogs.

Write engaging, SEO-optimized blog posts that:
- Demonstrate the business's specific expertise
- Include actionable tips readers can use
- Use H2 and H3 headings for structure
- Have a conversational but authoritative tone
- Include a clear call-to-action

Return JSON with: title, content (markdown), meta_description, keywords (array)`,
      maxTokens: 3000,
    },

    'email-writer': {
      ...baseConfig,
      description: 'Writes professional business emails',
      systemPrompt: `You are a professional business communication expert.

Write clear, professional emails that:
- Get to the point quickly
- Use appropriate tone for the context
- Include clear next steps or calls-to-action
- Are personalized to the recipient

Return JSON with: subject, body, tips (optional)`,
    },

    'review-responder': {
      ...baseConfig,
      description: 'Crafts perfect review responses',
      systemPrompt: `You are a reputation management expert.

Create review responses that:
- Thank the customer sincerely
- Address specific points mentioned in review
- Maintain brand voice
- For negative reviews: show empathy, take responsibility, offer solution
- For positive reviews: express gratitude, reinforce key strengths

Return JSON with: response, tone_tips (optional)`,
    },

    'ad-copy': {
      ...baseConfig,
      description: 'Creates compelling ad copy',
      systemPrompt: `You are a direct response copywriter.

Create ad copy that:
- Grabs attention with a strong headline
- Addresses a specific pain point or desire
- Highlights unique benefits (not just features)
- Includes a clear, compelling call-to-action
- Works for Facebook, Google, or Instagram ads

Return JSON with: headline, body, cta, targeting_tips (optional)`,
    },

    'faq-builder': {
      ...baseConfig,
      description: 'Creates comprehensive FAQs',
      systemPrompt: `You are a customer service expert.

Create helpful FAQs that:
- Answer the most common customer questions
- Are specific to the business type
- Use clear, simple language
- Reduce friction and build trust
- Include 5-7 questions with detailed answers

Return JSON with: faqs (array of {question, answer}), implementation_tips (optional)`,
    },

    'gmb-post': {
      ...baseConfig,
      description: 'Creates Google Business posts',
      systemPrompt: `You are a local SEO expert.

Create Google Business posts that:
- Are 150-300 words
- Include relevant local keywords
- Have a clear call-to-action
- Highlight special offers, events, or news
- Encourage engagement

Return JSON with: post_text, cta_button, topics (array), posting_schedule`,
    },

    'local-seo-meta': {
      ...baseConfig,
      description: 'Creates local SEO meta tags',
      systemPrompt: `You are a local SEO specialist.

Create meta tags that:
- Include location-specific keywords
- Are within character limits (title: 60, description: 160)
- Highlight unique selling points
- Include clear call-to-action in description
- Are optimized for local search intent

Return JSON with: page_title, meta_description, h1_tag, keywords (array)`,
    },

    'location-page': {
      ...baseConfig,
      description: 'Writes location landing pages',
      systemPrompt: `You are a local SEO content writer.

Write location landing page content that:
- Is 400-600 words
- Includes location name naturally 3-5 times
- Mentions local landmarks and neighborhoods
- Explains service area coverage
- Includes trust signals and CTAs
- Uses H2/H3 headings for structure

Return JSON with: page_title, content (markdown), meta_description, local_keywords`,
      maxTokens: 2500,
    },

    'video-script': {
      ...baseConfig,
      description: 'Writes video scripts for social media',
      systemPrompt: `You are a social media video content creator.

Write video scripts (30-60 seconds) that:
- Hook viewers in first 3 seconds
- Are conversational and energetic
- Tell a story or share a tip
- Include visual cues [like this]
- End with clear CTA
- Work for TikTok, Reels, or Shorts

Return JSON with: script (with [visual cues]), hook_options (array), platform_tips`,
    },

    'newsletter': {
      ...baseConfig,
      description: 'Creates email newsletters',
      systemPrompt: `You are an email marketing specialist.

Create newsletters that:
- Have a catchy subject line
- Include 3-4 content sections
- Mix value (tips/news) with promotion
- Use conversational tone
- Include clear CTAs
- Are scannable with headers

Return JSON with: subject, newsletter_content (markdown), send_timing, engagement_tips`,
      maxTokens: 2500,
    },
  };

  return toolConfigs[toolId] || {
    ...baseConfig,
    description: `Generates content for ${toolId}`,
    systemPrompt: `You are an AI assistant helping local businesses.

Generate high-quality, professional content specific to the business context provided.
Focus on being actionable, specific, and valuable.

Return your response as valid JSON.`,
  };
}

/**
 * Build user message for specific tool
 */
function buildToolUserMessage(toolId: string, request: ToolRequest): string {
  const { business_name, business_type } = request;

  // Base context
  let message = `Generate content for ${business_name}, a ${business_type} business.\n\n`;

  // Add website analysis context if available
  if (request.website_analysis) {
    const analysis = request.website_analysis;
    message += `**BUSINESS CONTEXT:**\n`;

    if (analysis.what_makes_you_different?.length > 0) {
      message += `What makes them different:\n`;
      analysis.what_makes_you_different.slice(0, 3).forEach((diff: string) => {
        message += `- ${diff}\n`;
      });
    }

    if (analysis.exact_sub_niche) {
      message += `\nTheir niche: ${analysis.exact_sub_niche}\n`;
    }

    message += `\n`;
  }

  // Add tool-specific instructions
  const toolInstructions: Record<string, string> = {
    'blog-writer': `Topic: ${request.topic || 'Common questions and expert tips about ' + business_type}

Write a 500-700 word blog post that demonstrates their expertise and provides real value to readers.`,

    'email-writer': `Purpose: ${request.purpose || 'Send a professional email to customers'}
Recipient: ${request.recipient || 'Customers'}

Write a professional email for this purpose.`,

    'review-responder': `Review Text: "${request.review_text || 'Thank you for the great service!'}"
Review Type: ${request.review_type || 'positive'}
Rating: ${request.rating || '5 stars'}

Write an appropriate response to this review.`,

    'ad-copy': `Platform: ${request.platform || 'Facebook/Instagram'}
Goal: ${request.goal || 'Get more customers'}

Create compelling ad copy that drives action.`,

    'faq-builder': `Create 5-7 frequently asked questions with detailed answers specific to ${business_type} businesses.`,

    'gmb-post': `Topic: ${request.topic || 'Business update or special offer'}

Create a Google Business post for this topic.`,

    'local-seo-meta': `Page Type: ${request.page_type || 'Homepage'}
Target Location: ${request.location || 'Local area'}

Create SEO-optimized meta tags for this page.`,

    'location-page': `Location: ${request.location || 'Service area'}
Services: ${request.services || business_type + ' services'}

Write content for a location landing page.`,

    'video-script': `Topic: ${request.topic || 'Quick tip or behind-the-scenes'}
Platform: ${request.platform || 'TikTok/Reels'}

Write a 30-60 second video script.`,

    'newsletter': `Theme: ${request.theme || 'Monthly update'}
Special Offer: ${request.special_offer || 'Optional'}

Create a monthly newsletter.`,
  };

  message += toolInstructions[toolId] || `Generate appropriate content for this tool.`;

  return message;
}

/**
 * Validate tool request
 */
export function validateToolRequest(request: any): request is ToolRequest {
  if (!request.business_name || typeof request.business_name !== 'string') {
    throw new Error('business_name is required and must be a string');
  }

  if (!request.business_type || typeof request.business_type !== 'string') {
    throw new Error('business_type is required and must be a string');
  }

  return true;
}
