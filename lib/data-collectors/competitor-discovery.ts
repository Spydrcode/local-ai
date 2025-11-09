/**
 * Competitor Discovery
 *
 * Finds real competitors using:
 * 1. Google search for "[industry] in [location]"
 * 2. Scrape competitor websites
 * 3. Compare offerings and positioning
 *
 * This provides REAL competitive intelligence, not LLM hallucinations.
 */

import { fetchSitePages } from "../scraper";
import type { CompetitorData } from "./index";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CompetitorDiscoveryParams {
  businessName: string;
  industry?: string;
  location?: string;
  limit?: number;
}

/**
 * Find competitors through web search and scraping
 */
export async function findCompetitors(
  params: CompetitorDiscoveryParams
): Promise<CompetitorData[]> {
  const { businessName, industry, location, limit = 10 } = params;

  try {
    // Step 1: Search for competitors
    const searchQuery = buildSearchQuery(industry, location);
    console.log(`[CompetitorDiscovery] Searching: ${searchQuery}`);

    const competitorUrls = await searchForCompetitors(searchQuery, limit);

    if (competitorUrls.length === 0) {
      console.warn("[CompetitorDiscovery] No competitors found via search");
      return [];
    }

    console.log(
      `[CompetitorDiscovery] Found ${competitorUrls.length} potential competitors`
    );

    // Step 2: Scrape competitor websites (in parallel, with limit)
    const scrapePromises = competitorUrls
      .slice(0, Math.min(5, limit)) // Limit to 5 concurrent scrapes
      .map((url) => scrapeCompetitor(url, businessName));

    const competitors = await Promise.allSettled(scrapePromises);

    // Filter successful scrapes
    const validCompetitors = competitors
      .filter(
        (result): result is PromiseFulfilledResult<CompetitorData> =>
          result.status === "fulfilled" && result.value !== null
      )
      .map((result) => result.value);

    console.log(
      `[CompetitorDiscovery] Successfully analyzed ${validCompetitors.length} competitors`
    );

    return validCompetitors;
  } catch (error) {
    console.error("[CompetitorDiscovery] Error:", error);
    throw new Error(
      `Competitor discovery failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Build search query for finding competitors
 */
function buildSearchQuery(industry?: string, location?: string): string {
  const parts: string[] = [];

  if (industry) {
    parts.push(industry);
  } else {
    parts.push("business");
  }

  if (location) {
    parts.push(`in ${location}`);
  }

  return parts.join(" ");
}

/**
 * Search for competitors using web search
 *
 * NOTE: This is a simplified implementation using Google search scraping.
 * In production, use Google Custom Search API or SerpAPI for better results.
 */
async function searchForCompetitors(
  query: string,
  limit: number
): Promise<string[]> {
  try {
    // For MVP: Use basic Google search scraping
    // TODO: Replace with Google Custom Search API or SerpAPI for production

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`Search failed: HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract URLs from search results (basic regex)
    const urlRegex =
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    const matches = html.match(urlRegex) || [];

    // Filter out Google domains and duplicates
    const urls = matches
      .filter(
        (url) =>
          !url.includes("google.com") &&
          !url.includes("youtube.com") &&
          !url.includes("facebook.com") &&
          !url.includes("yelp.com") &&
          !url.includes("yellowpages.com")
      )
      .filter((url, index, self) => self.indexOf(url) === index) // Unique
      .slice(0, limit);

    return urls;
  } catch (error) {
    console.warn(
      "[CompetitorDiscovery] Search failed, returning empty results:",
      error
    );
    // Fallback: Return empty array instead of failing
    return [];
  }
}

/**
 * Scrape competitor website and analyze
 */
async function scrapeCompetitor(
  url: string,
  businessName: string
): Promise<CompetitorData | null> {
  try {
    console.log(`[CompetitorDiscovery] Scraping competitor: ${url}`);

    // Scrape competitor website
    const scrapedPages = await fetchSitePages(url);

    // Combine content from all pages
    const allContent = Object.entries(scrapedPages)
      .map(([path, html]) => `PAGE: ${path}\n${html}`)
      .join("\n\n")
      .substring(0, 10000);

    // Analyze competitor using LLM
    const analysis = await analyzeCompetitor(url, allContent, businessName);

    return analysis;
  } catch (error) {
    console.warn(`[CompetitorDiscovery] Failed to scrape ${url}:`, error);
    return null;
  }
}

/**
 * Analyze competitor data using LLM
 */
async function analyzeCompetitor(
  url: string,
  content: string,
  businessName: string
): Promise<CompetitorData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 1500,
    messages: [
      {
        role: "system",
        content: `You are analyzing a competitor website. Extract factual information and provide competitive insights.

Return valid JSON only.`,
      },
      {
        role: "user",
        content: `Analyze this competitor for ${businessName}.

URL: ${url}
CONTENT:
${content}

Extract:
1. name: Competitor business name
2. description: What they do (1-2 sentences from their actual content)
3. services: Specific services/products they offer (list)
4. pricing: Any pricing mentioned (object or null)
5. reviewCount: Estimate based on content (number, 0 if unknown)
6. averageRating: Estimate based on content (number 0-5, 0 if unknown)
7. strengths: What they appear to do well (3-5 points based on content)
8. weaknesses: Potential gaps or weaknesses (3-5 points)

Return JSON:
{
  "name": "Competitor Name",
  "description": "What they do",
  "services": ["Service 1", "Service 2"],
  "pricing": null,
  "reviewCount": 0,
  "averageRating": 0,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("No response from LLM");
  }

  const parsed = JSON.parse(result);

  return {
    ...parsed,
    website: url,
    services: parsed.services || [],
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
  };
}
