/**
 * Meta Ads Library Data Collector
 *
 * Collects competitive intelligence from Meta's Ads Library API
 * - Active ads from competitors
 * - Ad creative analysis (copy, images, CTAs)
 * - Targeting insights
 * - Ad performance indicators
 *
 * API Documentation: https://www.facebook.com/ads/library/api
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface MetaAdCreative {
  id: string;
  headline?: string;
  body?: string;
  description?: string;
  callToAction?: string;
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
}

export interface MetaAdInsight {
  id: string;
  adCreativeId: string;
  pageId: string;
  pageName: string;
  platforms: string[]; // Facebook, Instagram, Audience Network, Messenger
  startDate: string;
  isActive: boolean;
  creative: MetaAdCreative;
  targetingInfo?: {
    ageRange?: string;
    gender?: string;
    locations?: string[];
  };
  spendRange?: {
    min: number;
    max: number;
    currency: string;
  };
  impressionsRange?: {
    min: number;
    max: number;
  };
}

export interface CompetitorAdsProfile {
  pageName: string;
  pageId: string;
  totalActiveAds: number;
  platforms: string[];
  adsByPlatform: {
    facebook: number;
    instagram: number;
    messenger: number;
    audienceNetwork: number;
  };
  topMessages: string[]; // Most common ad copy themes
  topCTAs: string[]; // Most used call-to-actions
  targetingPatterns: {
    locations: string[];
    demographics: string[];
  };
  recentAds: MetaAdInsight[];
}

export interface MetaAdsIntelligence {
  competitors: CompetitorAdsProfile[];
  industryInsights: {
    totalAdsAnalyzed: number;
    commonPlatforms: string[];
    popularCTAs: string[];
    messagingThemes: string[];
    averageAdCount: number;
  };
  opportunities: string[];
  collectedAt: string;
}

// ============================================================================
// Meta Ads Library API Client
// ============================================================================

export class MetaAdsLibraryCollector {
  private accessToken: string;
  private apiVersion: string = "v18.0";
  private baseUrl: string = "https://graph.facebook.com";

  constructor(accessToken?: string) {
    this.accessToken = accessToken || process.env.META_ADS_LIBRARY_TOKEN || "";

    if (!this.accessToken) {
      console.warn(
        "[MetaAdsLibrary] No access token provided. Some features will be limited."
      );
    }
  }

  /**
   * Search for ads by page name or keyword
   */
  async searchAds(params: {
    searchTerms: string;
    adType?:
      | "ALL"
      | "POLITICAL_AND_ISSUE_ADS"
      | "HOUSING_ADS"
      | "EMPLOYMENT_ADS"
      | "CREDIT_ADS";
    adActiveStatus?: "ALL" | "ACTIVE" | "INACTIVE";
    countries?: string[]; // ISO country codes
    limit?: number;
  }): Promise<MetaAdInsight[]> {
    if (!this.accessToken) {
      console.warn("[MetaAdsLibrary] Cannot search ads without access token");
      return [];
    }

    const {
      searchTerms,
      adType = "ALL",
      adActiveStatus = "ACTIVE",
      countries = ["US"],
      limit = 50,
    } = params;

    try {
      const queryParams = new URLSearchParams({
        access_token: this.accessToken,
        search_terms: searchTerms,
        ad_type: adType,
        ad_active_status: adActiveStatus,
        ad_reached_countries: JSON.stringify(countries),
        limit: String(limit),
        fields:
          "id,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_id,page_name,ad_delivery_start_time,ad_delivery_stop_time,impressions,spend,currency,demographic_distribution,region_distribution,publisher_platforms",
      });

      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/ads_archive?${queryParams}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Meta Ads API error: ${error.error?.message || response.statusText}`
        );
      }

      const data = await response.json();
      return this.parseAdInsights(data.data || []);
    } catch (error) {
      console.error("[MetaAdsLibrary] Search failed:", error);
      throw error;
    }
  }

  /**
   * Get ads from a specific Facebook page
   */
  async getPageAds(
    pageId: string,
    limit: number = 50
  ): Promise<MetaAdInsight[]> {
    if (!this.accessToken) {
      console.warn(
        "[MetaAdsLibrary] Cannot fetch page ads without access token"
      );
      return [];
    }

    try {
      const queryParams = new URLSearchParams({
        access_token: this.accessToken,
        search_page_ids: pageId,
        ad_active_status: "ALL",
        limit: String(limit),
        fields:
          "id,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_id,page_name,ad_delivery_start_time,ad_delivery_stop_time,impressions,spend,currency,publisher_platforms",
      });

      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/ads_archive?${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch page ads: ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseAdInsights(data.data || []);
    } catch (error) {
      console.error(
        `[MetaAdsLibrary] Failed to get ads for page ${pageId}:`,
        error
      );
      return [];
    }
  }

  /**
   * Analyze competitor advertising strategy
   */
  async analyzeCompetitor(params: {
    competitorName: string;
    pageId?: string;
  }): Promise<CompetitorAdsProfile | null> {
    const { competitorName, pageId } = params;

    try {
      // Search for competitor ads
      const ads = pageId
        ? await this.getPageAds(pageId)
        : await this.searchAds({ searchTerms: competitorName, limit: 100 });

      if (ads.length === 0) {
        console.warn(`[MetaAdsLibrary] No ads found for ${competitorName}`);
        return null;
      }

      // Aggregate insights
      const profile = this.aggregateCompetitorProfile(ads, competitorName);
      return profile;
    } catch (error) {
      console.error(
        `[MetaAdsLibrary] Failed to analyze competitor ${competitorName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Collect competitive intelligence for multiple competitors
   */
  async collectCompetitiveIntelligence(params: {
    competitors: Array<{ name: string; pageId?: string }>;
    industry?: string;
  }): Promise<MetaAdsIntelligence> {
    const competitorProfiles: CompetitorAdsProfile[] = [];

    for (const competitor of params.competitors) {
      const profile = await this.analyzeCompetitor({
        competitorName: competitor.name,
        pageId: competitor.pageId,
      });

      if (profile) {
        competitorProfiles.push(profile);
      }

      // Rate limiting: wait 1 second between requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Generate industry insights
    const industryInsights = this.generateIndustryInsights(competitorProfiles);
    const opportunities = this.identifyOpportunities(competitorProfiles);

    return {
      competitors: competitorProfiles,
      industryInsights,
      opportunities,
      collectedAt: new Date().toISOString(),
    };
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * Parse raw API response into structured insights
   */
  private parseAdInsights(rawAds: any[]): MetaAdInsight[] {
    return rawAds.map((ad) => {
      const creative: MetaAdCreative = {
        id: ad.id,
        headline: ad.ad_creative_link_titles?.[0],
        body: ad.ad_creative_bodies?.[0],
        description: ad.ad_creative_link_descriptions?.[0],
        callToAction: ad.ad_creative_link_captions?.[0],
        linkUrl: ad.ad_snapshot_url,
      };

      return {
        id: ad.id,
        adCreativeId: ad.id,
        pageId: ad.page_id,
        pageName: ad.page_name,
        platforms: ad.publisher_platforms || [],
        startDate: ad.ad_delivery_start_time || "",
        isActive: !ad.ad_delivery_stop_time,
        creative,
        spendRange: ad.spend
          ? {
              min: ad.spend.lower_bound || 0,
              max: ad.spend.upper_bound || 0,
              currency: ad.currency || "USD",
            }
          : undefined,
        impressionsRange: ad.impressions
          ? {
              min: ad.impressions.lower_bound || 0,
              max: ad.impressions.upper_bound || 0,
            }
          : undefined,
      };
    });
  }

  /**
   * Aggregate competitor profile from ad data
   */
  private aggregateCompetitorProfile(
    ads: MetaAdInsight[],
    competitorName: string
  ): CompetitorAdsProfile {
    const activeAds = ads.filter((ad) => ad.isActive);

    // Count ads by platform
    const platformCounts = {
      facebook: 0,
      instagram: 0,
      messenger: 0,
      audienceNetwork: 0,
    };

    const allPlatforms = new Set<string>();
    const messages: string[] = [];
    const ctas: string[] = [];
    const locations = new Set<string>();

    ads.forEach((ad) => {
      // Platform counts
      ad.platforms.forEach((platform) => {
        allPlatforms.add(platform);
        const key = platform
          .toLowerCase()
          .replace(/[^a-z]/g, "") as keyof typeof platformCounts;
        if (platformCounts.hasOwnProperty(key)) {
          platformCounts[key]++;
        }
      });

      // Extract messages and CTAs
      if (ad.creative.body) messages.push(ad.creative.body);
      if (ad.creative.headline) messages.push(ad.creative.headline);
      if (ad.creative.callToAction) ctas.push(ad.creative.callToAction);
    });

    // Find top messages (deduplicate and count)
    const messageFrequency = this.countFrequency(messages);
    const topMessages = Object.entries(messageFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([msg]) => msg);

    // Find top CTAs
    const ctaFrequency = this.countFrequency(ctas);
    const topCTAs = Object.entries(ctaFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cta]) => cta);

    return {
      pageName: ads[0]?.pageName || competitorName,
      pageId: ads[0]?.pageId || "",
      totalActiveAds: activeAds.length,
      platforms: Array.from(allPlatforms),
      adsByPlatform: platformCounts,
      topMessages,
      topCTAs,
      targetingPatterns: {
        locations: Array.from(locations),
        demographics: [],
      },
      recentAds: ads.slice(0, 10),
    };
  }

  /**
   * Generate insights across all competitors
   */
  private generateIndustryInsights(
    competitors: CompetitorAdsProfile[]
  ): MetaAdsIntelligence["industryInsights"] {
    if (competitors.length === 0) {
      return {
        totalAdsAnalyzed: 0,
        commonPlatforms: [],
        popularCTAs: [],
        messagingThemes: [],
        averageAdCount: 0,
      };
    }

    const totalAds = competitors.reduce((sum, c) => sum + c.totalActiveAds, 0);
    const allPlatforms: string[] = [];
    const allCTAs: string[] = [];
    const allMessages: string[] = [];

    competitors.forEach((competitor) => {
      allPlatforms.push(...competitor.platforms);
      allCTAs.push(...competitor.topCTAs);
      allMessages.push(...competitor.topMessages);
    });

    const platformFreq = this.countFrequency(allPlatforms);
    const ctaFreq = this.countFrequency(allCTAs);
    const messageFreq = this.countFrequency(allMessages);

    return {
      totalAdsAnalyzed: totalAds,
      commonPlatforms: Object.keys(platformFreq).sort(
        (a, b) => platformFreq[b] - platformFreq[a]
      ),
      popularCTAs: Object.keys(ctaFreq)
        .sort((a, b) => ctaFreq[b] - ctaFreq[a])
        .slice(0, 10),
      messagingThemes: Object.keys(messageFreq)
        .sort((a, b) => messageFreq[b] - messageFreq[a])
        .slice(0, 10),
      averageAdCount: Math.round(totalAds / competitors.length),
    };
  }

  /**
   * Identify marketing opportunities based on competitor analysis
   */
  private identifyOpportunities(competitors: CompetitorAdsProfile[]): string[] {
    const opportunities: string[] = [];

    if (competitors.length === 0) {
      return ["No competitor data available for analysis"];
    }

    // Check platform gaps
    const platformUsage = this.countFrequency(
      competitors.flatMap((c) => c.platforms)
    );

    if (
      !platformUsage["Instagram"] ||
      platformUsage["Instagram"] < competitors.length * 0.5
    ) {
      opportunities.push(
        "Instagram advertising appears underutilized by competitors - potential platform opportunity"
      );
    }

    if (
      !platformUsage["Facebook"] ||
      platformUsage["Facebook"] < competitors.length * 0.3
    ) {
      opportunities.push(
        "Facebook advertising has less competition in this space"
      );
    }

    // Check ad volume
    const avgAdCount =
      competitors.reduce((sum, c) => sum + c.totalActiveAds, 0) /
      competitors.length;
    if (avgAdCount < 5) {
      opportunities.push(
        "Competitors are running minimal ads - opportunity to dominate paid advertising"
      );
    } else if (avgAdCount > 20) {
      opportunities.push(
        "Highly competitive ad space - focus on differentiation and unique messaging"
      );
    }

    // CTA analysis
    const allCTAs = competitors.flatMap((c) => c.topCTAs);
    if (
      allCTAs.every(
        (cta) =>
          cta.toLowerCase().includes("buy") ||
          cta.toLowerCase().includes("shop")
      )
    ) {
      opportunities.push(
        "All competitors use direct sales CTAs - try education-first approach (Learn More, Get Guide)"
      );
    }

    return opportunities;
  }

  /**
   * Count frequency of items in array
   */
  private countFrequency(items: string[]): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get Meta Ads intelligence for competitors
 */
export async function getCompetitorAdsIntelligence(params: {
  competitors: Array<{ name: string; pageId?: string }>;
  industry?: string;
  accessToken?: string;
}): Promise<MetaAdsIntelligence> {
  const collector = new MetaAdsLibraryCollector(params.accessToken);
  return collector.collectCompetitiveIntelligence({
    competitors: params.competitors,
    industry: params.industry,
  });
}

/**
 * Search for ads by keyword
 */
export async function searchCompetitorAds(params: {
  keyword: string;
  countries?: string[];
  limit?: number;
  accessToken?: string;
}): Promise<MetaAdInsight[]> {
  const collector = new MetaAdsLibraryCollector(params.accessToken);
  return collector.searchAds({
    searchTerms: params.keyword,
    countries: params.countries,
    limit: params.limit,
  });
}
