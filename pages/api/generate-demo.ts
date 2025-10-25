import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import {
  validateHomepageBlueprint,
  validateProfitInsights,
} from "../../lib/ai-validation";
import { createChatCompletion } from "../../lib/openai";
import {
  BLOG_POST_PROMPT,
  HOMEPAGE_BLUEPRINT_PROMPT,
  PROFIT_IQ_PROMPT,
  SOCIAL_POST_PROMPT,
} from "../../lib/prompts";
import { upsertDemoCache } from "../../server/demoCache";
import { throttle } from "../../server/rateLimiter";
import { supabaseAdmin } from "../../server/supabaseAdmin";
import type {
  DemoBlogPost,
  DemoHomepageMock,
  GeneratedDemo,
} from "../../types/demo";

const nanoid = customAlphabet("demo1234567890", 10);

const requestSchema = z.object({
  clientId: z.string(),
  siteText: z.string().min(20, "Provide extracted site text"),
  metadata: z
    .object({
      url: z.string().optional(),
      keyItems: z.array(z.string()).optional(),
      embeddingsId: z.string().optional(),
    })
    .optional(),
  insightsOnly: z.boolean().optional(),
});

interface DemoGenerateResponse {
  demoId: string;
  chatbotConfig: {
    persona: string;
    faq: Array<{ question: string; answer: string }>;
  };
  insights: {
    profitIq: string;
    actions: string[];
  };
  socialPosts: Array<{
    platform: string;
    copy: string;
    cta: string;
  }>;
  homepage: DemoHomepageMock;
  blogPost: DemoBlogPost;
}

async function buildChatbotConfig(siteText: string, keyItems: string[]) {
  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates chatbot configurations. Return a JSON object with keys 'persona' (string describing the chatbot personality) and 'faq' (array of objects with 'question' and 'answer' strings). Keep persona human and aligned to brand.",
      },
      {
        role: "user",
        content: `Site summary:\n${siteText}\nKey items:${keyItems.join("; ")}\n\nGenerate a chatbot configuration with a persona and 4-6 FAQ entries.`,
      },
    ],
    temperature: 0.6,
    maxTokens: 1000,
    jsonMode: true,
  });

  try {
    const parsed = JSON.parse(response);
    return {
      persona: parsed.persona ?? "LocalIQ assistant",
      faq: Array.isArray(parsed.faq)
        ? parsed.faq
            .slice(0, 4)
            .map((entry: { question: string; answer: string }) => ({
              question: entry.question,
              answer: entry.answer,
            }))
        : [],
    };
  } catch (error) {
    console.warn("Failed to parse chatbot config", error);
    return {
      persona: "LocalIQ assistant",
      faq: [
        {
          question: "What services do you offer?",
          answer: "We highlight top services extracted from the site crawl.",
        },
      ],
    };
  }
}

async function generatePosts(siteText: string, keyItems: string[]) {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const strictnessLevel =
      attempt === 0
        ? ""
        : attempt === 1
          ? "\n\n⚠️ CRITICAL: Posts must reference ACTUAL products/services from their business. NO generic marketing!"
          : "\n\n🚨 FINAL ATTEMPT: Every post must include specific business details, products, or differentiators!";

    const contextPrompt = `Create specific social media posts for this business.

BUSINESS CONTEXT:
${siteText}

THEIR ACTUAL OFFERINGS:
${keyItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

Generate 3-4 posts that mention their specific products/services and appeal to their target customers. Be creative and industry-specific.${strictnessLevel}`;

    try {
      const response = await createChatCompletion({
        messages: [
          { role: "system", content: SOCIAL_POST_PROMPT },
          { role: "user", content: contextPrompt },
        ],
        temperature: 0.85,
        maxTokens: 500,
        // Don't use JSON mode - emojis cause unterminated string errors
        jsonMode: false,
      });

      // Parse markdown-style formatted posts instead of JSON
      const postBlocks = response
        .split(/\n\n+/)
        .filter((block) => block.trim());
      const posts: Array<{ platform: string; copy: string; cta: string }> = [];

      for (const block of postBlocks) {
        const lines = block.split("\n").filter((line) => line.trim());
        let platform = "Facebook";
        let copy = "";
        let cta = "Learn More";

        for (const line of lines) {
          if (line.match(/^Platform:/i)) {
            platform = line.replace(/^Platform:/i, "").trim();
          } else if (line.match(/^Copy:/i)) {
            copy = line.replace(/^Copy:/i, "").trim();
          } else if (line.match(/^CTA:/i)) {
            cta = line.replace(/^CTA:/i, "").trim();
          } else if (!line.match(/^(Platform|Copy|CTA):/i) && copy === "") {
            // If no labels, treat as copy
            copy = line;
          }
        }

        if (copy.length > 10) {
          posts.push({ platform, copy, cta });
        }
      }

      if (posts.length > 0) {
        return posts.slice(0, 4);
      }
    } catch (error) {
      console.warn(
        `Social posts generation attempt ${attempt + 1} failed:`,
        error
      );
    }

    attempt++;
  }

  // Fallback if all retries failed
  console.warn("All social post generation attempts failed, using fallback");
  return [
    {
      platform: "Facebook",
      copy: "We're excited to share our latest business insights and services with the community!",
      cta: "Learn More",
    },
    {
      platform: "Instagram",
      copy: "Behind the scenes: Our team working hard to serve our customers better every day.",
      cta: "Follow Us",
    },
  ];
}

