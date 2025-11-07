import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface CacheEntry {
  key: string;
  data: any;
  businessId: string;
  analysisType: string;
  createdAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
  metadata: {
    businessDataHash?: string;
    industry?: string;
    competitorCount?: number;
  };
}

export interface FreshnessScore {
  score: number; // 0-1, where 1 is freshest
  factors: {
    age: number;
    businessDataChanged: boolean;
    competitorActivity: number;
    industryVolatility: number;
    accessFrequency: number;
  };
  shouldRefresh: boolean;
  recommendation: "use_cached" | "refresh_background" | "refresh_immediate";
}

export interface CacheContext {
  businessId: string;
  industry?: string;
  forceRefresh?: boolean;
}

export class IntelligentCache {
  private readonly TTL_HOURS = {
    strategic: 168, // 7 days
    marketing: 72, // 3 days
    competitive: 48, // 2 days
    quick: 24, // 1 day
  };

  private readonly FRESHNESS_THRESHOLD = 0.7; // Above this, use cached
  private readonly STALE_THRESHOLD = 0.3; // Below this, force refresh

  /**
   * Get cached analysis with intelligent freshness assessment
   */
  async get<T = any>(
    key: string,
    context: CacheContext
  ): Promise<{
    data: T | null;
    freshness: FreshnessScore | null;
    fromCache: boolean;
  }> {
    try {
      // Check if force refresh is requested
      if (context.forceRefresh) {
        return { data: null, freshness: null, fromCache: false };
      }

      // Get from cache
      const { data: cached, error } = await supabase
        .from("analysis_cache")
        .select("*")
        .eq("key", key)
        .single();

      if (error || !cached) {
        return { data: null, freshness: null, fromCache: false };
      }

      // Update access stats
      await this.updateAccessStats(key);

      // Assess freshness
      const freshness = await this.assessFreshness(cached, context);

      // Decide what to do based on freshness
      if (freshness.score >= this.FRESHNESS_THRESHOLD) {
        // Fresh enough - use cached
        return {
          data: cached.data as T,
          freshness,
          fromCache: true,
        };
      } else if (freshness.score >= this.STALE_THRESHOLD) {
        // Somewhat stale - use cached but trigger background refresh
        this.refreshInBackground(key, context, cached);
        return {
          data: cached.data as T,
          freshness,
          fromCache: true,
        };
      } else {
        // Too stale - force refresh
        return {
          data: null,
          freshness,
          fromCache: false,
        };
      }
    } catch (error) {
      console.error("Cache get error:", error);
      return { data: null, freshness: null, fromCache: false };
    }
  }

