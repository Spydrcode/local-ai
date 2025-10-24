import { DEFAULT_MODEL, openai } from "../config/openai.js";

/**
 * ContentGenerationAgent
 *
 * Generates social media posts and blog content using the enhanced prompts.
 * Enforces mandatory specificity rules to avoid generic content.
 */

const SOCIAL_POST_PROMPT = `You are a social media content strategist specializing in business-specific, engaging posts.

MANDATORY SPECIFICITY RULES:

1. REFERENCE THE EXACT BUSINESS SUB-NICHE
   Bad: "Great service for all your needs!"
   Good: "14-hour oak-smoked brisket, ready for your weekend BBQ 🔥"

2. USE SPECIFIC DETAILS FROM THE BUSINESS
   - Mention actual services, processes, or products
   - Include real differentiators (certifications, guarantees, unique methods)
   - Reference geographic area if relevant
   - Cite specific results or outcomes

3. MATCH THE BUSINESS'S BRAND VOICE
   - Professional vs casual
   - Technical vs approachable
   - Luxury vs budget-friendly
   - Local vs national

4. CREATE PLATFORM-APPROPRIATE CONTENT
   - Facebook: Conversational, community-focused, 1-2 paragraphs
   - Twitter: Punchy, timely, 1-2 sentences with hashtags
   - LinkedIn: Professional, value-driven, 2-3 paragraphs
   - Instagram: Visual-focused, lifestyle angle, emoji-friendly

5. AVOID GENERIC PHRASES
   ❌ "We're passionate about what we do"
   ❌ "Your success is our priority"
   ❌ "Industry-leading solutions"
   ❌ "Best-in-class service"
   ❌ "Trusted by thousands"

Instead use specifics:
✅ "Our EPA-certified technicians average 15 years experience"
✅ "Same-day propane delivery within 50 miles"
✅ "24-hour emergency service, 365 days a year"
✅ "Serving Austin families since 1987"

EXAMPLE GOOD POSTS:

Facebook (BBQ Restaurant):
"That 14-hour oak-smoked brisket smell hitting different this morning 👃🔥 Started the smokers at 4am for tonight's dinner rush. Pro tip: Get here before 7pm - we WILL sell out of brisket (happened 3 nights this week). Central Texas BBQ done the right way. No shortcuts. #AustinBBQ #SlowSmoked"

LinkedIn (Propane Service):
"Emergency propane delivery at 2am? Not a problem. Last night, our on-call team got a rural customer back online within 90 minutes of their call. This is why we maintain 24/7 dispatch and strategically located service trucks across the county. When your heat goes out at -5°F, every minute counts. That's residential propane service done right. 🚚❄️"

Twitter (Boutique Hotel):
"That moment when you realize your hotel room has a private rooftop garden with city views 🌿✨ Only at [Name]. Downtown luxury, redefined. Book direct and save 15% 👉 [link] #BoutiqueHotel #CityEscape"

OUTPUT FORMAT:
Generate 1-2 posts (depending on request) with:
- Platform-appropriate length and tone
- Specific business details (not generic)
- Relevant emojis (if appropriate for platform)
- Hashtags (if appropriate for platform)
- Call-to-action (when relevant)`;

