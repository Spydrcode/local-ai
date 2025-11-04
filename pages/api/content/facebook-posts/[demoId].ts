import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Site Analysis Agent logic (adapted from MCP server)
const SITE_ANALYSIS_PROMPT = `You are an expert business analyst specializing in website analysis and business intelligence extraction.

Your task is to analyze the provided website content and extract SPECIFIC, DETAILED business information.

MANDATORY EXTRACTION REQUIREMENTS:

1. EXACT Business Type & Sub-Niche:
   - Don't just say "restaurant" - specify "Tex-Mex BBQ restaurant specializing in slow-smoked brisket and authentic regional sides"
   - Don't just say "HVAC company" - specify "Residential propane delivery and tank maintenance service for rural properties"
   - Identify the PRECISE sub-category within their industry

2. Core Services (3-5 specific offerings):
   - Extract the ACTUAL services mentioned, not generic descriptions
   - Include unique methods, techniques, or approaches they use
   - Note any specialty services or certifications

3. Target Audience & Geographic Focus:
   - WHO specifically do they serve? (homeowners, businesses, specific demographics)
   - WHERE do they operate? (city, region, radius)
   - Any niche markets they focus on?

4. Unique Value Propositions (2-4 differentiators):
   - What makes them DIFFERENT from competitors?
   - Special processes, guarantees, or approaches
   - Awards, certifications, years in business, family-owned status
   - Technology or equipment advantages

5. Brand Voice & Positioning:
   - Professional, friendly, luxury, budget-friendly, technical, approachable?
   - How do they describe themselves?
   - Any specific brand promises or taglines?

6. Evidence of Expertise:
   - Years in business
   - Team size or certifications
   - Client testimonials themes
   - Case studies or portfolio items

OUTPUT FORMAT (3-4 detailed paragraphs):

Paragraph 1: Business identity, exact sub-niche, geographic area
Paragraph 2: Core services with specific details about their approach
Paragraph 3: Key differentiators and unique value propositions
Paragraph 4: Brand positioning and evidence of expertise

EXAMPLES OF GOOD VS BAD:

BAD: "Bob's BBQ is a restaurant serving barbecue in Texas. They offer various meats and sides."

GOOD: "Bob's Texas Smokehouse is a family-owned Tex-Mex BBQ restaurant in Austin, specializing in 14-hour slow-smoked brisket using post oak wood and authentic Central Texas dry rub techniques. They serve the greater Austin metro area with both dine-in and catering services for events up to 500 people."

Return your analysis as a JSON object with this structure:
{
  "businessName": "Exact business name",
  "subNiche": "Precise sub-category description",
  "location": "Geographic area served",
  "coreServices": ["Service 1 with details", "Service 2 with details", ...],
  "targetAudience": "Specific customer segments",
  "differentiators": ["Unique aspect 1", "Unique aspect 2", ...],
  "brandVoice": "Tone and positioning",
  "expertise": "Evidence of credibility",
  "summary": "3-4 paragraph detailed summary as described above"
}`;

interface SiteAnalysisResult {
  businessName: string;
  subNiche: string;
  location: string;
  coreServices: string[];
  targetAudience: string;
  differentiators: string[];
  brandVoice: string;
  expertise: string;
  summary: string;
}

async function analyzeSiteContent(
  scrapedHtml: any,
  businessName: string,
  url: string
): Promise<SiteAnalysisResult> {
  try {
    // Extract text content from scraped HTML
    let contentText = "";
    if (scrapedHtml && typeof scrapedHtml === "object") {
      // Combine content from different pages
      const pages = ["/", "/about", "/services", "/pricing"];
      for (const page of pages) {
        if (scrapedHtml[page]) {
          // Simple HTML text extraction (remove tags)
          contentText +=
            scrapedHtml[page].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ") +
            " ";
        }
      }
    }

    if (!contentText.trim()) {
      // Fallback if no scraped content
      contentText = `Business: ${businessName}, Website: ${url}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.75,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: SITE_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: `Analyze this website content and extract detailed business information:

Website URL: ${url}
Business Name: ${businessName}

Content from website:
${contentText.slice(0, 3000)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content) as SiteAnalysisResult;
  } catch (error) {
    throw new Error(
      `Site analysis failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  try {
    const { data: demo } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();
    if (!demo) return res.status(404).json({ error: "Demo not found" });

    // Get detailed business analysis using the site analysis agent
    const detailedAnalysis = await analyzeSiteContent(
      demo.scraped_html,
      demo.business_name || demo.client_id,
      demo.site_url
    );

    // Create comprehensive business info for content generation
    const businessInfo = `${detailedAnalysis.summary}

Key Details:
- Business: ${detailedAnalysis.businessName}
- Sub-niche: ${detailedAnalysis.subNiche}
- Location: ${detailedAnalysis.location}
- Target Audience: ${detailedAnalysis.targetAudience}
- Brand Voice: ${detailedAnalysis.brandVoice}
- Expertise: ${detailedAnalysis.expertise}

Core Services: ${detailedAnalysis.coreServices.join(", ")}

Differentiators: ${detailedAnalysis.differentiators.join(", ")}

This business serves ${detailedAnalysis.targetAudience} in ${detailedAnalysis.location}, specializing in ${detailedAnalysis.subNiche}. They differentiate themselves through: ${detailedAnalysis.differentiators.join(", ")}. Their brand voice is ${detailedAnalysis.brandVoice}, and they have ${detailedAnalysis.expertise}.`;

    const prompt = `Generate 10 professional Facebook posts for this business that are ready to copy and paste.

${businessInfo}

Each post should be:
- Engaging and professional
- Include relevant emojis (2-4 per post)
- Have a clear call-to-action
- Be 100-150 words long
- Include hashtags (3-5 relevant ones)
- End with a question to encourage comments
- Use storytelling or value-driven content

Return JSON object with an array of formatted posts as strings:
{
  "posts": [
    "🤔 [Hook question or statement with emoji]\\n\\n[2-3 paragraphs of engaging content with value proposition]\\n\\n[Clear call-to-action with emoji]\\n\\n[3-5 relevant hashtags]\\n\\n💬 What do you think? Share your thoughts below!",
    "..."
  ]
}

Make each post unique and tailored to this specific business. Focus on building community, providing value, and driving engagement. Do NOT return variants or test hypotheses - just the formatted post strings.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0].message.content || "{}";
    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { posts: [] };
    }

    const posts = result.posts || [];

    // Format posts for easy copy-paste if they're not already formatted
    const formattedPosts = Array.isArray(posts)
      ? posts.map((post: any, index: number) => {
          if (typeof post === "string") {
            return {
              id: `post_${index + 1}`,
              type: "Facebook Post",
              formatted_content: post,
              raw_data: post,
            };
          } else if (post.variant_a) {
            // Handle variant format if returned
            return {
              id: `post_${index + 1}`,
              type: post.type || "Facebook Post",
              formatted_content: `${post.variant_a.content}\n\n${post.variant_a.cta}\n\n#FacebookMarketing #BusinessGrowth #EngageWithUs`,
              raw_data: post.variant_a,
            };
          } else {
            return {
              id: `post_${index + 1}`,
              type: "Facebook Post",
              formatted_content: JSON.stringify(post, null, 2),
              raw_data: post,
            };
          }
        })
      : [];

    return res.status(200).json({
      success: true,
      data: {
        posts: formattedPosts,
        summary: `Generated ${formattedPosts.length} Facebook posts ready to copy and paste.`,
      },
    });
  } catch (err) {
    console.error("Facebook posts error:", err);
    return res.status(500).json({
      error: "Failed to generate posts",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
