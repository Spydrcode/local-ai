import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion } from "../../lib/openai";
import { HOMEPAGE_BLUEPRINT_PROMPT } from "../../lib/prompts";
import { supabaseAdmin } from "../../server/supabaseAdmin";

// Ensure this route is handled by the API
export const config = {
  api: {
    bodyParser: true,
  },
};

interface DemoHomepageMock {
  hero: {
    headline: string;
    subheadline: string;
    ctaLabel: string;
    backgroundIdea: string;
  };
  sections: Array<{
    title: string;
    body: string;
    ctaLabel?: string;
  }>;
  style: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    tone: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("🎨 Generate mockup endpoint hit:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.body;
  console.log("📦 DemoId:", demoId);

  if (!demoId) {
    return res.status(400).json({ error: "demoId is required" });
  }

  try {
    // Fetch demo data
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

    // Return homepage blueprint if it exists
    if (demo.homepage_blueprint) {
      console.log("✅ Homepage blueprint already exists, returning it");
      return res.status(200).json({
        success: true,
        mockup: demo.homepage_blueprint,
        redirectUrl: `/demo/${demoId}?tab=preview`,
      });
    }

    // Generate homepage blueprint if it doesn't exist
    console.log("🔨 Homepage blueprint doesn't exist, generating now...");

    // Check if we have summary
    if (!demo.summary) {
      return res.status(400).json({
        error:
          "Site analysis required first. Please run site analysis before generating mockup.",
      });
    }

    // Generate homepage blueprint
    const contextPrompt = `Analyze this business and create a custom homepage blueprint.

BUSINESS INTELLIGENCE:
${demo.summary}

Business Name: ${demo.client_id || "Unknown Business"}
Website: ${demo.site_url}
Industry: ${demo.industry || "Unknown"}

DESIGN REQUIREMENTS:
1. Identify their EXACT business sub-category
2. Design hero that highlights their UNIQUE differentiator
3. Choose colors that match successful businesses in their SPECIFIC niche
4. Create 5-7 sections unmistakably for THIS type of business
5. Every section must reference their actual offerings or specialization

Return as JSON with structure:
{
  "hero": {
    "headline": "Compelling headline featuring their unique differentiator",
    "subheadline": "Specific value proposition",
    "ctaLabel": "Action-oriented CTA",
    "backgroundIdea": "Description of hero image"
  },
  "sections": [
    {
      "title": "Section title",
      "body": "Section content",
      "ctaLabel": "Optional CTA"
    }
  ],
  "style": {
    "primaryColor": "#hexcolor",
    "secondaryColor": "#hexcolor",
    "accentColor": "#hexcolor",
    "tone": "Brand voice description"
  }
}`;

    const response = await createChatCompletion({
      messages: [
        { role: "system", content: HOMEPAGE_BLUEPRINT_PROMPT },
        { role: "user", content: contextPrompt },
      ],
      temperature: 0.8,
      maxTokens: 2500,
      jsonMode: true,
    });

    const parsed = JSON.parse(response);

    const homepage: DemoHomepageMock = {
      hero: {
        headline: parsed.hero.headline,
        subheadline: parsed.hero.subheadline,
        ctaLabel: parsed.hero.ctaLabel || "Get Started",
        backgroundIdea: parsed.hero.backgroundIdea || "Hero image",
      },
      sections: (parsed.sections || []).slice(0, 6).map((section: any) => ({
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

    // Save homepage blueprint to database
    const { error: updateError } = await supabaseAdmin
      .from("demos")
      .update({
        homepage_blueprint: homepage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    if (updateError) {
      console.error("Failed to save homepage blueprint:", updateError);
      // Don't fail the request, just log the error
    }

    console.log("✅ Homepage blueprint generated successfully");

    return res.status(200).json({
      success: true,
      mockup: homepage,
      redirectUrl: `/demo/${demoId}?tab=preview`,
    });
  } catch (error) {
    console.error("Generate mockup error:", error);
    return res.status(500).json({
      error: "Failed to generate mockup",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