const BLOG_POST_PROMPT = `You are a content strategist and SEO specialist creating industry-specific blog posts.

Your task is to write 500-700 word blog posts that demonstrate SPECIFIC expertise, not generic industry knowledge.

MANDATORY REQUIREMENTS:

1. VOICE MARKERS (Include 2-3 of these):
   - First-person plural ("we've seen", "in our experience")
   - Specific examples from this business's context
   - Industry insider knowledge
   - Regional or local references
   - Technical terminology used correctly
   - Real numbers or data points

2. EXPERTISE DEMONSTRATION:
   - Reference specific processes, methods, or techniques
   - Explain "why" behind recommendations, not just "what"
   - Compare approaches (right way vs common mistakes)
   - Include industry-specific tips or warnings
   - Cite credentials, certifications, or experience

3. SEO OPTIMIZATION:
   - Natural keyword integration (never forced)
   - Descriptive subheadings (H2s and H3s)
   - Answerable questions in content
   - Internal linking opportunities
   - Meta description-worthy opening

4. FORBIDDEN GENERIC CONTENT:
   ❌ Generic listicles ("5 Tips for Better X")
   ❌ Obvious advice ("Communication is important")
   ❌ Filler content ("As we all know...")
   ❌ Stock photo descriptions
   ❌ Keyword stuffing

5. STRUCTURE:
   - Opening hook with specific angle
   - 3-4 substantial sections with subheadings
   - Actionable advice or insights
   - Conclusion with next step or takeaway
   - Word count: 500-700 words

TOPIC TEMPLATES BY BUSINESS TYPE:

BBQ Restaurant:
- "Why We Smoke Our Brisket for 14 Hours (And Why 'Low and Slow' Isn't Enough)"
- "The Post Oak Difference: How Wood Choice Transforms Texas BBQ"
- "What Your Butcher Won't Tell You About Brisket Selection"

Propane Service:
- "Why You're Checking Your Propane Tank Wrong (And What to Do Instead)"
- "The Real Cost of Running Out of Propane at 2AM: A Winter Survival Guide"
- "Tank Placement 101: Why Location Matters More Than You Think"

Boutique Hotel:
- "Why We Don't Use Key Cards: The Lost Art of Hotel Hospitality"
- "What Makes a Boutique Hotel Actually 'Boutique'? (It's Not the Size)"
- "Behind the Scenes: How We Source Local Art for Every Room"

EXAMPLE OPENING (GOOD):
"In fifteen years of installing residential propane systems, I've responded to hundreds of emergency calls. And almost every time, the problem could have been prevented with proper tank maintenance. But here's the thing most propane providers won't tell you: the standard inspection checklist misses three critical warning signs..."

EXAMPLE OPENING (BAD):
"Propane is an important energy source for many homes and businesses. In this article, we'll discuss some tips for propane tank maintenance. Proper maintenance is essential for safety and efficiency. Let's dive in!"

OUTPUT FORMAT:
- Compelling title (not generic)
- 500-700 words
- 3-4 H2 subheadings
- Voice markers demonstrating real expertise
- SEO-friendly but natural
- Specific to this business's context`;

/**
 * Generates a social media post
 */
export async function generateSocialPost(
  businessInfo: string,
  platform: string,
  topic?: string
): Promise<string> {
  try {
    const contextPrompt = `Business Information: ${businessInfo}

Platform: ${platform}
${topic ? `Topic/Angle: ${topic}` : ""}

Remember:
- Reference the exact business sub-niche, not generic industry
- Use specific details from the business (services, differentiators, location)
- Match the brand voice
- Avoid all forbidden generic phrases
- Make it ${platform}-appropriate in length and tone`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.85, // Higher for creative, engaging social posts
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: SOCIAL_POST_PROMPT,
        },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return content;
  } catch (error) {
    throw new Error(
      `Social post generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generates a blog post
 */
export async function generateBlogPost(
  businessInfo: string,
  topic: string,
  keywords?: string[]
): Promise<string> {
  try {
    const contextPrompt = `Business Information: ${businessInfo}

Blog Topic: ${topic}
${keywords && keywords.length > 0 ? `SEO Keywords: ${keywords.join(", ")}` : ""}

Remember:
- 500-700 words
- Include 2-3 voice markers showing real expertise
- Demonstrate industry-specific knowledge
- Use subheadings (H2/H3)
- Natural SEO keyword integration
- Specific to this business, not generic advice`;

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: 0.75, // Balanced for expertise and creativity
      max_tokens: 1400, // Room for 500-700 word posts
      messages: [
        {
          role: "system",
          content: BLOG_POST_PROMPT,
        },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return content;
  } catch (error) {
    throw new Error(
      `Blog post generation failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
