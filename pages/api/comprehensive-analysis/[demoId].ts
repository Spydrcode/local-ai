import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion } from "../../../lib/openai";
import { supabaseAdmin } from "../../../server/supabaseAdmin";

// SPEED OPTIMIZATION #2: In-memory cache for fast repeat requests (5-minute TTL)
const analysisCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  try {
    // Check cache first for instant responses on repeat requests
    const cacheKey = `analysis-${demoId}`;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Cache hit for demo ${demoId}`);
      return res.status(200).json(cached.data);
    }

    // Fetch demo data from Supabase
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const { data: demo, error } = await supabaseAdmin
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (error || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    const websiteUrl = demo.site_url || "https://example.com";
    const summary = demo.summary || "";
    const keyItems = demo.key_items || [];

    // Extract business name
    let businessName = "Business";
    if (summary) {
      const summaryMatch = summary.match(
        /^([A-Z][^.!?]*(?:BBQ|Coffee|Propane|Bakery|Restaurant|Cafe|Shop|Store|Services|Company|Business|Corp|LLC|Inc)[^.!?]*)/i
      );
      if (summaryMatch) {
        businessName = summaryMatch[1].trim();
      }
    }
    if (businessName === "Business" && websiteUrl) {
      const urlMatch = websiteUrl.match(/(?:https?:\/\/)?(?:www\.)?([^\/\.]+)/);
      if (urlMatch) {
        businessName = urlMatch[1]
          .split(/[-_]/)
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    // Generate ALL analyses in parallel using AI (NO MOCK DATA!)
    const [
      competitorAnalysis,
      brandAnalysis,
      conversionAnalysis,
      contentCalendar,
      websiteGrade,
      socialPosts,
      blogPosts,
    ] = await Promise.all([
      generateCompetitorAnalysis(summary, keyItems, businessName),
      generateBrandAnalysis(summary, keyItems, businessName),
      generateConversionAnalysis(summary, keyItems, businessName),
      generateContentCalendar(summary, keyItems, businessName),
      generateWebsiteGrade(summary, keyItems, businessName),
      generateSocialPosts(summary, keyItems, businessName),
      generateBlogPosts(summary, keyItems, businessName),
    ]);

    const comprehensiveAnalysis = {
      demoId,
      businessName,
      websiteUrl,
      competitorAnalysis,
      brandAnalysis,
      conversionAnalysis,
      contentCalendar,
      websiteGrade,
      socialPosts,
      blogPosts,
    };

    // Cache the result for future requests (prevents duplicate AI calls)
    analysisCache.set(cacheKey, {
      data: comprehensiveAnalysis,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (prevent memory leak)
    if (analysisCache.size > 100) {
      const firstKey = analysisCache.keys().next().value;
      if (firstKey) analysisCache.delete(firstKey);
    }

    return res.status(200).json(comprehensiveAnalysis);
  } catch (error) {
    console.error("Comprehensive analysis error:", error);
    return res.status(500).json({ error: "Analysis generation failed" });
  }
}

// ============================================================================
// AI GENERATION FUNCTIONS - Optimized for speed without sacrificing quality
// ============================================================================

async function generateCompetitorAnalysis(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  const prompt = `Competitive analysis for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Based on their SPECIFIC business type, location, and offerings, identify:
1. 3-5 realistic direct competitors (actual companies if possible, or realistic examples)
2. Market opportunities specific to THEIR niche

Return JSON:
{
  "competitors": [
    {
      "name": "Actual or realistic competitor name",
      "url": "domain.com (if known) or 'example.com'",
      "strengths": ["Specific strength relevant to this market", "Another strength"],
      "weaknesses": ["Specific weakness they can exploit", "Another weakness"]
    }
  ],
  "opportunities": [
    "Specific market opportunity for THIS business",
    "Another opportunity mentioning their products/services",
    "Opportunity based on their unique position"
  ]
}

CRITICAL: Reference their actual business type, products, or location in every competitor and opportunity.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a competitive intelligence analyst. Generate realistic, industry-specific competitor analysis using the actual business details provided.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 800, // Increased for detailed analysis
    jsonMode: true,
  });

  return JSON.parse(response);
}

