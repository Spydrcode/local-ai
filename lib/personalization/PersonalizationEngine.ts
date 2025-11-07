import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * PersonalizationEngine
 *
 * Learns from user behavior to personalize recommendations and prioritize insights.
 * Tracks interactions, builds preference profiles, and adapts content delivery.
 */

interface UserBehavior {
  userId: string;
  businessId: string;
  interactionType:
    | "view"
    | "dismiss"
    | "implement"
    | "share"
    | "bookmark"
    | "feedback";
  contentType:
    | "insight"
    | "recommendation"
    | "analysis"
    | "benchmark"
    | "alert";
  contentId: string;
  contentCategory?: string;
  engagement?: {
    timeSpent?: number; // seconds
    completionRate?: number; // 0-1
    actionTaken?: boolean;
  };
  context?: {
    deviceType?: string;
    timeOfDay?: string;
    dayOfWeek?: string;
  };
  metadata?: Record<string, any>;
  timestamp: Date;
}

interface UserPreferences {
  userId: string;
  preferredContentTypes: Array<{
    type: string;
    score: number; // 0-1, higher = more preferred
  }>;
  preferredCategories: Array<{
    category: string;
    score: number;
  }>;
  interactionPatterns: {
    avgTimeSpent: number;
    preferredTimeOfDay?: string;
    preferredDayOfWeek?: string;
    devicePreference?: string;
  };
  topicInterests: Array<{
    topic: string;
    relevanceScore: number;
  }>;
  implementationRate: number; // How often they act on recommendations
  engagementLevel: "high" | "medium" | "low";
  lastUpdated: Date;
}

interface PersonalizedRecommendation {
  originalRecommendation: any;
  personalizedScore: number; // 0-1, adjusted for user preferences
  reasoning: string[];
  priority: "critical" | "high" | "medium" | "low";
  estimatedEngagement: number; // Predicted likelihood user will engage
}

export class PersonalizationEngine {
  /**
   * Track user interaction with content
   */
  async trackBehavior(behavior: UserBehavior): Promise<void> {
    try {
      await supabase.from("user_interactions").insert({
        user_id: behavior.userId,
        business_id: behavior.businessId,
        interaction_type: behavior.interactionType,
        content_type: behavior.contentType,
        content_id: behavior.contentId,
        content_category: behavior.contentCategory,
        engagement_metrics: behavior.engagement,
        context_data: behavior.context,
        metadata: behavior.metadata,
        created_at: behavior.timestamp,
      });

      // Update user preferences in background (don't await)
      this.updatePreferences(behavior.userId).catch((err) => {
        console.error("Failed to update preferences:", err);
      });
    } catch (error) {
      console.error("Failed to track behavior:", error);
      throw error;
    }
  }

  /**
   * Track multiple behaviors in batch
   */
  async trackBehaviorBatch(behaviors: UserBehavior[]): Promise<void> {
    try {
      const records = behaviors.map((b) => ({
        user_id: b.userId,
        business_id: b.businessId,
        interaction_type: b.interactionType,
        content_type: b.contentType,
        content_id: b.contentId,
        content_category: b.contentCategory,
        engagement_metrics: b.engagement,
        context_data: b.context,
        metadata: b.metadata,
        created_at: b.timestamp,
      }));

      await supabase.from("user_interactions").insert(records);

      // Update preferences for unique users
      const uniqueUserIds = [...new Set(behaviors.map((b) => b.userId))];
      for (const userId of uniqueUserIds) {
        this.updatePreferences(userId).catch((err) => {
          console.error(`Failed to update preferences for ${userId}:`, err);
        });
      }
    } catch (error) {
      console.error("Failed to track behavior batch:", error);
      throw error;
    }
  }

  /**
   * Get user preferences based on historical behavior
   */
  async getUserPreferences(
    userId: string,
    forceRefresh = false
  ): Promise<UserPreferences> {
    try {
      // Check for cached preferences
      if (!forceRefresh) {
        const { data: cached } = await supabase
          .from("user_interactions")
          .select("preferences_cache")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (cached?.preferences_cache) {
          const cacheAge =
            Date.now() -
            new Date(cached.preferences_cache.lastUpdated).getTime();
          // Use cache if less than 1 hour old
          if (cacheAge < 3600000) {
            return cached.preferences_cache as UserPreferences;
          }
        }
      }

      // Calculate fresh preferences
      return await this.calculatePreferences(userId);
    } catch (error) {
      console.error("Failed to get user preferences:", error);
      // Return default preferences on error
      return this.getDefaultPreferences(userId);
    }
  }

