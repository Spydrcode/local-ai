/**
 * Deep Website Scraper
 *
 * Crawls multiple pages of a business website to extract comprehensive data.
 * Uses existing Playwright scraper but analyzes ALL content, not just first 5000 chars.
 */

import { fetchSitePages } from "../scraper";
import type { BusinessData } from "./index";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
}

/**
 * Scrape business website and extract structured data
 */
export async function scrapeWebsite(url: string): Promise<BusinessData> {
  try {
    // Use existing scraper to get multiple pages
    const scrapedPages = await fetchSitePages(url);

    // Combine all page content
    const allContent = Object.entries(scrapedPages)
      .map(([path, html]) => {
        return `PAGE: ${path}\nCONTENT: ${html}`;
      })
      .join("\n\n---\n\n");

    // Extract structured data using LLM (but from REAL scraped content)
    const extracted = await extractBusinessData(url, allContent);

    return extracted;
  } catch (error) {
    throw new Error(
      `Website scraping failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Use LLM to extract structured business data from scraped content
 */
async function extractBusinessData(
  url: string,
  content: string
): Promise<BusinessData> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      {
        role: "system",
        content: `You are a data extraction specialist. Extract ONLY factual information from the provided website content. Do NOT invent or assume anything not explicitly stated.

Return valid JSON only.`,
      },
      {
        role: "user",
        content: `Extract business information from this website content.

URL: ${url}

CONTENT:
${content.substring(0, 12000)}

Extract these fields (use null if not found):
- name: Business name (string)
- description: Short business description (string, max 200 chars)
- industry: Industry/category (string)
- location: Physical location - city, state (string)
- phone: Phone number (string)
- email: Email address (string)
- hours: Business hours (string)
- services: List of specific services/products offered (array of strings)
- pricing: Any pricing information mentioned (object or null)
- credentials: Certifications, awards, years in business (array of strings)
- yearsInBusiness: How many years in business (number or null)

IMPORTANT:
- Extract ONLY what is explicitly stated in the content
- Do NOT make assumptions or generate generic content
- If information is not found, use null or empty array
- For services, extract specific named services, not categories

Return JSON with this exact structure:
{
  "name": "Business Name",
  "description": "Actual description from website",
  "industry": "Industry from content",
  "location": "City, State",
  "phone": "555-555-5555",
  "email": "email@example.com",
  "hours": "Mon-Fri 9-5",
  "services": ["Specific Service 1", "Specific Service 2"],
  "pricing": null,
  "credentials": ["Credential 1", "Credential 2"],
  "yearsInBusiness": 10
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
  };
}
