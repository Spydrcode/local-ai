import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";
import { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CompetitorData {
  name: string;
  url: string;
  offerings: string[];
  pricing: string[];
  differentiators: string[];
  strengths: string[];
  weaknesses: string[];
}

// Scrape website content
async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, footer, header").remove();

    // Extract text content
    const title = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    const h1 = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .join(" | ");
    const h2 = $("h2")
      .map((_, el) => $(el).text().trim())
      .get()
      .slice(0, 10)
      .join(" | ");
    const paragraphs = $("p")
      .map((_, el) => $(el).text().trim())
      .get()
      .slice(0, 20)
      .join(" ");

    // Look for pricing indicators
    const pricingText = $(
      '*:contains("$"), *:contains("price"), *:contains("pricing")'
    )
      .map((_, el) => $(el).text().trim())
      .get()
      .slice(0, 5)
      .join(" ");

    const content = `
Title: ${title}
Meta: ${metaDescription}
H1: ${h1}
H2: ${h2}
Content: ${paragraphs.slice(0, 1000)}
Pricing: ${pricingText.slice(0, 500)}
    `.trim();

    return content;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return "";
  }
}

// AI analysis of scraped competitor data
async function analyzeCompetitor(
  competitorUrl: string,
  scrapedContent: string,
  businessContext: string
): Promise<CompetitorData> {
  const prompt = `You are a competitive intelligence analyst. Analyze this competitor website and extract key information.

Business Context: ${businessContext}

Competitor URL: ${competitorUrl}
Website Content:
${scrapedContent.slice(0, 2000)}

Extract and return ONLY valid JSON with this structure:
{
  "name": "Company name",
  "offerings": ["Service 1", "Service 2", "Service 3"],
  "pricing": ["Pricing tier 1", "Pricing tier 2"] or ["Pricing not visible on website"],
  "differentiators": ["Unique selling point 1", "USP 2", "USP 3"],
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3"]
}

Be specific and factual. Focus on what makes them competitive.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a competitive intelligence analyst who extracts key business information from website content.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  const analysis = JSON.parse(content);

  return {
    url: competitorUrl,
    ...analysis,
  };
}

// Generate competitive gaps analysis
async function generateCompetitiveGaps(
  businessName: string,
  businessSummary: string,
  competitors: CompetitorData[]
): Promise<{
  gaps: string[];
  opportunities: string[];
  recommendations: string[];
}> {
  const competitorsText = competitors
    .map(
      (c) =>
        `${c.name}: Offerings: ${c.offerings.join(", ")}. Strengths: ${c.strengths.join(", ")}.`
    )
    .join("\n");

  const prompt = `You are a strategic business consultant analyzing competitive positioning.

Business: ${businessName}
Summary: ${businessSummary.slice(0, 300)}

Competitors Analysis:
${competitorsText}

Identify:
1. Market gaps - what competitors are missing that creates opportunities
2. Competitive opportunities - where this business can differentiate
3. Strategic recommendations - specific actions to gain competitive advantage

Return ONLY valid JSON:
{
  "gaps": ["Market gap 1", "Gap 2", "Gap 3"],
  "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a strategic business consultant specializing in competitive analysis and market positioning.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.75,
    max_tokens: 600,
  });

  const content = completion.choices[0].message.content;
  if (!content) {
    throw new Error("No content returned from OpenAI");
  }

  return JSON.parse(content);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { demoId } = req.query;
    const { competitorUrls } = req.body; // Array of competitor URLs

    if (!demoId || typeof demoId !== "string") {
      return res.status(400).json({ error: "Invalid demo ID" });
    }

    if (
      !competitorUrls ||
      !Array.isArray(competitorUrls) ||
      competitorUrls.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Provide competitor URLs as array" });
    }

    console.log(
      `🔍 Starting competitor research for demo ${demoId} with ${competitorUrls.length} competitors...`
    );

    // Fetch demo data
    const { data: demo, error: demoError } = await supabase
      .from("demos")
      .select("*")
      .eq("id", demoId)
      .single();

    if (demoError || !demo) {
      console.error("Error fetching demo:", demoError);
      return res.status(404).json({ error: "Demo not found" });
    }

    const businessContext = `${demo.business_name}: ${demo.summary?.slice(0, 200) || ""}`;

    // Scrape and analyze competitors (limit to 5)
    const competitorsToAnalyze = competitorUrls.slice(0, 5);
    const competitors: CompetitorData[] = [];

    for (const url of competitorsToAnalyze) {
      try {
        console.log(`📊 Scraping ${url}...`);
        const scrapedContent = await scrapeWebsite(url);

        if (scrapedContent) {
          console.log(`🤖 Analyzing ${url}...`);
          const analysis = await analyzeCompetitor(
            url,
            scrapedContent,
            businessContext
          );
          competitors.push(analysis);
        } else {
          // Fallback if scraping fails
          competitors.push({
            name: new URL(url).hostname.replace("www.", ""),
            url: url,
            offerings: ["Unable to scrape website"],
            pricing: ["Not available"],
            differentiators: ["Analysis unavailable"],
            strengths: ["Website scraping failed"],
            weaknesses: ["Analysis incomplete"],
          });
        }
      } catch (error) {
        console.error(`Error analyzing ${url}:`, error);
      }
    }

    // Generate competitive gaps analysis
    console.log(`🎯 Generating competitive gaps analysis...`);
    const gapsAnalysis = await generateCompetitiveGaps(
      demo.business_name || "this business",
      demo.summary || "",
      competitors
    );

    console.log(
      `✅ Competitor research complete: ${competitors.length} competitors analyzed`
    );

    return res.status(200).json({
      competitors,
      competitiveGaps: gapsAnalysis,
      analysisDate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in competitor research:", error);
    return res.status(500).json({
      error: "Failed to complete competitor research",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
