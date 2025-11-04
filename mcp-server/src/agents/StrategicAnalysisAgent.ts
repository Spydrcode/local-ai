import { openai } from "../config/openai.js";
import { scrapeWebsite } from "../tools/WebScraperTool.js";
import { analyzeCompetitors } from "../tools/CompetitorResearchTool.js";
import { analyzeSEO } from "../tools/SEOAnalyzerTool.js";

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

/**
 * Generates a hybrid Porter-Blue Ocean strategic analysis
 * Uses only website content, no external data sources required
 */
export async function analyzeStrategy(
  websiteUrl: string,
  businessName?: string
): Promise<PorterBlueOceanAnalysis> {
  // Scrape website content
  const scraped = await scrapeWebsite(websiteUrl);
  if (scraped.error) {
    throw new Error(`Failed to scrape website: ${scraped.error}`);
  }
  
  const websiteContent = scraped.content;
  const name = businessName || scraped.title || "Business";
  
  // Get competitor insights
  const competitors = await analyzeCompetitors(name);
  
  const prompt = `You are a strategic business consultant specializing in Porter's Five Forces and Blue Ocean Strategy for small businesses.

Competitor Context:
- Common practices: ${competitors.commonPractices.join(', ')}
- Market gaps: ${competitors.marketGaps.join(', ')}
- Differentiation opportunities: ${competitors.differentiationOpportunities.join(', ')}

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

Website: ${websiteUrl}
Business: ${name}

Website Content:
${websiteContent.substring(0, 4000)}

Provide strategic analysis that is:
- Specific to small businesses (not enterprise-focused)
- Actionable with clear next steps
- Focused on creating differentiation and value
- Realistic given small business resource constraints
- Written in plain language (avoid jargon)

IMPORTANT: Respond with ONLY valid JSON, no markdown formatting or code blocks. Use this exact structure:
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

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a strategic business consultant. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse and validate the response
    const analysis = JSON.parse(content) as PorterBlueOceanAnalysis;

    // Ensure all required fields are present
    if (
      !analysis.competitiveForces ||
      !analysis.blueOceanOpportunities ||
      !analysis.actionPlan ||
      !analysis.positioning ||
      !analysis.marketOpportunities
    ) {
      throw new Error("Incomplete analysis response");
    }

    return analysis;
  } catch (error) {
    console.error("Error in strategic analysis:", error);
    throw new Error(
      `Failed to generate strategic analysis: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generates SWOT analysis from website content
 */
export async function generateSWOT(
  websiteUrl: string,
  businessName?: string
): Promise<{
  businessName: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}> {
  // Scrape website content
  const scraped = await scrapeWebsite(websiteUrl);
  if (scraped.error) {
    throw new Error(`Failed to scrape website: ${scraped.error}`);
  }
  
  const websiteContent = scraped.content;
  const name = businessName || scraped.title || "Business";
  
  const prompt = `Analyze this small business website and generate a SWOT analysis.

Business: ${name}
Website Content: ${websiteContent.substring(0, 2000)}

Provide:
- 4-5 Strengths (internal positive attributes)
- 4-5 Weaknesses (internal limitations)
- 4-5 Opportunities (external favorable conditions)
- 4-5 Threats (external challenges)

Make it specific to THIS business, not generic. Focus on what you can observe from their website.

Respond with ONLY valid JSON:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "opportunities": ["opportunity 1", "opportunity 2", ...],
  "threats": ["threat 1", "threat 2", ...]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a business analyst. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    return { ...result, businessName: name };
  } catch (error) {
    console.error("Error in SWOT analysis:", error);
    throw new Error(
      `Failed to generate SWOT analysis: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Generates quick wins for immediate implementation
 */
export async function generateQuickWins(
  websiteUrl: string,
  businessName?: string
): Promise<{
  businessName: string;
  wins: Array<{
    title: string;
    description: string;
    impact: string;
    effort: string;
    timeframe: string;
  }>;
}> {
  // Scrape website content
  const scraped = await scrapeWebsite(websiteUrl);
  if (scraped.error) {
    throw new Error(`Failed to scrape website: ${scraped.error}`);
  }
  
  const websiteContent = scraped.content;
  const name = businessName || scraped.title || "Business";
  
  // Analyze SEO
  const seo = analyzeSEO(scraped.content, scraped.title, scraped.description);
  
  const prompt = `Analyze this business website and identify 5 quick wins they can implement THIS WEEK.

SEO Analysis:
- Content issues: ${seo.contentIssues.join(', ')}
- Recommendations: ${seo.recommendations.join(', ')}
- Top keywords: ${seo.keywords.slice(0, 5).join(', ')}

Business: ${name}
Website Content: ${websiteContent.substring(0, 2000)}

For each quick win, provide:
- Title: Short, action-oriented name
- Description: What to do (be specific)
- Impact: Expected business impact (high/medium/low)
- Effort: Required effort (low/medium/high)
- Timeframe: How long it takes (e.g., "2 hours", "1 day")

Focus on:
- Website improvements
- Content updates
- SEO quick fixes
- Customer experience enhancements
- Conversion optimization

Respond with ONLY valid JSON:
{
  "wins": [
    {
      "title": "Quick Win Title",
      "description": "Specific action to take",
      "impact": "high",
      "effort": "low",
      "timeframe": "2 hours"
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a business consultant. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error in quick wins generation:", error);
    throw new Error(
      `Failed to generate quick wins: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
