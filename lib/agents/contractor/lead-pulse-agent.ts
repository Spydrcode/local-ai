/**
 * LeadPulseAgent
 *
 * Generates weekly lead predictions with actionable recommendations.
 * Uses historical data + seasonal patterns + market signals.
 *
 * Core algorithm:
 * 1. Analyze historical lead patterns (last 12 weeks)
 * 2. Apply seasonal adjustments (from profile peak_seasons)
 * 3. Incorporate market signals (Google Trends, permits, competitor ads)
 * 4. Calculate confidence based on data quality
 * 5. Generate top 3 actions with ready-to-run content
 */

import type { ContractorProfile } from '@/lib/types/contractor';
import type {
  LeadPrediction,
  WeeklyPulse,
  RecommendedAction,
  DataSourceUsage,
  WeeklyLeadSummary,
  FacebookAdAction,
  SocialPostAction,
  EmailCampaignAction,
  PricingTestAction,
  MarketSignal
} from '@/lib/types/contractor-leads';

export interface LeadPulseInput {
  profile: ContractorProfile;
  historical_leads: WeeklyLeadSummary[]; // last 12+ weeks
  market_signals: MarketSignal[];
  current_date: Date;
}

export interface LeadPulseOutput {
  pulse: WeeklyPulse;
  prediction: LeadPrediction;
}

export class LeadPulseAgent {
  /**
   * Generate weekly lead pulse with predictions and actions
   */
  static async generateWeeklyPulse(input: LeadPulseInput): Promise<LeadPulseOutput> {
    const { profile, historical_leads, market_signals, current_date } = input;

    // Calculate next week's date range
    const next_monday = this.getNextMonday(current_date);
    const next_sunday = new Date(next_monday);
    next_sunday.setDate(next_sunday.getDate() + 6);

    // Step 1: Analyze historical patterns
    const historical_analysis = this.analyzeHistoricalLeads(historical_leads);

    // Step 2: Calculate seasonal factor
    const seasonal_factor = this.calculateSeasonalFactor(profile, next_monday);

    // Step 3: Analyze market signals
    const market_analysis = this.analyzeMarketSignals(market_signals, profile);

    // Step 4: Generate prediction
    const base_prediction = historical_analysis.average_leads;
    const adjusted_prediction = base_prediction * seasonal_factor * market_analysis.demand_multiplier;

    // Calculate prediction range (+/- 20%)
    const predicted_leads_low = Math.max(1, Math.round(adjusted_prediction * 0.8));
    const predicted_leads_high = Math.round(adjusted_prediction * 1.2);
    const predicted_leads_midpoint = Math.round(adjusted_prediction);

    // Step 5: Calculate confidence
    const confidence_score = this.calculateConfidence(
      historical_leads,
      profile,
      market_signals
    );
    const confidence_level = confidence_score >= 0.7 ? 'high' : confidence_score >= 0.4 ? 'medium' : 'low';

    // Step 6: Generate top 3 actions
    const top_actions = this.generateRecommendedActions(
      profile,
      historical_analysis,
      market_analysis,
      predicted_leads_midpoint
    );

    // Step 7: Build data sources summary
    const data_sources: DataSourceUsage = {
      historical_data: {
        weeks_analyzed: historical_leads.length,
        average_leads: historical_analysis.average_leads,
        used: historical_leads.length > 0
      },
      seasonal_pattern: {
        current_season: this.getCurrentSeason(next_monday),
        historical_multiplier: seasonal_factor,
        used: profile.peak_seasons.length > 0
      },
      market_signals: {
        google_trends_score: market_analysis.trends_score,
        building_permits: market_analysis.permits_count,
        competitor_ad_volume: market_analysis.competitor_ad_volume,
        used: market_signals.length > 0
      },
      profile_data: {
        typical_leads_per_week: profile.kpis?.leads_per_week,
        used: !!profile.kpis?.leads_per_week
      }
    };

    // Step 8: Generate reasoning
    const reasoning = this.generateReasoning(
      predicted_leads_midpoint,
      historical_analysis,
      seasonal_factor,
      market_analysis,
      profile
    );

    // Build Weekly Pulse
    const pulse: WeeklyPulse = {
      demo_id: '', // Will be filled by API
      generated_at: current_date.toISOString(),
      week_start: next_monday.toISOString().split('T')[0],
      week_end: next_sunday.toISOString().split('T')[0],
      prediction: {
        expected_leads_low: predicted_leads_low,
        expected_leads_high: predicted_leads_high,
        expected_leads_midpoint: predicted_leads_midpoint,
        confidence: confidence_level,
        confidence_score
      },
      top_actions,
      historical_context: {
        last_week_leads: historical_leads[0]?.total_leads || 0,
        four_week_average: historical_analysis.four_week_average,
        trend: historical_analysis.trend,
        trend_percentage: historical_analysis.trend_percentage
      },
      market_context: {
        seasonal_factor,
        local_demand_score: Math.round(market_analysis.demand_multiplier * 100),
        competitor_activity: market_analysis.competitor_activity,
        notable_signals: market_analysis.notable_signals
      },
      data_sources,
      reasoning
    };

    // Build Prediction record for storage
    const prediction: Partial<LeadPrediction> = {
      prediction_date: current_date.toISOString().split('T')[0],
      week_start: pulse.week_start,
      week_end: pulse.week_end,
      predicted_leads_low,
      predicted_leads_high,
      predicted_leads_midpoint,
      confidence: confidence_score,
      data_sources,
      seasonal_factor,
      trend_factor: market_analysis.demand_multiplier,
      reasoning,
      recommended_actions: top_actions
    };

    return {
      pulse,
      prediction: prediction as LeadPrediction
    };
  }