async function generateProfitInsights(siteText: string, keyItems: string[]) {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const strictnessLevel =
      attempt === 0
        ? ""
        : attempt === 1
          ? "\n\n⚠️ CRITICAL: Previous insights were too generic. Analyze THIS specific business type and their actual differentiators!"
          : "\n\n🚨 FINAL ATTEMPT: Must include competitive analysis specific to their exact niche. Reference their actual products/services!";

    const contextPrompt = `Analyze this local business website and provide specific, tailored insights.

BUSINESS CONTEXT:
${siteText}

KEY OFFERINGS IDENTIFIED:
${keyItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

INSTRUCTIONS:
1. First, identify their EXACT business sub-category (be hyper-specific)
2. Analyze what makes them DIFFERENT from typical competitors
3. Find their current strengths from their actual offerings
4. Identify the BIGGEST opportunity gap for this specific business type
5. Provide actionable items that reference their real products/services

Remember: Generic advice is useless. Every insight must prove you analyzed THIS specific business.${strictnessLevel}`;

    const response = await createChatCompletion({
      messages: [
        { role: "system", content: PROFIT_IQ_PROMPT },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
      temperature: 0.75,
      maxTokens: 1200,
    });

    const sections = response.split(/\n\n+/);
    const insights = {
      profitIq: sections.slice(0, 3).join("\n\n") || response,
      actions: sections
        .slice(3)
        .filter(Boolean)
        .filter((s) => s.trim().startsWith("-") || /^\d+\./.test(s.trim())),
    };

    // Validate the insights
    const validation = validateProfitInsights(insights.profitIq, siteText);

    if (validation.isValid || attempt === maxRetries) {
      // Log validation results
      console.log(
        `[Profit Insights Validation] Attempt ${attempt + 1}/${maxRetries + 1}:`,
        {
          isValid: validation.isValid,
          issues: validation.issues.length,
          suggestions: validation.suggestions.length,
        }
      );

      if (!validation.isValid && attempt === maxRetries) {
        console.warn(
          "[Profit Insights] Max retries reached, accepting output with issues:",
          validation.issues
        );
      }

      return insights;
    }

    // Log retry reason
    console.warn(
      `[Profit Insights] Attempt ${attempt + 1} failed validation. Retrying...`
    );
    console.warn("Issues:", validation.issues);
    console.warn("Suggestions:", validation.suggestions);

    attempt++;
  }

  // Should never reach here, but TypeScript needs this
  throw new Error("Failed to generate profit insights after all retries");
}

