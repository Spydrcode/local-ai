import { customAlphabet } from "nanoid";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
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
          "Return JSON with keys persona and faq (array of {question, answer}). Keep persona human and aligned to brand.",
      },
      {
        role: "user",
        content: `Site summary:\n${siteText}\nKey items:${keyItems.join("; ")}`,
      },
    ],
    temperature: 0.6,
    maxTokens: 500,
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

async function generatePosts(siteText: string) {
  const response = await createChatCompletion({
    messages: [
      { role: "system", content: SOCIAL_POST_PROMPT },
      { role: "user", content: siteText },
    ],
    temperature: 0.9,
    maxTokens: 400,
  });

  try {
    const parsed = JSON.parse(response);
    if (Array.isArray(parsed)) {
      return parsed
        .slice(0, 3)
        .map((post: { platform?: string; copy?: string; cta?: string }) => ({
          platform: post.platform ?? "Facebook",
          copy: post.copy ?? "",
          cta: post.cta ?? "Book now",
        }));
    }
  } catch (error) {
    console.warn("Failed to parse social posts", error);
  }

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

async function generateProfitInsights(siteText: string, keyItems: string[]) {
  const response = await createChatCompletion({
    messages: [
      { role: "system", content: PROFIT_IQ_PROMPT },
      {
        role: "user",
        content: `Site summary:\n${siteText}\nKey items:${keyItems.join("; ")}`,
      },
    ],
    temperature: 0.55,
    maxTokens: 600,
  });

  const sections = response.split(/\n\n+/);
  return {
    profitIq: sections[0] ?? response,
    actions: sections.slice(1, 4).filter(Boolean),
  };
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
  const response = await createChatCompletion({
    messages: [
      { role: "system", content: HOMEPAGE_BLUEPRINT_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ siteText, insights, keyItems }).slice(
          0,
          6000
        ),
      },
    ],
    temperature: 0.65,
    maxTokens: 900,
  });

  try {
    const parsed = JSON.parse(response);
    return {
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
        ? parsed.sections.slice(0, 4).map((section: any) => ({
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
  } catch (error) {
    console.warn("Failed to parse homepage blueprint", error);
    return {
      hero: {
        headline: "Your local experience, optimized",
        subheadline:
          "We refreshed the layout to highlight top sellers and easy booking.",
        ctaLabel: "Explore Services",
        backgroundIdea: "Use warm lifestyle imagery featuring real customers",
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
  const response = await createChatCompletion({
    messages: [
      { role: "system", content: BLOG_POST_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ siteText, insights, keyItems }).slice(
          0,
          6000
        ),
      },
    ],
    temperature: 0.7,
    maxTokens: 1100,
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
    const socialPosts = await generatePosts(siteText);
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
