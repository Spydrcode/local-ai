/**
 * MonitoringAgent: Real-time business intelligence alerts
 *
 * Monitors:
 * - Google Maps ranking drops
 * - Negative reviews
 * - New competitors in service area
 * - Lead volume lag vs predictions
 * - QC failure spikes
 * - Crew turnover
 *
 * Pattern: Business-profile-first, conservative inference
 */

import {
  MonitoringAgentInput,
  MonitoringAgentOutput,
  ContractorAlert,
  MonitoringSnapshot,
  AlertConfig,
  AlertSeverity,
  RankingDropData,
  NegativeReviewData,
  NewCompetitorData,
  LeadVolumeLagData,
  QCFailureSpikeData,
  GoogleRankingsSnapshot,
  ReviewsAggregateSnapshot,
  CompetitorScanSnapshot,
  LeadVolumeSnapshot,
  RecommendedAction,
  NotificationChannel,
} from '@/lib/types/contractor-monitoring';

export class MonitoringAgent {
  /**
   * Main entry: Check all enabled alert configs and trigger alerts
   */
  static async runMonitoring(input: MonitoringAgentInput): Promise<MonitoringAgentOutput> {
    const alerts_triggered: ContractorAlert[] = [];
    const snapshots_to_save: MonitoringSnapshot[] = [];
    const notifications_to_send: any[] = [];

    // Save current snapshots for future trend detection
    if (input.current_data.rankings) {
      snapshots_to_save.push({
        id: this.generateId(),
        demo_id: input.demo_id,
        snapshot_type: 'google_rankings',
        snapshot_data: input.current_data.rankings,
        captured_at: new Date().toISOString(),
      });
    }

    if (input.current_data.reviews) {
      snapshots_to_save.push({
        id: this.generateId(),
        demo_id: input.demo_id,
        snapshot_type: 'reviews_aggregate',
        snapshot_data: input.current_data.reviews,
        captured_at: new Date().toISOString(),
      });
    }

    if (input.current_data.competitors) {
      snapshots_to_save.push({
        id: this.generateId(),
        demo_id: input.demo_id,
        snapshot_type: 'competitor_scan',
        snapshot_data: input.current_data.competitors,
        captured_at: new Date().toISOString(),
      });
    }

    if (input.current_data.lead_volume) {
      snapshots_to_save.push({
        id: this.generateId(),
        demo_id: input.demo_id,
        snapshot_type: 'lead_volume',
        snapshot_data: input.current_data.lead_volume,
        captured_at: new Date().toISOString(),
      });
    }

    // Check each enabled alert config
    for (const config of input.alert_configs.filter((c) => c.is_enabled)) {
      let alert: ContractorAlert | null = null;

      switch (config.alert_type) {
        case 'ranking_drop':
          alert = this.checkRankingDrop(input, config);
          break;
        case 'negative_review':
          alert = this.checkNegativeReview(input, config);
          break;
        case 'new_competitor':
          alert = this.checkNewCompetitor(input, config);
          break;
        case 'lead_volume_lag':
          alert = this.checkLeadVolumeLag(input, config);
          break;
        case 'qc_failure_spike':
          alert = this.checkQCFailureSpike(input, config);
          break;
        default:
          break;
      }

      if (alert) {
        alerts_triggered.push(alert);
        notifications_to_send.push({
          alert_id: alert.id,
          channels: config.notification_channels,
          recipients: {
            email: input.profile.contact_email,
            phone: input.profile.contact_phone,
          },
        });
      }
    }

    return {
      alerts_triggered,
      snapshots_to_save,
      notifications_to_send,
    };
  }

  // ============================================================
  // ALERT DETECTION METHODS
  // ============================================================