async function generateHomepageBlueprint({
  siteText,
  insights,
  keyItems,
}: {
  siteText: string;
  insights: { profitIq: string; actions: string[] };
  keyItems: string[];
}): Promise<DemoHomepageMock> {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const strictnessLevel =
      attempt === 0
        ? ""
        : attempt === 1
          ? "\n\n⚠️ CRITICAL: Previous attempt was too generic. Use ACTUAL business details from context above. NO generic templates!"
          : "\n\n🚨 FINAL ATTEMPT: Must be 100% specific to THIS business type. Reference their EXACT offerings and industry niche!";

    const contextPrompt = `Design a custom homepage for this specific business.

BUSINESS DETAILS:
${siteText}

KEY OFFERINGS:
${keyItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

AI INSIGHTS ABOUT THEIR POSITIONING:
${insights.profitIq}

IMPROVEMENT OPPORTUNITIES IDENTIFIED:
${insights.actions
  .slice(0, 3)
  .map((action, idx) => `${idx + 1}. ${action}`)
  .join("\n")}

DESIGN REQUIREMENTS:
1. Identify their EXACT business sub-category (not just "restaurant" but "Texas BBQ catering")
2. Design hero that highlights their UNIQUE differentiator
3. Choose colors that match successful businesses in their SPECIFIC niche
4. Create 5-7 sections that are unmistakably for THIS type of business
5. Every section must reference their actual offerings or specialization

Make this so specific that someone could identify their exact industry in 3 seconds.${strictnessLevel}`;

    const response = await createChatCompletion({
      messages: [
        { role: "system", content: HOMEPAGE_BLUEPRINT_PROMPT },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
      temperature: 0.8,
      maxTokens: 2500, // Increased from 1800 to prevent truncation
      jsonMode: true, // Use JSON mode for structured output
    });

    try {
      // Try to parse as JSON first
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (jsonError) {
        // If JSON parsing fails, log detailed error
        console.error(
          "[Homepage] JSON parse failed:",
          (jsonError as Error).message
        );
        console.error("[Homepage] Response length:", response.length);
        console.error("[Homepage] Response start:", response.substring(0, 200));
        console.error(
          "[Homepage] Response end:",
          response.substring(response.length - 200)
        );

        // Try to extract JSON from markdown
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          console.log("[Homepage] Found JSON in markdown, attempting to parse");
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          // Try to find JSON object
          const objectMatch = response.match(/\{[\s\S]*\}/);
          if (objectMatch) {
            console.log("[Homepage] Found JSON object, attempting to parse");
            parsed = JSON.parse(objectMatch[0]);
          } else {
            throw new Error("Could not extract valid JSON from response");
          }
        }
      }

      // Validate that AI provided all required fields
      if (!parsed.hero?.headline || !parsed.hero?.subheadline) {
        throw new Error("AI failed to generate required hero content");
      }
      if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new Error("AI failed to generate homepage sections");
      }
      if (!parsed.style?.primaryColor) {
        throw new Error("AI failed to generate color scheme");
      }

      const homepage: DemoHomepageMock = {
        hero: {
          headline: parsed.hero.headline,
          subheadline: parsed.hero.subheadline,
          ctaLabel: parsed.hero.ctaLabel || "Get Started",
          backgroundIdea:
            parsed.hero.backgroundIdea || "Hero image showcasing the business",
        },
        sections: parsed.sections.slice(0, 6).map((section: any) => ({
          title: section.title,
          body: section.body,
          ctaLabel: section.ctaLabel,
        })),
        style: {
          primaryColor: parsed.style.primaryColor,
          secondaryColor:
            parsed.style.secondaryColor || parsed.style.primaryColor,
          accentColor: parsed.style.accentColor || "#34d399",
          tone: parsed.style.tone || "Professional and engaging",
        },
      };

      // Validate the generated homepage
      const validation = validateHomepageBlueprint(homepage, siteText);

      if (validation.isValid || attempt === maxRetries) {
        // Log validation results
        console.log(
          `[Homepage Validation] Attempt ${attempt + 1}/${maxRetries + 1}:`,
          {
            isValid: validation.isValid,
            issues: validation.issues.length,
            suggestions: validation.suggestions.length,
          }
        );

        if (!validation.isValid && attempt === maxRetries) {
          console.warn(
            "[Homepage] Max retries reached, accepting output with issues:",
            validation.issues
          );
        }

        return homepage;
      }

      // Log retry reason
      console.warn(
        `[Homepage] Attempt ${attempt + 1} failed validation. Retrying...`
      );
      console.warn("Issues:", validation.issues);
      console.warn("Suggestions:", validation.suggestions);

      attempt++;
    } catch (error) {
      console.error("Failed to parse homepage blueprint:", error);
      console.error("Response received:", response?.substring(0, 500)); // Log first 500 chars

      // Return fallback only on final attempt
      if (attempt === maxRetries) {
        return {
          hero: {
            headline: "Your local experience, optimized",
            subheadline:
              "We refreshed the layout to highlight top sellers and easy booking.",
            ctaLabel: "Explore Services",
            backgroundIdea:
              "Use warm lifestyle imagery featuring real customers",
          },
          sections: [
            {
              title: "Top offerings",
              body: "Feature best sellers with quick CTAs and add a weekday promo ribbon.",
            },
            {
              title: "Social proof",
              body: "Pull in recent reviews and showcase star ratings near booking button.",
            },
          ],
          style: {
            primaryColor: "#0f172a",
            secondaryColor: "#1e293b",
            accentColor: "#34d399",
            tone: "Local, upbeat, confident",
          },
        };
      }

      attempt++;
    }
  }

  // Should never reach here, but TypeScript needs this
  throw new Error("Failed to generate homepage blueprint after all retries");
}

