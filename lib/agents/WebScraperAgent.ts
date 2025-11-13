/**
 * Web Scraper Agent
 *
 * Specialized agent for comprehensive website intelligence extraction
 * Coordinates with DataCollector for multi-page scraping and analysis
 */

import { DataCollector, type ReviewSummary } from "../data-collectors";
import { MarketingIntelligenceCollector } from "../data-collectors/marketing-intelligence-collector";
import { fetchSitePages } from "../scraper";
import {
  UnifiedAgent,
  type AgentConfig,
  type AgentTool,
} from "./unified-agent-system";

export interface WebScraperConfig {
  url: string;
  paths?: string[];
  extractors?: {
    business?: boolean;
    competitors?: boolean;
    seo?: boolean;
    social?: boolean;
    reviews?: boolean;
    metaAds?: boolean;
  };
}

export interface WebScraperResult {
  // Core data from DataCollector
  business?: any;
  competitors?: any[];
  seo?: any;
  social?: any;
  reviews?: ReviewSummary;
  metaAds?: any;

  // Additional intelligence from MarketingIntelligenceCollector
  brandAnalysis?: any;
  contentAnalysis?: any;

  // Raw page content
  rawPages?: Record<string, string>;

  // Metadata
  scrapedAt: string;
  url: string;
  metadata?: any;
}

/**
 * Web Scraper Agent - Primary intelligence gathering agent
 */
export class WebScraperAgent extends UnifiedAgent {
  private dataCollector: DataCollector;
  private marketingCollector: MarketingIntelligenceCollector;

  constructor() {
    const config: AgentConfig = {
      name: "web-scraper",
      description:
        "Extracts comprehensive business intelligence from websites using multi-page scraping and AI analysis",
      systemPrompt: `You are an expert web intelligence analyst specializing in extracting detailed business information from websites.

Your role is to:
1. **ANALYZE SCRAPED CONTENT**: Process HTML from multiple pages to extract structured business data
2. **IDENTIFY PATTERNS**: Recognize business models, service offerings, target markets, competitive positioning
3. **EXTRACT INTELLIGENCE**: Pull specific details like:
   - Business name, description, and core services
   - Years in business, credentials, awards
   - Pricing information (if available)
   - Contact methods (phone, email, hours)
   - Location and service areas
   - Brand voice, tone, and messaging
   - Key differentiators and unique value propositions
4. **ENSURE SPECIFICITY**: Never use generic descriptions - extract ACTUAL content from the website
5. **STRUCTURED OUTPUT**: Return data in clean JSON format for downstream tool usage

**CRITICAL RULES**:
- Extract what's ACTUALLY on the website, not assumptions
- For businesses, identify the specific sub-niche (e.g., "Texas-style BBQ catering" not "restaurant")
- Capture exact services/products by name
- Note specific credentials, years, awards if mentioned
- Identify target customer segments explicitly stated
- Quote or reference actual text for brand voice analysis

When multiple pages are provided, synthesize information across all pages for complete intelligence.`,
      temperature: 0.3, // Lower for factual extraction
      maxTokens: 3000,
      requiresTools: false, // We'll handle tools directly
      jsonMode: true,
    };

    super(config);

    // Initialize collectors after super call
    this.dataCollector = new DataCollector({
      maxCompetitors: 10,
      maxReviews: 50,
      timeout: 60000,
      enableCache: true,
      metaAdsToken: process.env.META_ADS_LIBRARY_TOKEN,
    });

    this.marketingCollector = new MarketingIntelligenceCollector();
  }