  /**
   * Analyze historical lead patterns
   */
  private static analyzeHistoricalLeads(historical_leads: WeeklyLeadSummary[]): {
    average_leads: number;
    four_week_average: number;
    twelve_week_average: number;
    trend: 'up' | 'down' | 'stable';
    trend_percentage: number;
  } {
    if (historical_leads.length === 0) {
      return {
        average_leads: 10,
        four_week_average: 10,
        twelve_week_average: 10,
        trend: 'stable',
        trend_percentage: 0
      };
    }

    // Sort by week_start (most recent first)
    const sorted = [...historical_leads].sort((a, b) =>
      new Date(b.week_start).getTime() - new Date(a.week_start).getTime()
    );

    // Calculate averages
    const last_4_weeks = sorted.slice(0, 4);
    const last_12_weeks = sorted.slice(0, 12);

    const four_week_average = this.average(last_4_weeks.map(w => w.total_leads));
    const twelve_week_average = this.average(last_12_weeks.map(w => w.total_leads));

    // Determine trend (compare last 4 weeks to previous 4 weeks)
    const previous_4_weeks = sorted.slice(4, 8);
    const previous_4_avg = this.average(previous_4_weeks.map(w => w.total_leads));

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trend_percentage = 0;

    if (previous_4_avg > 0) {
      trend_percentage = ((four_week_average - previous_4_avg) / previous_4_avg) * 100;

      if (trend_percentage > 5) trend = 'up';
      else if (trend_percentage < -5) trend = 'down';
    }

    // Use 4-week average as base prediction (most recent data)
    const average_leads = four_week_average;

    return {
      average_leads,
      four_week_average,
      twelve_week_average,
      trend,
      trend_percentage
    };
  }

