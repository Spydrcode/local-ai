import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchSitePages } from "../../lib/scraper";
import { createAICompletion } from "../../lib/unified-ai-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PorterBlueOceanAnalysis {
  // Porter's Five Forces (Competitive Analysis)
  competitiveForces: {
    rivalryIntensity: string;
    buyerPower: string;
    supplierPower: string;
    threatOfNewEntrants: string;
    threatOfSubstitutes: string;
    strategicPosition: string;
  };

  // Blue Ocean Strategy (Value Innovation)
  blueOceanOpportunities: {
    eliminateFactors: string[];
    reduceFactors: string[];
    raiseFactors: string[];
    createFactors: string[];
    valueProposition: string;
  };

  // Small Business Action Plan
  actionPlan: {
    quickWins: string[];
    mediumTermMoves: string[];
    longTermStrategy: string[];
    weeklyActions: string[];
  };

  // Competitive Positioning
  positioning: {
    currentPosition: string;
    targetPosition: string;
    differentiators: string[];
    competitiveAdvantages: string[];
  };

  // Market Creation Opportunities
  marketOpportunities: {
    uncontestedSpace: string;
    customerPainPoints: string[];
    innovationAreas: string[];
    pricingStrategy: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { demoId } = req.query;

  if (!demoId || typeof demoId !== "string") {
    return res.status(400).json({ error: "Demo ID is required" });
  }

  try {
    // Get demo data
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      return res.status(404).json({ error: "Demo not found" });
    }

    // Scrape website content if not already done
    let siteContent = demo.site_content;
    if (!siteContent && demo.site_url) {
      const pages = await fetchSitePages(demo.site_url);
      siteContent = Object.values(pages).join("\n\n");
      // Update demo with scraped content
      await supabase
        .from("demos")
        .update({ site_content: siteContent })
        .eq("id", demoId);
    }

    const prompt = `You are a strategic business consultant specializing in Porter's Five Forces and Blue Ocean Strategy for small businesses.

Analyze this business website and provide:

1. PORTER'S FIVE FORCES ANALYSIS (Competitive Reality)
- Assess competitive rivalry intensity in their market
- Evaluate buyer power (customer bargaining position)
- Evaluate supplier power (vendor dependencies)
- Assess threat of new market entrants
- Assess threat of substitute products/services
- Determine their current strategic position

2. BLUE OCEAN STRATEGY (Value Innovation)
Using the Four Actions Framework, identify:
- ELIMINATE: What industry factors should they eliminate that competitors take for granted?
- REDUCE: What factors should they reduce below industry standards?
- RAISE: What factors should they raise above industry standards?
- CREATE: What new factors should they create that the industry has never offered?
- Define their unique value proposition for uncontested market space

3. COMPETITIVE POSITIONING (Where They Stand)
- Current market position
- Target ideal position
- Key differentiators from competitors
- Sustainable competitive advantages

4. MARKET CREATION OPPORTUNITIES (Blue Ocean Spaces)
- Identify uncontested market spaces they could create
- Customer pain points not being addressed by competitors
- Innovation areas for value creation
- Recommended pricing strategy

5. SMALL BUSINESS ACTION PLAN (Executable Strategy)
- 3 Quick Wins (implement this week)
- 3 Medium-Term Moves (30-90 days)
- 2 Long-Term Strategy shifts (6-12 months)
- Weekly action checklist

Website: ${demo.site_url}
Business: ${demo.key_items?.[0] || "Unknown"}

Website Content:
${siteContent?.substring(0, 4000) || "No content available"}

Provide strategic analysis that is:
- Specific to small businesses (not enterprise-focused)
- Actionable with clear next steps
- Focused on creating differentiation and value
- Realistic given small business resource constraints
- Written in plain language (avoid jargon)

Format as JSON with this exact structure:
{
  "competitiveForces": {
    "rivalryIntensity": "assessment",
    "buyerPower": "assessment",
    "supplierPower": "assessment",
    "threatOfNewEntrants": "assessment",
    "threatOfSubstitutes": "assessment",
    "strategicPosition": "overall position"
  },
  "blueOceanOpportunities": {
    "eliminateFactors": ["factor 1", "factor 2"],
    "reduceFactors": ["factor 1", "factor 2"],
    "raiseFactors": ["factor 1", "factor 2"],
    "createFactors": ["factor 1", "factor 2"],
    "valueProposition": "unique value proposition"
  },
  "positioning": {
    "currentPosition": "where they are now",
    "targetPosition": "where they should be",
    "differentiators": ["differentiator 1", "differentiator 2"],
    "competitiveAdvantages": ["advantage 1", "advantage 2"]
  },
  "marketOpportunities": {
    "uncontestedSpace": "blue ocean opportunity",
    "customerPainPoints": ["pain 1", "pain 2"],
    "innovationAreas": ["area 1", "area 2"],
    "pricingStrategy": "recommended approach"
  },
  "actionPlan": {
    "quickWins": ["action 1", "action 2", "action 3"],
    "mediumTermMoves": ["move 1", "move 2", "move 3"],
    "longTermStrategy": ["strategy 1", "strategy 2"],
    "weeklyActions": ["action 1", "action 2", "action 3"]
  }
}`;

    const aiResponse = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a strategic business consultant specializing in Porters Five Forces and Blue Ocean Strategy for small businesses.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 3000,
      jsonMode: true,
    });

    let analysis: PorterBlueOceanAnalysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (e) {
      throw new Error("AI response was not valid JSON.");
    }

    // Store analysis in database
    await supabase
      .from("demos")
      .update({
        hybrid_strategy: analysis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", demoId);

    res.json(analysis);
  } catch (error) {
    console.error("Hybrid strategy analysis error:", error);
    res.status(500).json({
      error: "Failed to generate strategic analysis",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