async function generateBrandAnalysis(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  const prompt = `Brand voice and messaging analysis for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Based on THEIR specific business type, market position, and offerings, define:
1. Ideal brand tone (how they should sound)
2. Brand voice (their unique personality)
3. 3-5 key messaging pillars

Return JSON:
{
  "tone": "Specific tone description mentioning their industry/market",
  "voice": "Unique voice description referencing their position",
  "messaging": [
    "Key message #1 featuring their actual products/services",
    "Key message #2 about their unique value",
    "Key message #3 addressing their target market"
  ]
}

CRITICAL: Every element must be specific to THIS business - reference their actual offerings, market, or differentiators.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a brand strategist. Create highly specific brand voice and messaging tailored to the actual business details provided. Never give generic brand advice.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 600, // Increased for detailed messaging
    jsonMode: true,
  });

  return JSON.parse(response);
}

async function generateConversionAnalysis(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  const prompt = `Conversion optimization analysis for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Analyze THEIR specific customer journey and provide tailored recommendations:

1. Map their typical customer path (from discovery to conversion)
2. Identify 4-6 specific optimization opportunities
3. Project realistic conversion improvements

Return JSON:
{
  "currentPath": [
    "Step 1: How customers discover THIS business",
    "Step 2: Initial engagement (specific to their offerings)",
    "Step 3: Consideration phase actions",
    "Step 4: Conversion point for their business"
  ],
  "recommendations": [
    "Specific recommendation #1 using their actual products/services",
    "Recommendation #2 mentioning their business type/market",
    "Recommendation #3 tailored to their customer journey",
    "Recommendation #4 based on their offerings"
  ],
  "projectedImprovement": "Realistic percentage increase (20-40%) with SPECIFIC outcome mentioning their business/products"
}

CRITICAL: Reference their actual business, products, services, or market in every recommendation.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a conversion rate optimization specialist. Provide highly specific, actionable recommendations tailored to the actual business. Never give generic CRO advice.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 700, // Increased for detailed recommendations
    jsonMode: true,
  });

  return JSON.parse(response);
}

async function generateContentCalendar(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  try {
    const today = new Date();
    const getNextWeekDate = (dayOffset: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const prompt = `Create a 7-day social media content calendar for ${businessName} with SPECIFIC scheduling details:

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Create 7 posts with optimal timing and engagement strategies:

Return JSON:
[
  {
    "day": "Monday",
    "date": "${getNextWeekDate(1)}",
    "time": "9:00 AM",
    "content": "Engaging Monday post featuring their specific product/service",
    "platform": "Facebook",
    "hashtags": ["#MondayMotivation", "#BusinessSpecific", "#Local"],
    "postType": "Educational/Promotional/Behind-the-scenes",
    "engagement": "Ask question/Call-to-action/Share story"
  }
]

INCLUDE:
- Optimal posting times for each platform
- Mix of content types (educational, promotional, behind-the-scenes, customer stories)
- Platform-specific engagement strategies
- Business-specific hashtags and content

CRITICAL: Each post must mention their actual business name, products, services, or unique value.`;

    const response = await createChatCompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a social media content strategist. Create highly specific, engaging content that showcases the actual business's unique offerings. Never create generic social media posts.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
      maxTokens: 700,
      jsonMode: true,
    });

    const parsed = JSON.parse(response);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Content calendar generation failed:', error);
    const today = new Date();
    const getNextWeekDate = (dayOffset: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + dayOffset);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return [
      {
        day: "Monday",
        date: getNextWeekDate(1),
        time: "9:00 AM",
        content: `Start your week strong with ${businessName}! Here's what makes us different in the local market.`,
        platform: "Facebook",
        hashtags: ["#MondayMotivation", "#LocalBusiness", "#Community"],
        postType: "Motivational",
        engagement: "Ask followers about their Monday goals"
      },
      {
        day: "Tuesday",
        date: getNextWeekDate(2),
        time: "2:00 PM",
        content: `Behind the scenes at ${businessName}: Our team's commitment to excellence.`,
        platform: "Instagram",
        hashtags: ["#BehindTheScenes", "#TeamWork", "#Quality"],
        postType: "Behind-the-scenes",
        engagement: "Share a team photo or process video"
      },
      {
        day: "Wednesday",
        date: getNextWeekDate(3),
        time: "11:00 AM",
        content: `Midweek spotlight: See how ${businessName} delivers exceptional value to our customers.`,
        platform: "LinkedIn",
        hashtags: ["#WednesdayWisdom", "#CustomerFirst", "#BusinessValue"],
        postType: "Educational",
        engagement: "Share customer success story"
      },
      {
        day: "Thursday",
        date: getNextWeekDate(4),
        time: "3:00 PM",
        content: `Pro tip from ${businessName}: Here's how to get the most value from our services.`,
        platform: "Facebook",
        hashtags: ["#ThursdayTips", "#ProTips", "#ValueAdd"],
        postType: "Educational",
        engagement: "Ask for questions in comments"
      },
      {
        day: "Friday",
        date: getNextWeekDate(5),
        time: "4:00 PM",
        content: `Weekend ready! ${businessName} is here to help you make the most of your time.`,
        platform: "Instagram",
        hashtags: ["#WeekendReady", "#LocalSupport", "#Service"],
        postType: "Promotional",
        engagement: "Encourage weekend bookings or visits"
      },
      {
        day: "Saturday",
        date: getNextWeekDate(6),
        time: "10:00 AM",
        content: `Saturday special from ${businessName}: Perfect time to experience what we offer.`,
        platform: "Facebook",
        hashtags: ["#SaturdaySpecial", "#WeekendService", "#LocalChoice"],
        postType: "Promotional",
        engagement: "Highlight weekend availability or specials"
      },
      {
        day: "Sunday",
        date: getNextWeekDate(7),
        time: "6:00 PM",
        content: `Sunday reflection: Thank you to our community for choosing ${businessName}. Here's to another great week ahead!`,
        platform: "Instagram",
        hashtags: ["#SundayReflection", "#Grateful", "#Community"],
        postType: "Community",
        engagement: "Thank customers and build community"
      }
    ];
  }
}