  /**
   * Calculate seasonal adjustment factor
   */
  private static calculateSeasonalFactor(profile: ContractorProfile, target_date: Date): number {
    const current_season = this.getCurrentSeason(target_date);

    // Default: no adjustment
    let factor = 1.0;

    // Peak season: +15-25% boost
    if (profile.peak_seasons?.includes(current_season)) {
      factor = 1.20;
    }

    // Off season: -10-15% reduction
    if (profile.off_seasons?.includes(current_season)) {
      factor = 0.90;
    }

    // Industry-specific seasonality
    switch (profile.primary_industry) {
      case 'HVAC':
        // Hot summers, cold winters = peak
        if (current_season === 'Summer' || current_season === 'Winter') {
          factor = Math.max(factor, 1.25);
        }
        break;

      case 'Landscaping':
        // Spring/Summer peak
        if (current_season === 'Spring' || current_season === 'Summer') {
          factor = Math.max(factor, 1.30);
        } else if (current_season === 'Winter') {
          factor = Math.min(factor, 0.70);
        }
        break;

      case 'Roofing':
        // Spring/Summer/Fall peak
        if (current_season === 'Winter') {
          factor = Math.min(factor, 0.80);
        } else {
          factor = Math.max(factor, 1.15);
        }
        break;

      case 'Plumbing':
        // Winter peak (frozen pipes)
        if (current_season === 'Winter') {
          factor = Math.max(factor, 1.20);
        }
        break;
    }

    return factor;
  }

  /**
   * Analyze market signals
   */
  private static analyzeMarketSignals(
    signals: MarketSignal[],
    profile: ContractorProfile
  ): {
    demand_multiplier: number;
    trends_score?: number;
    permits_count?: number;
    competitor_ad_volume?: number;
    competitor_activity: 'low' | 'medium' | 'high';
    notable_signals: string[];
  } {
    if (signals.length === 0) {
      return {
        demand_multiplier: 1.0,
        competitor_activity: 'medium',
        notable_signals: []
      };
    }

    let demand_multiplier = 1.0;
    const notable_signals: string[] = [];

    // Analyze Google Trends signals
    const trends_signals = signals.filter(s => s.signal_type === 'google_trends');
    if (trends_signals.length > 0) {
      const avg_trend = this.average(trends_signals.map(s => s.signal_value));
      const trends_score = avg_trend;

      // High search volume = more demand
      if (avg_trend > 70) {
        demand_multiplier *= 1.15;
        notable_signals.push(`High search demand (${Math.round(avg_trend)}/100)`);
      } else if (avg_trend < 30) {
        demand_multiplier *= 0.95;
      }
    }

    // Analyze building permits
    const permit_signals = signals.filter(s => s.signal_type === 'building_permit');
    const permits_count = permit_signals.reduce((sum, s) => sum + s.signal_value, 0);

    if (permits_count > 20) {
      demand_multiplier *= 1.10;
      notable_signals.push(`${permits_count} new permits filed (opportunity)`);
    }

    // Analyze competitor ad activity
    const ad_signals = signals.filter(s => s.signal_type === 'competitor_ad');
    const competitor_ad_volume = ad_signals.reduce((sum, s) => sum + s.signal_value, 0);

    let competitor_activity: 'low' | 'medium' | 'high' = 'medium';
    if (competitor_ad_volume > 15) {
      competitor_activity = 'high';
      notable_signals.push('High competitor ad volume (more competition)');
    } else if (competitor_ad_volume < 5) {
      competitor_activity = 'low';
      demand_multiplier *= 1.05; // Less competition = opportunity
      notable_signals.push('Low competitor ad volume (opportunity)');
    }

    return {
      demand_multiplier,
      trends_score: trends_signals[0]?.signal_value,
      permits_count,
      competitor_ad_volume,
      competitor_activity,
      notable_signals
    };
  }

  /**
   * Calculate prediction confidence
   */
  private static calculateConfidence(
    historical_leads: WeeklyLeadSummary[],
    profile: ContractorProfile,
    signals: MarketSignal[]
  ): number {
    let confidence = 0.5; // Base confidence

    // More historical data = higher confidence
    if (historical_leads.length >= 12) confidence += 0.25;
    else if (historical_leads.length >= 8) confidence += 0.15;
    else if (historical_leads.length >= 4) confidence += 0.05;

    // Profile KPIs filled out = higher confidence
    if (profile.kpis?.leads_per_week) confidence += 0.10;

    // Market signals available = higher confidence
    if (signals.length >= 3) confidence += 0.10;
    else if (signals.length >= 1) confidence += 0.05;

    // Seasonal data = higher confidence
    if (profile.peak_seasons?.length > 0) confidence += 0.05;

    return Math.min(1.0, confidence);
  }