  /**
   * Set cache entry with metadata
   */
  async set(
    key: string,
    data: any,
    context: CacheContext & { analysisType: string; metadata?: any }
  ): Promise<void> {
    try {
      const businessDataHash = await this.hashBusinessData(context.businessId);

      await supabase.from("analysis_cache").upsert(
        {
          key,
          data,
          business_id: context.businessId,
          analysis_type: context.analysisType,
          created_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
          access_count: 1,
          metadata: {
            ...context.metadata,
            businessDataHash,
            industry: context.industry,
          },
        },
        {
          onConflict: "key",
        }
      );
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  /**
   * Invalidate cache for a business
   */
  async invalidate(businessId: string, analysisType?: string): Promise<void> {
    try {
      let query = supabase
        .from("analysis_cache")
        .delete()
        .eq("business_id", businessId);

      if (analysisType) {
        query = query.eq("analysis_type", analysisType);
      }

      await query;
    } catch (error) {
      console.error("Cache invalidate error:", error);
    }
  }

  /**
   * Assess cache freshness using multiple factors
   */
  private async assessFreshness(
    cached: any,
    context: CacheContext
  ): Promise<FreshnessScore> {
    const createdAt = new Date(cached.created_at);
    const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);

    // Factor 1: Age score (exponential decay)
    const ttl =
      this.TTL_HOURS[cached.analysis_type as keyof typeof this.TTL_HOURS] || 72;
    const ageScore = Math.max(0, 1 - ageHours / ttl);

    // Factor 2: Business data changes
    const businessDataChanged = await this.hasBusinessDataChanged(
      context.businessId,
      cached.metadata?.businessDataHash
    );
    const businessDataScore = businessDataChanged ? 0 : 1;

    // Factor 3: Competitor activity level
    const competitorActivity = await this.getCompetitorActivityLevel(
      context.businessId,
      createdAt
    );
    const competitorScore = Math.max(0, 1 - competitorActivity);

    // Factor 4: Industry volatility
    const industryVolatility = await this.getIndustryVolatility(
      context.industry || "general"
    );
    const industryScore = Math.max(0, 1 - industryVolatility);

    // Factor 5: Access frequency (popular items stay fresh longer)
    const accessFrequency = cached.access_count / Math.max(1, ageHours);
    const accessScore = Math.min(1, accessFrequency / 10); // Normalize

    // Weighted composite score
    const score =
      ageScore * 0.3 +
      businessDataScore * 0.25 +
      competitorScore * 0.2 +
      industryScore * 0.15 +
      accessScore * 0.1;

    // Determine recommendation
    let recommendation:
      | "use_cached"
      | "refresh_background"
      | "refresh_immediate";
    if (score >= this.FRESHNESS_THRESHOLD) {
      recommendation = "use_cached";
    } else if (score >= this.STALE_THRESHOLD) {
      recommendation = "refresh_background";
    } else {
      recommendation = "refresh_immediate";
    }

    return {
      score,
      factors: {
        age: ageScore,
        businessDataChanged,
        competitorActivity,
        industryVolatility,
        accessFrequency: accessScore,
      },
      shouldRefresh: score < this.FRESHNESS_THRESHOLD,
      recommendation,
    };
  }

  /**
   * Check if business data has changed since cache creation
   */
  private async hasBusinessDataChanged(
    businessId: string,
    previousHash?: string
  ): Promise<boolean> {
    if (!previousHash) return true;

    const currentHash = await this.hashBusinessData(businessId);
    return currentHash !== previousHash;
  }

  /**
   * Hash business data for change detection
   */
  private async hashBusinessData(businessId: string): Promise<string> {
    const { data } = await supabase
      .from("demos")
      .select("site_url, site_content, business_name, industry, key_items")
      .eq("id", businessId)
      .single();

    if (!data) return "";

    // Simple hash of concatenated fields
    const content = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get competitor activity level (0-1, higher = more activity)
   */
  private async getCompetitorActivityLevel(
    businessId: string,
    since: Date
  ): Promise<number> {
    // Check for new competitor analyses, mentions, or changes
    const { count } = await supabase
      .from("competitor_tracking")
      .select("*", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("detected_at", since.toISOString());

    // Normalize: 0 changes = 0, 10+ changes = 1
    return Math.min(1, (count || 0) / 10);
  }

  /**
   * Get industry volatility score (0-1, higher = more volatile)
   */
  private async getIndustryVolatility(industry: string): Promise<number> {
    // Could be enhanced with external APIs (news, trends, etc.)
    // For now, use predefined volatility scores
    const volatilityMap: Record<string, number> = {
      technology: 0.8,
      crypto: 0.9,
      fashion: 0.7,
      healthcare: 0.4,
      finance: 0.6,
      retail: 0.5,
      general: 0.5,
    };

    return volatilityMap[industry.toLowerCase()] || 0.5;
  }

  /**
   * Update access statistics
   */
  private async updateAccessStats(key: string): Promise<void> {
    await supabase.rpc("increment_cache_access", { cache_key: key });
  }

  /**
   * Trigger background refresh
   */
  private refreshInBackground(
    key: string,
    context: CacheContext,
    cached: any
  ): void {
    // Run refresh in background without waiting
    this.performBackgroundRefresh(key, context, cached).catch((error) => {
      console.error("Background refresh error:", error);
    });
  }

  private async performBackgroundRefresh(
    key: string,
    context: CacheContext,
    cached: any
  ): Promise<void> {
    // This would trigger the actual analysis regeneration
    // Implementation depends on your analysis pipeline
    console.log(`Background refresh triggered for key: ${key}`);

    // Example: trigger via queue or direct call
    // await analysisQueue.add('refresh', { key, context, priority: 'low' });
  }

  /**
   * Get cache statistics
   */
  async getStats(businessId?: string): Promise<{
    totalEntries: number;
    hitRate: number;
    avgAge: number;
    byType: Record<string, number>;
  }> {
    let query = supabase.from("analysis_cache").select("*");

    if (businessId) {
      query = query.eq("business_id", businessId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { totalEntries: 0, hitRate: 0, avgAge: 0, byType: {} };
    }

    const totalEntries = data.length;
    const totalAccesses = data.reduce(
      (sum, entry) => sum + entry.access_count,
      0
    );
    const avgAge =
      data.reduce((sum, entry) => {
        const age = Date.now() - new Date(entry.created_at).getTime();
        return sum + age;
      }, 0) / totalEntries;

    const byType = data.reduce((acc: Record<string, number>, entry) => {
      acc[entry.analysis_type] = (acc[entry.analysis_type] || 0) + 1;
      return acc;
    }, {});

    return {
      totalEntries,
      hitRate: totalAccesses / Math.max(1, totalEntries), // Rough approximation
      avgAge: avgAge / (1000 * 60 * 60), // Convert to hours
      byType,
    };
  }

  /**
   * Cleanup old cache entries
   */
  async cleanup(maxAgeHours: number = 720): Promise<number> {
    const cutoffDate = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("analysis_cache")
      .delete()
      .lt("created_at", cutoffDate.toISOString())
      .select();

    return data?.length || 0;
  }
}
