/**
 * Competitive Intelligence System
 *
 * Gathers and analyzes competitor data to provide actionable insights
 */

import { load } from "cheerio";
import type { NextApiRequest, NextApiResponse } from "next";
import { createChatCompletion } from "../../lib/openai";

const COMPETITIVE_INTELLIGENCE_PROMPT = `You are a competitive intelligence analyst specializing in small business market analysis.

Your task is to analyze competitor data and provide actionable intelligence for strategic decision-making.

COMPETITIVE INTELLIGENCE FRAMEWORK:

1. COMPETITOR PROFILE
   For each competitor, identify:
   - Business model (franchise, independent, chain)
   - Geographic coverage (local, regional, national)
   - Target market segment
   - Pricing strategy (premium, mid-market, budget)
   - Unique value propositions
   - Estimated size/scale

2. COMPETITIVE ADVANTAGES ANALYSIS
   What advantages does each competitor have?
   - Location advantages
   - Brand strength
   - Technology/systems
   - Relationships/partnerships
   - Resources/capabilities
   - Experience/expertise

3. COMPETITIVE WEAKNESSES
   What vulnerabilities can be exploited?
   - Service gaps
   - Negative reviews/complaints
   - Outdated technology
   - Poor customer experience
   - Limited offerings
   - Weak online presence

4. MARKET POSITIONING MAP
   Plot competitors on two key dimensions:
   - Price vs Quality
   - Specialization vs Breadth
   - Speed vs Thoroughness
   - Personal vs Professional
   (Choose dimensions relevant to industry)

5. DIFFERENTIATION OPPORTUNITIES
   Based on competitor analysis:
   - Underserved segments
   - Unmet customer needs
   - Service/product gaps
   - Positioning white space
   - Emerging trends competitors miss

6. THREAT ASSESSMENT
   Rank competitors by threat level:
   - CRITICAL: Direct threat with strong position
   - HIGH: Significant overlap, growing presence
   - MODERATE: Some overlap, stable presence
   - LOW: Minimal overlap or declining

7. STRATEGIC RECOMMENDATIONS
   Specific actions to gain competitive advantage:
   - Head-to-head: Where to directly compete
   - Avoid: Where competitors are too strong
   - Flank: Underserved segments to target
   - Innovate: New offerings to differentiate
   - Partner: Potential collaboration opportunities

OUTPUT REQUIREMENTS:

Competitor Matrix:
| Competitor | Strengths | Weaknesses | Threat Level | Counter-Strategy |

Market Gap Analysis:
- 3-5 specific unmet needs in the market
- Customer segments being underserved
- Service/product opportunities

Competitive Advantages to Build:
- What makes you different RIGHT NOW
- What advantages to develop NEXT (3-6 months)
- What capabilities to build LONG-TERM (6-12 months)

Quick Wins (30-60 days):
- Specific actions to gain immediate advantage
- Low-cost, high-impact moves
- Measurable outcomes

Be SPECIFIC and ACTIONABLE. Focus on:
- Observable facts about competitors
- Realistic opportunities given resources
- Measurable actions with clear ROI
- Strategic moves, not generic advice`;

export interface CompetitorProfile {
  name: string;
  url: string;
  businessModel: string;
  pricing: "PREMIUM" | "MID_MARKET" | "BUDGET";
  strengths: string[];
  weaknesses: string[];
  threatLevel: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  counterStrategy: string;
}

export interface CompetitiveIntelligence {
  competitors: CompetitorProfile[];
  marketGaps: string[];
  underservedSegments: string[];
  advantagesToBuild: {
    current: string[];
    next: string[];
    longTerm: string[];
  };
  quickWins: Array<{
    action: string;
    timeline: string;
    expectedOutcome: string;
  }>;
}

/**
 * Scrapes and analyzes competitor websites
 */
async function scrapeCompetitor(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Remove scripts and styles
    $("script, style, noscript").remove();

    // Extract key information
    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr("content") || "";
    const headings = $("h1, h2, h3")
      .map((_, el) => $(el).text().trim())
      .get();
    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 3000);

    // Extract pricing indicators
    const priceText = $("body").text().toLowerCase();
    const hasPricing =
      priceText.includes("$") ||
      priceText.includes("price") ||
      priceText.includes("cost");
    const priceMatches = priceText.match(/\$\d+(?:,\d{3})*(?:\.\d{2})?/g);

    // Extract contact info
    const phone = $('a[href^="tel:"]').attr("href") || "";
    const email = $('a[href^="mailto:"]').attr("href") || "";

    // Extract services
    const serviceKeywords = [
      "service",
      "offer",
      "provide",
      "we do",
      "specializ",
    ];
    const services = headings.filter((h) =>
      serviceKeywords.some((kw) => h.toLowerCase().includes(kw))
    );

    return {
      url,
      title,
      description,
      headings: headings.slice(0, 10),
      summary: bodyText,
      hasPricing,
      estimatedPriceRange: priceMatches?.slice(0, 5) || [],
      phone,
      email,
      services,
      wordCount: bodyText.split(" ").length,
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}:`, error);
    return {
      url,
      error: error instanceof Error ? error.message : "Scraping failed",
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { businessContext, competitorUrls } = req.body;

  if (!businessContext) {
    return res.status(400).json({ error: "businessContext is required" });
  }

  try {
    let competitorData: any[] = [];

    // Scrape competitor websites if URLs provided
    if (
      competitorUrls &&
      Array.isArray(competitorUrls) &&
      competitorUrls.length > 0
    ) {
      console.log(`Scraping ${competitorUrls.length} competitor websites...`);
      competitorData = await Promise.all(
        competitorUrls.slice(0, 5).map((url) => scrapeCompetitor(url))
      );
    }

    // Generate competitive intelligence
    const competitorContext =
      competitorData.length > 0
        ? `\n\nCOMPETITOR DATA:\n${competitorData
            .map(
              (c, i) =>
                `\nCompetitor ${i + 1}: ${c.url}
Title: ${c.title || "Unknown"}
Description: ${c.description || "N/A"}
Services: ${c.services?.join(", ") || "N/A"}
Pricing visible: ${c.hasPricing ? "Yes" : "No"}
Price range: ${c.estimatedPriceRange?.join(", ") || "Unknown"}
Key headings: ${c.headings?.slice(0, 5).join(", ") || "N/A"}`
            )
            .join("\n")}`
        : "\n\nNote: No competitor URLs provided. Provide general industry competitive analysis.";

    const intelligence = await createChatCompletion({
      messages: [
        { role: "system", content: COMPETITIVE_INTELLIGENCE_PROMPT },
        {
          role: "user",
          content: `Analyze competitive landscape:\n\nBUSINESS CONTEXT:\n${businessContext}${competitorContext}\n\nProvide comprehensive competitive intelligence with actionable recommendations.`,
        },
      ],
      temperature: 0.7,
      maxTokens: 2500,
    });

    return res.status(200).json({
      success: true,
      competitorDataGathered: competitorData.length,
      competitorInsights: competitorData,
      intelligence,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Competitive intelligence error:", error);
    return res.status(500).json({
      error: "Intelligence gathering failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