  /**
   * Generate top 3 recommended actions
   */
  private static generateRecommendedActions(
    profile: ContractorProfile,
    historical_analysis: any,
    market_analysis: any,
    predicted_leads: number
  ): RecommendedAction[] {
    const actions: RecommendedAction[] = [];

    // Action 1: Ready-to-run Facebook Ad (ALWAYS included)
    const facebook_ad = this.generateFacebookAd(profile, predicted_leads);
    actions.push(facebook_ad);

    // Action 2: Social media posts (if not heavily using social already)
    const social_action = this.generateSocialPostAction(profile);
    actions.push(social_action);

    // Action 3: Context-dependent
    // If trend is down, suggest follow-up campaign
    if (historical_analysis.trend === 'down') {
      const email_action = this.generateEmailCampaign(profile, 'follow_up');
      actions.push(email_action);
    }
    // If high competitor activity, suggest pricing test
    else if (market_analysis.competitor_activity === 'high') {
      const pricing_action = this.generatePricingTest(profile);
      actions.push(pricing_action);
    }
    // Default: email nurture campaign
    else {
      const email_action = this.generateEmailCampaign(profile, 'nurture');
      actions.push(email_action);
    }

    return actions.slice(0, 3); // Top 3
  }

  /**
   * Generate ready-to-run Facebook ad
   */
  private static generateFacebookAd(profile: ContractorProfile, predicted_leads: number): RecommendedAction {
    const industry = profile.primary_industry;
    const services = profile.service_types[0] || 'Service';
    const location = profile.service_area.cities[0] || 'your area';

    // Industry-specific ad copy
    let headline = '';
    let primary_text = '';

    switch (industry) {
      case 'HVAC':
        headline = `${services} — Same-Day Service in ${location}`;
        primary_text = `Local family-owned HVAC. Free estimate. 24/7 emergency service. Book your appointment today.`;
        break;
      case 'Plumbing':
        headline = `Expert Plumbers — Fast Response in ${location}`;
        primary_text = `Trusted local plumbing. No job too big or small. Free estimates. Call now for same-day service.`;
        break;
      case 'Roofing':
        headline = `Quality Roofing — Free Inspection in ${location}`;
        primary_text = `Local roofing experts. Storm damage? We work with insurance. Free roof inspection. Get your quote today.`;
        break;
      case 'Landscaping':
        headline = `Transform Your Yard — ${location} Landscaping Pros`;
        primary_text = `Award-winning landscaping. Design, installation, maintenance. Free consultation. See our before/after gallery.`;
        break;
      default:
        headline = `${services} Experts in ${location}`;
        primary_text = `Trusted local contractor. Quality work, fair prices. Free estimates. Contact us today.`;
    }

    // Calculate suggested budget (aim for 2-3 leads per $100 spent)
    const cost_per_lead_estimate = 35; // industry average
    const desired_additional_leads = Math.ceil(predicted_leads * 0.15); // 15% boost
    const suggested_budget = Math.max(100, desired_additional_leads * cost_per_lead_estimate);

    return {
      priority: 1,
      action_type: 'ad_campaign',
      title: 'Run Facebook Ad',
      description: `Launch targeted ad to reach ${profile.customer_types.join(' and ')} customers in ${location}`,
      details: {
        headline,
        primary_text,
        cta: 'Book Now',
        suggested_budget_weekly: suggested_budget,
        targeting: {
          location,
          radius_miles: profile.service_area.radius_miles,
          age_range: profile.customer_types.includes('residential') ? '30-65' : '35-65',
          interests: this.getTargetingInterests(industry)
        },
        image_suggestions: [
          'Truck with logo',
          'Team photo',
          'Before/after of recent job',
          'Customer testimonial graphic'
        ],
        ad_copy_variants: [
          {
            headline: headline.replace('—', '|'),
            primary_text: primary_text.replace('Free estimate', 'Special offer available')
          }
        ]
      },
      confidence: 'high',
      source: 'Proven ad format for contractor industry',
      estimated_impact: `+${desired_additional_leads}-${desired_additional_leads + 2} leads`
    };
  }