  /**
   * Calculate user preferences from interaction history
   */
  private async calculatePreferences(userId: string): Promise<UserPreferences> {
    // Get last 90 days of interactions
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: interactions, error } = await supabase
      .from("user_interactions")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error || !interactions || interactions.length === 0) {
      return this.getDefaultPreferences(userId);
    }

    // Calculate content type preferences
    const contentTypeCounts: Record<
      string,
      { total: number; positive: number }
    > = {};
    const categoryCounts: Record<string, { total: number; positive: number }> =
      {};
    const topicMentions: Record<string, number> = {};
    let totalTimeSpent = 0;
    let timeSpentCount = 0;
    let implementCount = 0;
    const hourCounts: Record<number, number> = {};
    const dayCounts: Record<number, number> = {};
    const deviceCounts: Record<string, number> = {};

    for (const interaction of interactions) {
      // Content type scoring
      const contentType = interaction.content_type;
      if (!contentTypeCounts[contentType]) {
        contentTypeCounts[contentType] = { total: 0, positive: 0 };
      }
      contentTypeCounts[contentType].total++;

      // Positive interactions: implement, share, bookmark
      if (
        ["implement", "share", "bookmark"].includes(
          interaction.interaction_type
        )
      ) {
        contentTypeCounts[contentType].positive++;
      }

      // Category scoring
      if (interaction.content_category) {
        if (!categoryCounts[interaction.content_category]) {
          categoryCounts[interaction.content_category] = {
            total: 0,
            positive: 0,
          };
        }
        categoryCounts[interaction.content_category].total++;
        if (
          ["implement", "share", "bookmark"].includes(
            interaction.interaction_type
          )
        ) {
          categoryCounts[interaction.content_category].positive++;
        }
      }

      // Topic extraction from metadata
      if (interaction.metadata?.topics) {
        for (const topic of interaction.metadata.topics) {
          topicMentions[topic] = (topicMentions[topic] || 0) + 1;
        }
      }

      // Engagement metrics
      if (interaction.engagement_metrics?.timeSpent) {
        totalTimeSpent += interaction.engagement_metrics.timeSpent;
        timeSpentCount++;
      }

      // Implementation tracking
      if (interaction.interaction_type === "implement") {
        implementCount++;
      }

      // Temporal patterns
      const timestamp = new Date(interaction.created_at);
      const hour = timestamp.getHours();
      const day = timestamp.getDay();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      dayCounts[day] = (dayCounts[day] || 0) + 1;

      // Device tracking
      if (interaction.context_data?.deviceType) {
        const device = interaction.context_data.deviceType;
        deviceCounts[device] = (deviceCounts[device] || 0) + 1;
      }
    }

    // Calculate content type preferences with scoring
    const preferredContentTypes = Object.entries(contentTypeCounts)
      .map(([type, counts]) => ({
        type,
        score: this.calculatePreferenceScore(counts.positive, counts.total),
      }))
      .sort((a, b) => b.score - a.score);

    // Calculate category preferences
    const preferredCategories = Object.entries(categoryCounts)
      .map(([category, counts]) => ({
        category,
        score: this.calculatePreferenceScore(counts.positive, counts.total),
      }))
      .sort((a, b) => b.score - a.score);

    // Calculate topic interests
    const totalInteractions = interactions.length;
    const topicInterests = Object.entries(topicMentions)
      .map(([topic, count]) => ({
        topic,
        relevanceScore: count / totalInteractions,
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20); // Top 20 topics

    // Find preferred time of day
    const preferredHour = Object.entries(hourCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const preferredTimeOfDay = preferredHour
      ? this.hourToTimeOfDay(parseInt(preferredHour[0]))
      : undefined;

    // Find preferred day of week
    const preferredDay = Object.entries(dayCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const preferredDayOfWeek = preferredDay
      ? this.dayNumberToName(parseInt(preferredDay[0]))
      : undefined;

    // Find preferred device
    const preferredDevice = Object.entries(deviceCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];

    // Calculate implementation rate
    const implementationRate = implementCount / interactions.length;

    // Determine engagement level
    const avgTimeSpent =
      timeSpentCount > 0 ? totalTimeSpent / timeSpentCount : 0;
    const engagementLevel = this.calculateEngagementLevel(
      avgTimeSpent,
      implementationRate,
      interactions.length
    );

    const preferences: UserPreferences = {
      userId,
      preferredContentTypes,
      preferredCategories,
      interactionPatterns: {
        avgTimeSpent,
        preferredTimeOfDay,
        preferredDayOfWeek,
        devicePreference: preferredDevice,
      },
      topicInterests,
      implementationRate,
      engagementLevel,
      lastUpdated: new Date(),
    };

    return preferences;
  }

  /**
   * Update user preferences in background
   */
  private async updatePreferences(userId: string): Promise<void> {
    const preferences = await this.calculatePreferences(userId);

    // Store in a metadata field on the most recent interaction
    // (In production, you'd want a dedicated user_preferences table)
    await supabase
      .from("user_interactions")
      .update({ preferences_cache: preferences })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
  }

  /**
   * Personalize recommendations based on user preferences
   */
  async personalizeRecommendations(
    userId: string,
    recommendations: any[],
    context?: { businessId?: string; urgency?: string }
  ): Promise<PersonalizedRecommendation[]> {
    const preferences = await this.getUserPreferences(userId);

    return recommendations
      .map((rec) => {
        const reasoning: string[] = [];
        let scoreAdjustment = 0;

        // Content type preference matching
        const contentType = rec.type || rec.category || "general";
        const typePreference = preferences.preferredContentTypes.find(
          (p) => p.type === contentType
        );
        if (typePreference) {
          scoreAdjustment += typePreference.score * 0.3;
          reasoning.push(
            `Matches your preference for ${contentType} content (${Math.round(typePreference.score * 100)}% positive engagement)`
          );
        }

        // Category preference matching
        if (rec.category) {
          const categoryPreference = preferences.preferredCategories.find(
            (p) => p.category === rec.category
          );
          if (categoryPreference) {
            scoreAdjustment += categoryPreference.score * 0.2;
            reasoning.push(
              `Aligns with your interest in ${rec.category} (${Math.round(categoryPreference.score * 100)}% relevance)`
            );
          }
        }

        // Topic matching
        const recTopics = rec.topics || rec.tags || [];
        const matchingTopics = preferences.topicInterests.filter((ti) =>
          recTopics.some((t: string) =>
            t.toLowerCase().includes(ti.topic.toLowerCase())
          )
        );
        if (matchingTopics.length > 0) {
          const topicBoost =
            matchingTopics.reduce((sum, t) => sum + t.relevanceScore, 0) /
            matchingTopics.length;
          scoreAdjustment += topicBoost * 0.25;
          reasoning.push(
            `Related to your interests: ${matchingTopics.map((t) => t.topic).join(", ")}`
          );
        }

        // Implementation likelihood based on user's history
        if (preferences.implementationRate > 0.5 && rec.actionable) {
          scoreAdjustment += 0.15;
          reasoning.push(
            `High implementation rate (${Math.round(preferences.implementationRate * 100)}%) suggests you'll likely act on this`
          );
        }

        // Engagement level adjustment
        if (preferences.engagementLevel === "high" && rec.detailed) {
          scoreAdjustment += 0.1;
          reasoning.push("Detailed content matches your high engagement level");
        } else if (preferences.engagementLevel === "low" && rec.quick_win) {
          scoreAdjustment += 0.15;
          reasoning.push(
            "Quick win aligns with your preference for concise insights"
          );
        }

        // Calculate final personalized score
        const baseScore = rec.score || rec.priority || 0.5;
        const personalizedScore = Math.min(
          1,
          Math.max(0, baseScore + scoreAdjustment)
        );

        // Estimate engagement likelihood
        const estimatedEngagement = this.estimateEngagement(
          personalizedScore,
          preferences,
          rec
        );

        // Determine priority
        let priority: "critical" | "high" | "medium" | "low";
        if (
          personalizedScore >= 0.8 ||
          (context?.urgency === "critical" && personalizedScore >= 0.6)
        ) {
          priority = "critical";
        } else if (personalizedScore >= 0.6) {
          priority = "high";
        } else if (personalizedScore >= 0.4) {
          priority = "medium";
        } else {
          priority = "low";
        }

        return {
          originalRecommendation: rec,
          personalizedScore,
          reasoning,
          priority,
          estimatedEngagement,
        };
      })
      .sort((a, b) => b.personalizedScore - a.personalizedScore);
  }

  /**
   * Calculate preference score based on positive vs total interactions
   */
  private calculatePreferenceScore(positive: number, total: number): number {
    if (total === 0) return 0.5; // Neutral if no data

    // Use Wilson score interval for better handling of small sample sizes
    const p = positive / total;
    const n = total;
    const z = 1.96; // 95% confidence

    const denominator = 1 + (z * z) / n;
    const pHat = p + (z * z) / (2 * n);
    const errorMargin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);

    const lowerBound = (pHat - errorMargin) / denominator;
    return Math.max(0, Math.min(1, lowerBound));
  }

  /**
   * Estimate likelihood of user engaging with this recommendation
   */
  private estimateEngagement(
    personalizedScore: number,
    preferences: UserPreferences,
    recommendation: any
  ): number {
    let engagement = personalizedScore * 0.6; // Base from personalized score

    // Boost if user generally implements recommendations
    engagement += preferences.implementationRate * 0.2;

    // Boost for high engagement users
    if (preferences.engagementLevel === "high") {
      engagement += 0.15;
    } else if (preferences.engagementLevel === "medium") {
      engagement += 0.05;
    }

    // Penalize if recommendation requires high effort but user prefers quick wins
    if (
      recommendation.effort === "high" &&
      preferences.interactionPatterns.avgTimeSpent < 120
    ) {
      engagement -= 0.1;
    }

    return Math.max(0, Math.min(1, engagement));
  }

  /**
   * Calculate engagement level from metrics
   */
  private calculateEngagementLevel(
    avgTimeSpent: number,
    implementationRate: number,
    totalInteractions: number
  ): "high" | "medium" | "low" {
    const score =
      (avgTimeSpent / 300) * 0.4 +
      implementationRate * 0.4 +
      Math.min(totalInteractions / 100, 1) * 0.2;

    if (score >= 0.7) return "high";
    if (score >= 0.4) return "medium";
    return "low";
  }

  /**
   * Get default preferences for new users
   */
  private getDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      preferredContentTypes: [
        { type: "insight", score: 0.5 },
        { type: "recommendation", score: 0.5 },
        { type: "analysis", score: 0.5 },
      ],
      preferredCategories: [],
      interactionPatterns: {
        avgTimeSpent: 0,
      },
      topicInterests: [],
      implementationRate: 0.5,
      engagementLevel: "medium",
      lastUpdated: new Date(),
    };
  }

  /**
   * Convert hour (0-23) to time of day string
   */
  private hourToTimeOfDay(hour: number): string {
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  /**
   * Convert day number (0-6) to day name
   */
  private dayNumberToName(day: number): string {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day] || "Unknown";
  }

  /**
   * Get user engagement summary
   */
  async getEngagementSummary(userId: string): Promise<{
    totalInteractions: number;
    implementedRecommendations: number;
    avgTimeSpent: number;
    topCategories: string[];
    engagementLevel: "high" | "medium" | "low";
    lastActive: Date;
  }> {
    const preferences = await this.getUserPreferences(userId);

    const { data: interactions } = await supabase
      .from("user_interactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const totalInteractions = interactions?.length || 0;
    const implementedRecommendations =
      interactions?.filter((i) => i.interaction_type === "implement").length ||
      0;

    const topCategories = preferences.preferredCategories
      .slice(0, 5)
      .map((c) => c.category);

    const lastActive = interactions?.[0]?.created_at
      ? new Date(interactions[0].created_at)
      : new Date();

    return {
      totalInteractions,
      implementedRecommendations,
      avgTimeSpent: preferences.interactionPatterns.avgTimeSpent,
      topCategories,
      engagementLevel: preferences.engagementLevel,
      lastActive,
    };
  }
}
