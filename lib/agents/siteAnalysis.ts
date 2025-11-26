import OpenAI from "openai";
import { AgenticRAG } from "../rag/agentic-rag";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  description?: string;
}

async function scrapeWebsite(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "ForecastaAI-Bot/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    const descMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
    );
    const description = descMatch ? descMatch[1].trim() : undefined;

    let cleanHtml = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    const content = cleanHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return { url, title, content: content.substring(0, 10000), description };
  } catch (error) {
    console.error(`Scrape failed for ${url}:`, error);
    return { url, title: "", content: "", description: undefined };
  }
}

export interface SiteAnalysisResult {
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

export async function analyzeSite(
  url: string,
  demoId?: string
): Promise<SiteAnalysisResult> {
  const scraped = await scrapeWebsite(url);

  let contextData = "";
  if (demoId) {
    const rag = new AgenticRAG();
    const ragResult = await rag
      .query({
        query: `business analysis for ${url}`,
        demoId,
      })
      .catch(() => null);

    if (ragResult?.sources.length) {
      contextData = `\n\nPREVIOUS ANALYSIS:\n${ragResult.sources.map((s) => s.content).join("\n")}`;
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `You are analyzing a local business website to extract DETAILED, SPECIFIC information.

**CRITICAL**: Be exhaustive and specific. Identify the exact sub-niche, not generic categories.

Extract:
1. **EXACT BUSINESS CLASSIFICATION**: Specific sub-niche (e.g., "Texas-style BBQ catering with competition-grade meats" NOT "restaurant")
2. **UNIQUE DIFFERENTIATORS**: Specializations, credentials, service models, quality markers
3. **ACTUAL PRODUCTS/SERVICES**: List by NAME with details, pricing if mentioned
4. **TARGET CUSTOMER**: Specific WHO they serve (e.g., "families and corporate event clients" NOT "local customers")
5. **BUSINESS INTELLIGENCE**: Location, hours, contact methods, years in business, credentials
6. **TONE & VOICE**: How they speak - word choice, personality, repeated phrases

Return valid JSON only.`,
      },
      {
        role: "user",
        content: `Analyze this website and extract detailed business information.

URL: ${url}
Title: ${scraped.title}
Description: ${scraped.description || "N/A"}
Content: ${scraped.content.substring(0, 5000)}${contextData}

Return JSON with these exact fields:
- businessName: string
- subNiche: string (SPECIFIC sub-niche, not generic category)
- location: string (city, state, service area)
- coreServices: array of strings (actual named products/services with details)
- targetAudience: string (specific customer segments)
- differentiators: array of strings (what makes them unique)
- brandVoice: string (tone and personality)
- expertise: string (credentials, years, awards, certifications)
- summary: string (3-4 detailed paragraphs covering all the above)`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return JSON.parse(content) as SiteAnalysisResult;
}