  /**
   * Generate social media post action
   */
  private static generateSocialPostAction(profile: ContractorProfile): RecommendedAction {
    const platforms: Array<'facebook' | 'instagram' | 'nextdoor' | 'linkedin'> = ['facebook'];

    if (profile.lead_sources.includes('instagram')) platforms.push('instagram');
    if (profile.lead_sources.includes('nextdoor')) platforms.push('nextdoor');

    return {
      priority: 2,
      action_type: 'social_post',
      title: 'Post before/after photos',
      description: `Share 3 recent job photos on ${platforms.join(', ')}`,
      details: {
        platforms,
        post_type: 'before_after',
        post_count: 3,
        post_templates: [
          {
            copy: `Check out this ${profile.service_types[0]} we completed last week! Proud of our team's work. 💪\n\nNeed help with your project? Call us for a free estimate.`,
            image_type: 'Before/After split',
            hashtags: [`#${profile.primary_industry}`, `#${profile.service_area.cities[0]}`, '#LocalBusiness']
          },
          {
            copy: `Another happy customer! We love seeing smiles after a job well done. ✨\n\nReady to start your project? Contact us today!`,
            image_type: 'Final result + customer',
            hashtags: [`#${profile.primary_industry}Pro`, '#CustomerService', '#QualityWork']
          },
          {
            copy: `This is why we do what we do. Transforming spaces, one project at a time. 🏠\n\nServing ${profile.service_area.cities.join(', ')} for [X] years.`,
            image_type: 'Completed project',
            hashtags: [`#${profile.service_area.cities[0]}Contractor`, '#LocallyOwned']
          }
        ],
        suggested_posting_schedule: 'Monday, Wednesday, Friday at 6pm'
      },
      confidence: 'high',
      source: 'Social proof drives engagement and referrals',
      estimated_impact: '+2-4 leads'
    };
  }

  /**
   * Generate email campaign action
   */
  private static generateEmailCampaign(
    profile: ContractorProfile,
    type: 'follow_up' | 'nurture'
  ): RecommendedAction {
    if (type === 'follow_up') {
      return {
        priority: 3,
        action_type: 'email_campaign',
        title: 'Send follow-up to last 50 leads',
        description: 'Re-engage leads who didn\'t convert yet',
        details: {
          campaign_type: 'follow_up',
          subject_line: `Still need ${profile.service_types[0]}? Special offer inside`,
          preview_text: 'We haven\'t heard back — here\'s 10% off to get started',
          email_body: `Hi [Name],\n\nWe reached out about your ${profile.service_types[0]} project a few weeks ago and wanted to check in.\n\nAs a local business in ${profile.service_area.cities[0]}, we're committed to providing quality work at fair prices.\n\n**Special offer:** Mention this email and get 10% off your project.\n\nReady to get started? Reply to this email or call [PHONE].\n\nBest regards,\n[YOUR COMPANY]`,
          target_segment: 'Last 50 leads who didn\'t convert',
          send_schedule: 'Send Tuesday morning (highest open rates)',
          expected_response_rate: 0.08
        },
        confidence: 'medium',
        source: 'Follow-ups convert 5-10% of lost leads',
        estimated_impact: '+2-5 leads'
      };
    } else {
      return {
        priority: 3,
        action_type: 'email_campaign',
        title: 'Send seasonal tips email',
        description: 'Stay top-of-mind with helpful content',
        details: {
          campaign_type: 'nurture',
          subject_line: `${this.getCurrentSeason(new Date())} ${profile.primary_industry} Tips from [YOUR COMPANY]`,
          preview_text: '3 things every homeowner should know',
          email_body: `Hi [Name],\n\nHere are 3 ${profile.primary_industry} tips for ${this.getCurrentSeason(new Date())}:\n\n1. [TIP 1 - industry specific]\n2. [TIP 2 - seasonal]\n3. [TIP 3 - maintenance]\n\nNeed help with any of these? We're here to help.\n\nCall us at [PHONE] or book online.\n\nBest,\n[YOUR COMPANY]`,
          target_segment: 'All past customers and leads',
          send_schedule: 'Send Friday afternoon',
          expected_response_rate: 0.05
        },
        confidence: 'medium',
        source: 'Educational content builds trust and referrals',
        estimated_impact: '+1-3 leads'
      };
    }
  }

