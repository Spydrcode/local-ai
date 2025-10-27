import { generateSocialCopy } from "@/lib/agents/SocialMediaCopyAgent";
import { generateEmojiStrategy } from "@/lib/agents/SocialMediaEmojiAgent";
import { generateSocialStyle } from "@/lib/agents/SocialMediaStyleAgent";
import {
  searchAudienceVectors,
  searchBrandVoiceVectors,
  searchCopyContextVectors,
  searchSocialMediaVectors,
} from "@/lib/vector";
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SocialPost {
  id: string;
  platform: "Facebook" | "Instagram" | "LinkedIn" | "Twitter";
  content: string;
  hashtags: string[];
  emojis: string;
  cta: string;
  characterCount: number;
  bestTimeToPost: string;
  engagementTips: string[];
}

const PLATFORM_SPECS = {
  Facebook: {
    maxLength: 63206,
    optimalLength: 80,
    hashtagLimit: 3,
    tone: "conversational and community-focused",
    features: ["stories", "groups", "events", "marketplace"],
  },
  Instagram: {
    maxLength: 2200,
    optimalLength: 138,
    hashtagLimit: 30,
    tone: "visual-first and aspirational",
    features: ["stories", "reels", "shopping", "hashtags"],
  },
  LinkedIn: {
    maxLength: 3000,
    optimalLength: 150,
    hashtagLimit: 5,
    tone: "professional and thought-leadership",
    features: ["articles", "polls", "documents", "newsletters"],
  },
  Twitter: {
    maxLength: 280,
    optimalLength: 100,
    hashtagLimit: 2,
    tone: "concise and timely",
    features: ["threads", "polls", "spaces", "moments"],
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { demoId } = req.query;

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Demo ID required" });
  }

  // GET: Fetch existing social posts
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("demos")
        .select("social_posts, summary")
        .eq("id", demoId)
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Demo not found" });

      return res.status(200).json({
        posts: data.social_posts || [],
        summary: data.summary,
      });
    } catch (error) {
      console.error("Error fetching social posts:", error);
      return res.status(500).json({ error: "Failed to fetch social posts" });
    }
  }

  // POST: Generate new social media posts
  if (req.method === "POST") {
    try {
      const { platform, regenerate = false } = req.body;

      if (
        !platform ||
        !PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS]
      ) {
        return res.status(400).json({
          error:
            "Valid platform required (Facebook, Instagram, LinkedIn, Twitter)",
        });
      }

      // Get demo data
      const { data: demo, error: demoError } = await supabase
        .from("demos")
        .select("summary, key_items")
        .eq("id", demoId)
        .single();

      if (demoError) throw demoError;
      if (!demo) return res.status(404).json({ error: "Demo not found" });

      // Get enriched context from specialized vector searches
      // Each search is optimized for different agent needs
      const [generalContext, copyContext, brandVoiceContext, audienceContext] =
        await Promise.all([
          // General social media marketing context
          searchSocialMediaVectors(
            demoId,
            `${platform} social media marketing opportunities and strategies`,
            platform as "Facebook" | "Instagram" | "LinkedIn" | "Twitter",
            5
          ),
          // Product/service details and differentiators for compelling copy
          searchCopyContextVectors(
            demoId,
            `key products services features benefits value propositions`,
            "promotional",
            5
          ),
          // Brand voice and tone for consistent personality
          searchBrandVoiceVectors(demoId, 4),
          // Target audience insights for tailored messaging
          searchAudienceVectors(
            demoId,
            platform as "Facebook" | "Instagram" | "LinkedIn" | "Twitter",
            4
          ),
        ]);

      // Organize context for different agent needs
      const generalBusinessContext = [
        "=== GENERAL CONTEXT ===",
        ...generalContext.map((r) => r.content),
      ].join("\n\n");

      const copyAgentContext = [
        "=== PRODUCT/SERVICE DETAILS ===",
        ...copyContext.map((r) => r.content),
        "\n=== GENERAL CONTEXT ===",
        ...generalContext.map((r) => r.content),
      ].join("\n\n");

      const styleAgentContext = [
        "=== BRAND VOICE & TONE ===",
        ...brandVoiceContext.map((r) => r.content),
        "\n=== TARGET AUDIENCE ===",
        ...audienceContext.map((r) => r.content),
      ].join("\n\n");

      const emojiAgentContext = [
        "=== TARGET AUDIENCE ===",
        ...audienceContext.map((r) => r.content),
        "\n=== BRAND VOICE & TONE ===",
        ...brandVoiceContext.map((r) => r.content),
      ].join("\n\n");

      // Get platform specs
      const platformSpec =
        PLATFORM_SPECS[platform as keyof typeof PLATFORM_SPECS];

      // Generate 3 variations of the social post using specialized AI agents
      const variations: SocialPost[] = [];

      const postTypes: Array<"promotional" | "engagement" | "educational"> = [
        "promotional",
        "engagement",
        "educational",
      ];

      // Generate posts concurrently using all three agents
      const postPromises = postTypes.map(async (postType, i) => {
        try {
          // AGENT 1: Copy Agent - Generate compelling copy
          // Uses product/service details and general context
          const copyResult = await generateSocialCopy({
            platform,
            businessContext: `${demo.summary}\n\nEnriched Context:\n${copyAgentContext}`,
            postType,
            platformSpec: {
              maxLength: platformSpec.maxLength,
              optimalLength: platformSpec.optimalLength,
              tone: platformSpec.tone,
              features: platformSpec.features,
            },
          });

          // AGENT 2: Style Agent - Generate hashtags and engagement strategy
          // Uses brand voice and audience insights
          const styleResult = await generateSocialStyle({
            platform,
            businessContext: `${demo.summary}\n\nEnriched Context:\n${styleAgentContext}`,
            copy: copyResult.mainCopy,
            platformSpec: {
              hashtagLimit: platformSpec.hashtagLimit,
              tone: platformSpec.tone,
            },
          });

          // AGENT 3: Emoji Agent - Generate emoji strategy and placement
          // Uses audience demographics and brand personality
          const emojiResult = await generateEmojiStrategy({
            platform,
            businessContext: `${demo.summary}\n\nEnriched Context:\n${emojiAgentContext}`,
            copy: copyResult.mainCopy,
            tone: platformSpec.tone,
          });

          // Combine results from all three agents
          const post: SocialPost = {
            id: `${platform.toLowerCase()}-${Date.now()}-${i}`,
            platform,
            content: copyResult.mainCopy,
            hashtags: styleResult.hashtags,
            emojis: emojiResult.emojis.join(" "),
            cta: copyResult.cta,
            characterCount: copyResult.characterCount,
            bestTimeToPost: styleResult.bestTimeToPost,
            engagementTips: styleResult.engagementTips,
          };

          return post;
        } catch (error) {
          console.error(`Failed to generate ${postType} post:`, error);
          return null;
        }
      });

      const results = await Promise.all(postPromises);
      variations.push(
        ...results.filter((post): post is SocialPost => post !== null)
      );

      if (variations.length === 0) {
        throw new Error("Failed to generate any valid social posts");
      }

      // If regenerating, update the stored posts
      if (regenerate) {
        const { data: existingDemo } = await supabase
          .from("demos")
          .select("social_posts")
          .eq("id", demoId)
          .single();

        const existingPosts = (existingDemo?.social_posts || []) as any[];

        // Replace posts for this platform
        const updatedPosts = [
          ...existingPosts.filter((p: any) => p.platform !== platform),
          ...variations,
        ];

        await supabase
          .from("demos")
          .update({ social_posts: updatedPosts })
          .eq("id", demoId);
      }

      return res.status(200).json({
        success: true,
        posts: variations,
        platform,
      });
    } catch (error) {
      console.error("Error generating social posts:", error);
      return res.status(500).json({ error: "Failed to generate social posts" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
