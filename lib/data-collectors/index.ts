/**
 * Data Collection Layer
 *
 * Gathers REAL business intelligence from multiple sources:
 * - Website scraping (deep multi-page analysis)
 * - Competitor discovery and analysis
 * - Review aggregation (Google, Yelp)
 * - SEO metrics (PageSpeed, meta tags, backlinks)
 * - Social media presence detection
 *
 * This replaces LLM hallucinations with actual data.
 */

import { scrapeWebsite } from "./website-scraper";
import { findCompetitors } from "./competitor-discovery";
import { aggregateReviews } from "./review-aggregator";
import { analyzeSEO } from "./seo-analyzer";
import { detectSocialPresence } from "./social-detector";

// ============================================================================
// Type Definitions
// ============================================================================

export interface BusinessData {
  name: string;
  website: string;
  description?: string;
  industry?: string;
  location?: string;
  phone?: string;
  email?: string;
  hours?: string;
  services: string[];
  pricing?: any;
  credentials?: string[];
  yearsInBusiness?: number;
}

export interface CompetitorData {
  name: string;
  website: string;
  description?: string;
  services: string[];
  pricing?: any;
  reviewCount: number;
  averageRating: number;
  strengths: string[];
  weaknesses: string[];
}

export interface ReviewData {
  source: "google" | "yelp" | "facebook" | "other";
  rating: number;
  text: string;
  author?: string;
  date?: string;
  sentiment: "positive" | "negative" | "neutral";
  themes?: string[];
}

export interface ReviewSummary {
  totalReviews: number;
  averageRating: number;
  sources: {
    google?: { count: number; rating: number };
    yelp?: { count: number; rating: number };
    facebook?: { count: number; rating: number };
  };
  recentReviews: ReviewData[];
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  commonThemes: { theme: string; count: number; sentiment: string }[];
}

export interface SEOMetrics {
  pageSpeed: {
    desktop: number;
    mobile: number;
  };
  mobileUsability: boolean;
  metaTags: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  headings: {
    h1: string[];
    h2: string[];
  };
  images: {
    total: number;
    withAlt: number;
    missingAlt: number;
  };
  links: {
    internal: number;
    external: number;
  };
  technicalIssues: string[];
}

export interface SocialPresence {
  platforms: {
    facebook?: { url: string; followers?: number };
    instagram?: { url: string; followers?: number };
    twitter?: { url: string; followers?: number };
    linkedin?: { url: string; followers?: number };
    youtube?: { url: string; subscribers?: number };
  };
  totalPlatforms: number;
  engagement?: {
    postsPerWeek?: number;
    avgEngagement?: number;
  };
}

export interface DataCollectionResult {
  business: BusinessData;
  competitors: CompetitorData[];
  reviews: ReviewSummary;
  seo: SEOMetrics;
  social: SocialPresence;
  metadata: {
    collectedAt: string;
    duration: number;
    sources: string[];
    warnings?: string[];
  };
}

// ============================================================================
// Main Data Collector
// ============================================================================

export class DataCollector {
  private options: {
    maxCompetitors: number;
    maxReviews: number;
    timeout: number;
    enableCache: boolean;
  };

  constructor(
    options: {
      maxCompetitors?: number;
      maxReviews?: number;
      timeout?: number;
      enableCache?: boolean;
    } = {}
  ) {
    this.options = {
      maxCompetitors: options.maxCompetitors ?? 10,
      maxReviews: options.maxReviews ?? 50,
      timeout: options.timeout ?? 60000,
      enableCache: options.enableCache ?? true,
    };
  }

  /**
   * Collect comprehensive business intelligence
   */
  async collect(url: string): Promise<DataCollectionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const sources: string[] = [];