  /**
   * Scrape and analyze website with full intelligence extraction
   */
  async scrapeAndAnalyze(config: WebScraperConfig): Promise<WebScraperResult> {
    console.log(
      `[WebScraperAgent] Starting comprehensive scrape for ${config.url}`
    );

    try {
      // Use DataCollector for comprehensive intelligence
      const comprehensiveData = await this.dataCollector.collect(config.url);

      // Get marketing intelligence (brand + content analysis)
      const marketingData = await this.marketingCollector.collect(config.url);

      // Also get raw page content if needed
      const rawPages = await fetchSitePages(
        config.url,
        config.paths || ["/", "/about", "/services", "/pricing"]
      );

      const result: WebScraperResult = {
        business: comprehensiveData.business,
        competitors: comprehensiveData.competitors,
        seo: comprehensiveData.seo,
        social: comprehensiveData.social,
        reviews: comprehensiveData.reviews,
        metaAds: comprehensiveData.metaAds,
        brandAnalysis: marketingData.brandAnalysis,
        contentAnalysis: marketingData.contentAnalysis,
        metadata: comprehensiveData.metadata,
        rawPages,
        scrapedAt: new Date().toISOString(),
        url: config.url,
      };

      console.log(`[WebScraperAgent] Completed scrape for ${config.url}`);
      console.log(`  - Business data: ${result.business ? "Yes" : "No"}`);
      console.log(`  - Competitors found: ${result.competitors?.length || 0}`);
      console.log(`  - SEO data: ${result.seo ? "Yes" : "No"}`);
      console.log(
        `  - Social platforms: ${result.social?.totalPlatforms || 0}`
      );
      console.log(`  - Total Reviews: ${result.reviews?.totalReviews || 0}`);

      return result;
    } catch (error) {
      console.error(`[WebScraperAgent] Error scraping ${config.url}:`, error);
      throw error;
    }
  }

  /**
   * Quick scrape - just basic business info (faster)
   */
  async quickScrape(url: string): Promise<any> {
    console.log(`[WebScraperAgent] Quick scrape for ${url}`);

    try {
      // Just get homepage
      const pages = await fetchSitePages(url, ["/"]);
      const homeHtml = pages["/"];

      // Use agent to extract business info
      const analysis = await this.execute(
        `Extract basic business information from this website homepage.

Focus on:
- Business name
- Industry/niche
- Core services/products
- Location
- Contact info
- Brief description

Return JSON with: businessName, industry, services[], location, description`,
        {
          url,
          html: homeHtml.substring(0, 8000),
        }
      );

      return JSON.parse(analysis.content);
    } catch (error) {
      console.error(`[WebScraperAgent] Quick scrape failed:`, error);
      throw error;
    }
  }

  /**
   * Targeted extraction - only specific data types
   */
  async targetedScrape(
    config: WebScraperConfig
  ): Promise<Partial<WebScraperResult>> {
    console.log(`[WebScraperAgent] Targeted scrape for ${config.url}`);

    const result: Partial<WebScraperResult> = {
      url: config.url,
      scrapedAt: new Date().toISOString(),
    };

    try {
      // Collect based on what's requested
      const needsFullData =
        config.extractors?.business ||
        config.extractors?.competitors ||
        config.extractors?.seo ||
        config.extractors?.social ||
        config.extractors?.reviews ||
        config.extractors?.metaAds;

      if (needsFullData) {
        const fullData = await this.dataCollector.collect(config.url);

        // Only include requested data types
        if (config.extractors?.business) result.business = fullData.business;
        if (config.extractors?.competitors)
          result.competitors = fullData.competitors;
        if (config.extractors?.seo) result.seo = fullData.seo;
        if (config.extractors?.social) result.social = fullData.social;
        if (config.extractors?.reviews) result.reviews = fullData.reviews;
        if (config.extractors?.metaAds) result.metaAds = fullData.metaAds;
        if (fullData.metadata) result.metadata = fullData.metadata;
      }

      return result;
    } catch (error) {
      console.error(`[WebScraperAgent] Targeted scrape failed:`, error);
      throw error;
    }
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Get available tools
   */
  getTools(): AgentTool[] {
    return this.config.tools || [];
  }
}

// Export singleton instance
export const webScraperAgent = new WebScraperAgent();