async function generateWebsiteGrade(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  const prompt = `Analyze the website and digital presence for ${businessName} and provide a detailed, SPECIFIC assessment.

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Based on this SPECIFIC business, their industry, and their unique offerings:

1. Estimate a realistic website grade (score out of 100)
2. Provide 5 SPECIFIC improvements tailored to THIS business (not generic web advice)
3. Calculate realistic ROI projection based on THEIR market and offerings

Return JSON format:
{
  "score": 60-90,
  "improvements": [
    "Specific improvement #1 using their actual products/services",
    "Specific improvement #2 mentioning their actual business type",
    "Specific improvement #3 addressing their unique market",
    "Specific improvement #4 based on their offerings",
    "Specific improvement #5 tailored to their industry"
  ],
  "roiProjection": "Detailed ROI projection mentioning specific improvements and realistic timeframe for THIS business type"
}

CRITICAL: Every improvement and ROI projection must reference their ACTUAL business name, products, services, or industry. NO GENERIC ADVICE.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a web performance analyst. Provide highly specific, business-tailored grades and actionable improvements. Never give generic advice - always reference the actual business, their products, and their market.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 800, // Increased for more detailed, specific responses
    jsonMode: true,
  });

  return JSON.parse(response);
}

async function generateSocialPosts(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  const prompt = `4 social posts for ${businessName}:

FULL BUSINESS CONTEXT:
${summary}
KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

Create engaging posts with their specific offerings.

JSON:
[
  {"platform":"Facebook","content":"Post with emojis","emojis":"��💼"}
]

Include their actual products/services.`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a social media manager. Create engaging, business-specific posts.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    maxTokens: 700,
    jsonMode: true,
  });

  const parsed = JSON.parse(response);
  return Array.isArray(parsed) ? parsed : parsed.posts || [];
}

async function generateBlogPosts(
  summary: string,
  keyItems: string[],
  businessName: string
) {
  const prompt = `Generate 2 SEO-optimized blog post ideas for ${businessName}.

FULL BUSINESS CONTEXT:
${summary}

KEY PRODUCTS/SERVICES:
${keyItems.map((item, i) => `${i + 1}. ${item}`).join("\n")}

CRITICAL: Blog topics must be SPECIFIC to their industry, niche, and actual offerings. NO GENERIC "how to improve your business" topics.

Create detailed blog post outlines with:
- SEO-optimized titles featuring their specific niche/services
- 4-6 section outline tailored to their business
- 3-5 targeted keywords relevant to their industry

JSON format:
[
  {
    "title": "Industry-specific title with their actual service/product",
    "outline": [
      "Introduction to [specific problem their business solves]",
      "[Specific topic 1 related to their offerings]",
      "[Specific topic 2 showcasing their expertise]",
      "[Specific topic 3 with actionable advice]",
      "Conclusion with specific CTA"
    ],
    "keywords": ["industry keyword 1", "niche keyword 2", "service keyword 3"]
  }
]

Example for BBQ catering: "The Science Behind 14-Hour Smoked Brisket: Denver's Championship BBQ Techniques"
Example for coffee roaster: "Single-Origin vs. Blends: How Fresh Roasting Transforms Denver Coffee Culture"`;

  const response = await createChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a content marketing strategist specializing in niche-specific, SEO-optimized blog strategy. Create blog ideas that showcase the business's unique expertise and actual offerings, never generic business advice.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    maxTokens: 600,
    jsonMode: true,
  });

  return JSON.parse(response);
}