  /**
   * Generate pricing test action
   */
  private static generatePricingTest(profile: ContractorProfile): RecommendedAction {
    return {
      priority: 3,
      action_type: 'pricing_test',
      title: 'Test diagnostic fee structure',
      description: 'A/B test free vs. paid diagnostic with credit',
      details: {
        test_type: 'a_b',
        variant_a: {
          name: 'Free Diagnostic',
          description: 'Free service call and estimate',
          price: 0
        },
        variant_b: {
          name: '$49 Diagnostic (waived on repair)',
          description: 'Paid diagnostic, full credit if customer books',
          price: 49
        },
        test_duration_days: 14,
        success_metric: 'Lead volume and conversion rate'
      },
      confidence: 'medium',
      source: 'Paid diagnostics filter serious leads and reduce no-shows',
      estimated_impact: 'Better lead quality, similar volume'
    };
  }

  // Helper methods

  private static average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private static getNextMonday(from: Date): Date {
    const date = new Date(from);
    const day = date.getDay();
    const diff = day === 0 ? 1 : 8 - day; // If Sunday, next day; else days until next Monday
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private static getCurrentSeason(date: Date): string {
    const month = date.getMonth(); // 0-11
    if (month >= 2 && month <= 4) return 'Spring'; // Mar-May
    if (month >= 5 && month <= 7) return 'Summer'; // Jun-Aug
    if (month >= 8 && month <= 10) return 'Fall'; // Sep-Nov
    return 'Winter'; // Dec-Feb
  }

  private static getTargetingInterests(industry: string): string[] {
    const interests: Record<string, string[]> = {
      HVAC: ['Home improvement', 'Home repair', 'Homeowner', 'Real estate'],
      Plumbing: ['Home improvement', 'DIY', 'Homeowner'],
      Roofing: ['Home improvement', 'Home repair', 'Storm preparation', 'Homeowner'],
      Landscaping: ['Gardening', 'Outdoor living', 'Home improvement', 'Homeowner'],
      Remodeling: ['Interior design', 'Home improvement', 'DIY', 'Real estate']
    };

    return interests[industry] || ['Home improvement', 'Homeowner'];
  }

  private static generateReasoning(
    predicted_leads: number,
    historical_analysis: any,
    seasonal_factor: number,
    market_analysis: any,
    profile: ContractorProfile
  ): string {
    const parts: string[] = [];

    parts.push(`Expecting ${predicted_leads} leads next week based on:`);

    // Historical
    if (historical_analysis.average_leads) {
      parts.push(`• ${Math.round(historical_analysis.average_leads)} avg leads over last 4 weeks`);
    }

    // Trend
    if (historical_analysis.trend === 'up') {
      parts.push(`• Upward trend (+${Math.abs(historical_analysis.trend_percentage).toFixed(0)}%)`);
    } else if (historical_analysis.trend === 'down') {
      parts.push(`• Downward trend (${historical_analysis.trend_percentage.toFixed(0)}%)`);
    }

    // Seasonal
    if (seasonal_factor !== 1.0) {
      const pct = ((seasonal_factor - 1.0) * 100).toFixed(0);
      parts.push(`• Seasonal adjustment: ${pct}% (${this.getCurrentSeason(new Date())})`);
    }

    // Market signals
    if (market_analysis.notable_signals.length > 0) {
      market_analysis.notable_signals.forEach((signal: string) => {
        parts.push(`• ${signal}`);
      });
    }

    return parts.join('\n');
  }
}