  /**
   * Check for Google Maps ranking drops
   */
  private static checkRankingDrop(
    input: MonitoringAgentInput,
    config: AlertConfig
  ): ContractorAlert | null {
    if (!input.current_data.rankings) return null;

    const threshold = config.threshold_config as any;
    const recent_rankings_snapshot = input.recent_snapshots.find(
      (s) => s.snapshot_type === 'google_rankings'
    );

    if (!recent_rankings_snapshot) {
      // No baseline yet
      return null;
    }

    const old_rankings = recent_rankings_snapshot.snapshot_data as GoogleRankingsSnapshot;
    const new_rankings = input.current_data.rankings;

    // Check each keyword
    for (const keyword of threshold.keywords || Object.keys(old_rankings)) {
      const old_rank = old_rankings[keyword];
      const new_rank = new_rankings[keyword];

      if (!old_rank || !new_rank) continue;

      const positions_dropped = new_rank - old_rank;

      if (positions_dropped >= threshold.positions_dropped) {
        // Alert!
        const severity: AlertSeverity =
          positions_dropped >= 10
            ? 'critical'
            : positions_dropped >= 7
            ? 'high'
            : positions_dropped >= 5
            ? 'medium'
            : 'low';

        const detected_data: RankingDropData = {
          keyword,
          old_rank,
          new_rank,
          positions_dropped,
          search_url: `https://www.google.com/maps/search/${encodeURIComponent(keyword)}`,
        };

        const recommended_actions: RecommendedAction[] = [
          {
            action: 'Update Google Business Profile with recent photos and posts',
            priority: 1,
            estimated_time: '15 minutes',
            category: 'SEO',
          },
          {
            action: 'Request 3-5 new Google reviews from recent happy customers',
            priority: 2,
            estimated_time: '30 minutes',
            category: 'Reputation',
          },
          {
            action: `Check if competitors are running ads for "${keyword}"`,
            priority: 3,
            estimated_time: '10 minutes',
            category: 'Competitive Intelligence',
          },
        ];

        return {
          id: this.generateId(),
          demo_id: input.demo_id,
          config_id: config.id,
          alert_type: 'ranking_drop',
          severity,
          title: `Ranking dropped ${positions_dropped} positions for "${keyword}"`,
          message: `Your Google Maps ranking for "${keyword}" dropped from #${old_rank} to #${new_rank}. This could impact lead volume.`,
          detected_data,
          recommended_actions,
          status: 'new',
          notifications_sent: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    return null;
  }

  /**
   * Check for negative reviews
   */
  private static checkNegativeReview(
    input: MonitoringAgentInput,
    config: AlertConfig
  ): ContractorAlert | null {
    if (!input.current_data.reviews) return null;

    const threshold = config.threshold_config as any;
    // NOTE: In real implementation, this would check new reviews since last check
    // For now, we'll simulate by checking if avg is below threshold

    const reviews = input.current_data.reviews;
    const platforms = threshold.platforms || ['google', 'yelp', 'facebook'];

    for (const platform of platforms) {
      const platform_reviews = reviews[platform as keyof ReviewsAggregateSnapshot];
      if (!platform_reviews) continue;

      // Simulate: If avg drops significantly, assume new negative review
      const recent_snapshot = input.recent_snapshots.find(
        (s) => s.snapshot_type === 'reviews_aggregate'
      );

      if (!recent_snapshot) continue;

      const old_reviews = (recent_snapshot.snapshot_data as ReviewsAggregateSnapshot)[
        platform as keyof ReviewsAggregateSnapshot
      ];

      if (!old_reviews) continue;

      // If avg dropped by 0.2+ stars, assume negative review
      if (old_reviews.avg - platform_reviews.avg >= 0.2) {
        const severity: AlertSeverity =
          platform_reviews.avg <= 1 ? 'critical' : platform_reviews.avg <= 2 ? 'high' : 'medium';

        const detected_data: NegativeReviewData = {
          platform: platform as 'google' | 'yelp' | 'facebook',
          stars: Math.round((old_reviews.avg - 0.2) * 10) / 10, // Simulated
          review_text: 'New negative review detected (details require API integration)',
          posted_at: new Date().toISOString(),
        };

        const recommended_actions: RecommendedAction[] = [
          {
            action: `Respond to the ${platform} review within 24 hours (professional, empathetic)`,
            priority: 1,
            estimated_time: '20 minutes',
            category: 'Reputation Management',
          },
          {
            action: 'Contact the customer directly to resolve the issue',
            priority: 2,
            estimated_time: '30 minutes',
            category: 'Customer Service',
          },
          {
            action: 'Request 5 new positive reviews to offset the negative',
            priority: 3,
            estimated_time: '1 hour',
            category: 'Reputation',
          },
        ];

        return {
          id: this.generateId(),
          demo_id: input.demo_id,
          config_id: config.id,
          alert_type: 'negative_review',
          severity,
          title: `New negative review on ${platform}`,
          message: `Your ${platform} rating dropped from ${old_reviews.avg.toFixed(1)} to ${platform_reviews.avg.toFixed(1)} stars. Respond quickly to minimize damage.`,
          detected_data,
          recommended_actions,
          status: 'new',
          notifications_sent: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    }

    return null;
  }

  /**
   * Check for new competitors
   */
  private static checkNewCompetitor(
    input: MonitoringAgentInput,
    config: AlertConfig
  ): ContractorAlert | null {
    if (!input.current_data.competitors) return null;

    const threshold = config.threshold_config as any;
    const recent_snapshot = input.recent_snapshots.find(
      (s) => s.snapshot_type === 'competitor_scan'
    );

    if (!recent_snapshot) return null;

    const old_competitors = (recent_snapshot.snapshot_data as CompetitorScanSnapshot).competitors;
    const new_competitors = input.current_data.competitors.competitors;

    // Find new names
    const old_names = new Set(old_competitors.map((c) => c.name.toLowerCase()));
    const truly_new = new_competitors.filter(
      (c) => !old_names.has(c.name.toLowerCase()) && c.rank <= 10 // Top 10 only
    );

    if (truly_new.length === 0) return null;

    // Alert on first new competitor
    const competitor = truly_new[0];

    const severity: AlertSeverity =
      competitor.rank <= 3 ? 'high' : competitor.rank <= 7 ? 'medium' : 'low';

    const detected_data: NewCompetitorData = {
      name: competitor.name,
      distance_miles: competitor.distance_miles || 0,
      services: [], // Would be filled by scraping
      service_overlap_percent: 0.7, // Simulated
      detected_from: 'google_maps',
    };

    const recommended_actions: RecommendedAction[] = [
      {
        action: `Research ${competitor.name} — check their pricing, services, and Google rating`,
        priority: 1,
        estimated_time: '20 minutes',
        category: 'Competitive Intelligence',
      },
      {
        action: 'Update your Google Business Profile to highlight unique selling points',
        priority: 2,
        estimated_time: '15 minutes',
        category: 'SEO',
      },
      {
        action: 'Consider running a limited promotion to capture more market share',
        priority: 3,
        estimated_time: '1 hour',
        category: 'Marketing',
      },
    ];

    return {
      id: this.generateId(),
      demo_id: input.demo_id,
      config_id: config.id,
      alert_type: 'new_competitor',
      severity,
      title: `New competitor "${competitor.name}" ranked #${competitor.rank}`,
      message: `A new competitor "${competitor.name}" is now ranking at position #${competitor.rank} in your service area.`,
      detected_data,
      recommended_actions,
      status: 'new',
      notifications_sent: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Check for lead volume lag
   */
  private static checkLeadVolumeLag(
    input: MonitoringAgentInput,
    config: AlertConfig
  ): ContractorAlert | null {
    if (!input.current_data.lead_volume) return null;

    const threshold = config.threshold_config as any;
    const { week_leads, expected_low, expected_high } = input.current_data.lead_volume;

    // Check if current is below expected range
    if (week_leads >= expected_low) {
      return null; // No alert, within expected range
    }

    const expected_midpoint = (expected_low + expected_high) / 2;
    const percent_below = ((expected_midpoint - week_leads) / expected_midpoint) * 100;

    if (percent_below < threshold.percent_below_expected) {
      return null; // Not below threshold
    }

    const severity: AlertSeverity =
      percent_below >= 40 ? 'critical' : percent_below >= 30 ? 'high' : 'medium';

    const detected_data: LeadVolumeLagData = {
      current_week_leads: week_leads,
      expected_leads_low: expected_low,
      expected_leads_high: expected_high,
      percent_below_expected: Math.round(percent_below),
      trend: percent_below >= 40 ? 'accelerating_decline' : 'steady_decline',
    };

    const recommended_actions: RecommendedAction[] = [
      {
        action: 'Run Weekly Lead Pulse to identify root cause (seasonality, market, or execution)',
        priority: 1,
        estimated_time: '10 minutes',
        category: 'Lead Generation',
      },
      {
        action: `Increase ad spend by 20-30% for ${input.profile.primary_industry} services`,
        priority: 2,
        estimated_time: '30 minutes',
        category: 'Marketing',
      },
      {
        action: 'Post 2-3 times on Google Business Profile with recent job photos',
        priority: 3,
        estimated_time: '20 minutes',
        category: 'SEO',
      },
      {
        action: 'Reach out to past customers for referrals',
        priority: 4,
        estimated_time: '1 hour',
        category: 'Networking',
      },
    ];

    return {
      id: this.generateId(),
      demo_id: input.demo_id,
      config_id: config.id,
      alert_type: 'lead_volume_lag',
      severity,
      title: `Lead volume ${Math.round(percent_below)}% below expected`,
      message: `You're at ${week_leads} leads this week, but expected ${expected_low}-${expected_high}. This could hurt revenue if not addressed.`,
      detected_data,
      recommended_actions,
      status: 'new',
      notifications_sent: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Check for QC failure spike
   */
  private static checkQCFailureSpike(
    input: MonitoringAgentInput,
    config: AlertConfig
  ): ContractorAlert | null {
    if (!input.current_data.qc_stats) return null;

    const threshold = config.threshold_config as any;
    const { jobs_analyzed, failed_jobs, failure_rate } = input.current_data.qc_stats;

    if (jobs_analyzed < threshold.min_jobs) {
      return null; // Not enough data
    }

    if (failure_rate < threshold.failure_rate_threshold) {
      return null; // Below threshold
    }

    const severity: AlertSeverity =
      failure_rate >= 0.3 ? 'critical' : failure_rate >= 0.2 ? 'high' : 'medium';

    const detected_data: QCFailureSpikeData = {
      jobs_analyzed,
      failed_jobs,
      failure_rate,
      prev_period_failure_rate: 0.08, // Simulated baseline
      increase_percentage: Math.round(((failure_rate - 0.08) / 0.08) * 100),
      common_issues: ['Incomplete installation', 'Missing documentation', 'Code violations'],
    };

    const recommended_actions: RecommendedAction[] = [
      {
        action: 'Review QC failures with crew — identify training gaps',
        priority: 1,
        estimated_time: '1 hour',
        category: 'Quality Control',
      },
      {
        action: 'Schedule re-training session on most common issues',
        priority: 2,
        estimated_time: '2 hours',
        category: 'Training',
      },
      {
        action: 'Implement daily photo uploads during job to catch issues early',
        priority: 3,
        estimated_time: '30 minutes',
        category: 'Process Improvement',
      },
      {
        action: 'Add checklist signoff requirement before marking job complete',
        priority: 4,
        estimated_time: '15 minutes',
        category: 'Process Improvement',
      },
    ];

    return {
      id: this.generateId(),
      demo_id: input.demo_id,
      config_id: config.id,
      alert_type: 'qc_failure_spike',
      severity,
      title: `QC failure rate spiked to ${Math.round(failure_rate * 100)}%`,
      message: `${failed_jobs} of ${jobs_analyzed} recent jobs failed QC. This is ${Math.round(((failure_rate - 0.08) / 0.08) * 100)}% higher than normal and could hurt reputation.`,
      detected_data,
      recommended_actions,
      status: 'new',
      notifications_sent: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  // ============================================================
  // UTILITIES
  // ============================================================

  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