    try {
      // Step 1: Scrape business website (deep analysis)
      console.log("[DataCollector] Scraping business website...");
      const business = await scrapeWebsite(url);
      sources.push("website-scrape");

      // Step 2: Find and analyze competitors (parallel)
      console.log("[DataCollector] Finding competitors...");
      const competitors = await findCompetitors({
        businessName: business.name,
        industry: business.industry,
        location: business.location,
        limit: this.options.maxCompetitors,
      }).catch((error) => {
        warnings.push(`Competitor discovery failed: ${error.message}`);
        return [];
      });

      if (competitors.length > 0) {
        sources.push("competitor-discovery");
      }

      // Step 3: Aggregate reviews
      console.log("[DataCollector] Aggregating reviews...");
      const reviews = await aggregateReviews({
        businessName: business.name,
        location: business.location,
        website: url,
        limit: this.options.maxReviews,
      }).catch((error) => {
        warnings.push(`Review aggregation failed: ${error.message}`);
        return this.emptyReviewSummary();
      });

      if (reviews.totalReviews > 0) {
        sources.push("review-aggregation");
      }

      // Step 4: Analyze SEO
      console.log("[DataCollector] Analyzing SEO metrics...");
      const seo = await analyzeSEO(url).catch((error) => {
        warnings.push(`SEO analysis failed: ${error.message}`);
        return this.emptySEOMetrics();
      });

      sources.push("seo-analysis");

      // Step 5: Detect social media presence
      console.log("[DataCollector] Detecting social media presence...");
      const social = await detectSocialPresence({
        businessName: business.name,
        website: url,
      }).catch((error) => {
        warnings.push(`Social detection failed: ${error.message}`);
        return this.emptySocialPresence();
      });

      if (social.totalPlatforms > 0) {
        sources.push("social-detection");
      }

      return {
        business,
        competitors,
        reviews,
        seo,
        social,
        metadata: {
          collectedAt: new Date().toISOString(),
          duration: Date.now() - startTime,
          sources,
          warnings: warnings.length > 0 ? warnings : undefined,
        },
      };
    } catch (error) {
      throw new Error(
        `Data collection failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get competitor data only
   */
  async getCompetitors(params: {
    businessName: string;
    industry?: string;
    location?: string;
  }): Promise<CompetitorData[]> {
    return findCompetitors({
      businessName: params.businessName,
      industry: params.industry,
      location: params.location,
      limit: this.options.maxCompetitors,
    });
  }

  /**
   * Get reviews only
   */
  async getReviews(params: {
    businessName: string;
    location?: string;
    website?: string;
  }): Promise<ReviewSummary> {
    return aggregateReviews({
      businessName: params.businessName,
      location: params.location,
      website: params.website,
      limit: this.options.maxReviews,
    });
  }

  /**
   * Get SEO metrics only
   */
  async getSEOMetrics(url: string): Promise<SEOMetrics> {
    return analyzeSEO(url);
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private emptyReviewSummary(): ReviewSummary {
    return {
      totalReviews: 0,
      averageRating: 0,
      sources: {},
      recentReviews: [],
      sentimentBreakdown: {
        positive: 0,
        negative: 0,
        neutral: 0,
      },
      commonThemes: [],
    };
  }

  private emptySEOMetrics(): SEOMetrics {
    return {
      pageSpeed: {
        desktop: 0,
        mobile: 0,
      },
      mobileUsability: false,
      metaTags: {},
      headings: {
        h1: [],
        h2: [],
      },
      images: {
        total: 0,
        withAlt: 0,
        missingAlt: 0,
      },
      links: {
        internal: 0,
        external: 0,
      },
      technicalIssues: [],
    };
  }

  private emptySocialPresence(): SocialPresence {
    return {
      platforms: {},
      totalPlatforms: 0,
    };
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let collectorInstance: DataCollector | null = null;

export function getDataCollector(): DataCollector {
  if (!collectorInstance) {
    collectorInstance = new DataCollector();
  }
  return collectorInstance;
}

// Re-export sub-modules for direct access if needed
export { scrapeWebsite } from "./website-scraper";
export { findCompetitors } from "./competitor-discovery";
export { aggregateReviews } from "./review-aggregator";
export { analyzeSEO } from "./seo-analyzer";
export { detectSocialPresence } from "./social-detector";