async function generateBlogPost({
  siteText,
  insights,
  keyItems,
}: {
  siteText: string;
  insights: { profitIq: string; actions: string[] };
  keyItems: string[];
}): Promise<DemoBlogPost> {
  const contextPrompt = `Create a valuable blog post for this specific business.

BUSINESS CONTEXT:
${siteText}

KEY OFFERINGS:
${keyItems.map((item, idx) => `${idx + 1}. ${item}`).join("\n")}

AI INSIGHTS:
${insights.profitIq}

Create a blog post that showcases their expertise in their specific industry and provides real value to their target customers. Make it specific to their business type and location.`;

  const response = await createChatCompletion({
    messages: [
      { role: "system", content: BLOG_POST_PROMPT },
      {
        role: "user",
        content: contextPrompt,
      },
    ],
    temperature: 0.75,
    maxTokens: 1400,
  });

  try {
    const parsed = JSON.parse(response);

    // Validate AI generated all required fields
    if (!parsed.title || !parsed.body) {
      throw new Error("AI failed to generate required blog content");
    }

    return {
      title: parsed.title,
      excerpt: parsed.excerpt || parsed.title,
      outline: Array.isArray(parsed.outline) ? parsed.outline.slice(0, 6) : [],
      body: parsed.body,
      suggestedTags: Array.isArray(parsed.suggestedTags)
        ? parsed.suggestedTags.slice(0, 6)
        : [],
    };
  } catch (error) {
    console.error("Failed to parse blog post JSON:", error);
    // Re-throw to fail fast rather than returning generic content
    throw new Error(
      `Blog post generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DemoGenerateResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    throttle(`${req.socket.remoteAddress ?? "anonymous"}:generate`);
  } catch (throttleError) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }

  const parseResult = requestSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const { clientId, siteText, metadata, insightsOnly } = parseResult.data;
  const keyItems = metadata?.keyItems ?? [];
  const demoId = metadata?.embeddingsId ?? `demo-${nanoid()}`;

  try {
    const insights = await generateProfitInsights(siteText, keyItems);

    // If only insights requested, return early
    if (insightsOnly) {
      return res.status(200).json({
        demoId,
        insights,
      } as any);
    }

    const chatbotConfig = await buildChatbotConfig(siteText, keyItems);
    const socialPosts = await generatePosts(siteText, keyItems);
    const [homepage, blogPost] = await Promise.all([
      generateHomepageBlueprint({ siteText, insights, keyItems }),
      generateBlogPost({ siteText, insights, keyItems }),
    ]);

    const demoRecord: GeneratedDemo = {
      id: demoId,
      clientId,
      url: metadata?.url,
      summary: siteText,
      keyItems,
      chatbotConfig,
      insights,
      socialPosts,
      homepage,
      blogPost,
      createdAt: new Date().toISOString(),
    };

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from("demos").upsert({
        id: demoId,
        client_id: clientId,
        summary: siteText,
        key_items: keyItems,
        chatbot_config: chatbotConfig,
        insights,
        social_posts: socialPosts,
        homepage_blueprint: homepage,
        blog_post: blogPost,
        site_url: metadata?.url ?? null,
        brand_color: null,
      });

      if (error) {
        console.warn("Failed to persist demo", error.message);
      }
    }

    upsertDemoCache(demoRecord);
    console.log(
      "[generate-demo] Cached demo:",
      demoId,
      "for client:",
      clientId
    );

    return res.status(200).json({
      demoId,
      chatbotConfig,
      insights,
      socialPosts,
      homepage,
      blogPost,
    });
  } catch (error) {
    console.error("Generate demo error", error);
    return res.status(500).json({ error: "Failed to generate demo" });
  }
}
