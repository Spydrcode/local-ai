import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import {
  validateAIOutput,
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

    const response = await createChatCompletion({
      messages: [
        { role: "system", content: SOCIAL_POST_PROMPT },
        { role: "user", content: contextPrompt },
      ],
      temperature: 0.85,
      maxTokens: 500,
      jsonMode: true,
    });

    try {
      const parsed = JSON.parse(response);
      let posts: Array<{ platform: string; copy: string; cta: string }> = [];

      if (Array.isArray(parsed)) {
        posts = parsed
          .slice(0, 4)
          .map((post: { platform?: string; copy?: string; cta?: string }) => ({
            platform: post.platform ?? "Facebook",
            copy: post.copy ?? "",
            cta: post.cta ?? "Book now",
          }));
      }

      // Validate at least one post for business specificity
      if (posts.length > 0) {
        const samplePost = posts[0].copy;
        const validation = await validateAIOutput(
          "content",
          samplePost,
          siteText
        );

        if (validation.isValid || attempt === maxRetries) {
          // Log validation results
          console.log(
            `[Social Posts Validation] Attempt ${attempt + 1}/${maxRetries + 1}:`,
            {
              isValid: validation.isValid,
              score: validation.score,
              issues: validation.issues.length,
              postsGenerated: posts.length,
            }
          );

          if (!validation.isValid && attempt === maxRetries) {
            console.warn(
              "[Social Posts] Max retries reached, accepting output with issues:",
              validation.issues
            );
          }

          return posts;
        }

        // Log retry reason
        console.warn(
          `[Social Posts] Attempt ${attempt + 1} failed validation (score: ${validation.score}). Retrying...`
        );
        console.warn("Issues:", validation.issues);

        attempt++;
        continue;
      }

      // If no posts parsed, retry
      attempt++;
    } catch (error) {
      console.warn("Failed to parse social posts", error);

      // Return fallback only on final attempt
      if (attempt === maxRetries) {
        return [
          {
            platform: "Facebook",
            copy: "We're live with a personalized LocalIQ demo today!",
            cta: "Schedule demo",
          },
          {
            platform: "Instagram",
            copy: "Sneak peek: refreshed homepage concept built in minutes with LocalIQ.",
            cta: "See demo",
          },
        ];
      }

      attempt++;
    }
  }

  // Should never reach here
  throw new Error("Failed to generate social posts after all retries");
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
      maxTokens: 1800,
      jsonMode: true,
    });

    try {
      const parsed = JSON.parse(response);
      const homepage: DemoHomepageMock = {
        hero: {
          headline:
            parsed.hero?.headline ?? "Your neighborhood favorite, refreshed.",
          subheadline:
            parsed.hero?.subheadline ??
            "We combined your signature offerings with a modern flow to boost conversions.",
          ctaLabel: parsed.hero?.ctaLabel ?? "Book Now",
          backgroundIdea:
            parsed.hero?.backgroundIdea ??
            "Showcase high-energy hero photography",
        },
        sections: Array.isArray(parsed.sections)
          ? parsed.sections.slice(0, 6).map((section: any) => ({
              title: section.title ?? "Why locals love us",
              body:
                section.body ??
                "Highlight testimonials, hours, and top services.",
              ctaLabel: section.ctaLabel,
            }))
          : [],
        style: {
          primaryColor: parsed.style?.primaryColor ?? "#0f172a",
          secondaryColor: parsed.style?.secondaryColor ?? "#1e293b",
          accentColor: parsed.style?.accentColor ?? "#34d399",
          tone: parsed.style?.tone ?? "Friendly, expert, community first",
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
      console.warn("Failed to parse homepage blueprint", error);

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
    return {
      title: parsed.title ?? "LocalIQ insights for your neighborhood brand",
      excerpt:
        parsed.excerpt ??
        "A quick look at how to boost local engagement this month.",
      outline: Array.isArray(parsed.outline) ? parsed.outline.slice(0, 6) : [],
      body: parsed.body ?? response,
      suggestedTags: Array.isArray(parsed.suggestedTags)
        ? parsed.suggestedTags.slice(0, 6)
        : ["local-marketing", "smartlocal"],
    };
  } catch (error) {
    console.warn("Failed to parse blog post JSON", error);
    return {
      title: "How this demo drives more local conversions",
      excerpt: "Key takeaways from the LocalIQ SmartLocal assessment.",
      outline: ["Headline win", "Opportunities", "Next step CTA"],
      body: response,
      suggestedTags: ["localiq", "demo"],
    };
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
