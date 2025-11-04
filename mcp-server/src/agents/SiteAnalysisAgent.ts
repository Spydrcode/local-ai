import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  openai,
} from "../config/openai.js";
import { scrapeWebsite } from "../tools/WebScraperTool.js";

/**
 * SiteAnalysisAgent
 *
 * Analyzes website content to extract business details, services, and unique value propositions.
 * Uses the enhanced SITE_SUMMARY_PROMPT for detailed extraction.
 */

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

/**
 * Analyzes a website URL and extracts detailed business information
 */
export async function analyzeSite(url: string): Promise<SiteAnalysisResult> {
  try {
    // Scrape website content
    const scraped = await scrapeWebsite(url);
    if (scraped.error) {
      throw new Error(`Failed to scrape website: ${scraped.error}`);
    }

    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      temperature: DEFAULT_TEMPERATURE,
      max_tokens: 1500,
      messages: [
        {
          role: "system",
          content: SITE_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: `Analyze this website and extract detailed business information.

Website URL: ${url}
Website Title: ${scraped.title}
Meta Description: ${scraped.description || "N/A"}

Website Content:
${scraped.content.substring(0, 5000)}`,
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
