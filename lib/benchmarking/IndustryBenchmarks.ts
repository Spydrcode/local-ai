import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * IndustryBenchmarks
 *
 * Provides industry-specific performance benchmarks, percentile comparisons,
 * and anonymized data aggregation for competitive context.
 */

interface BenchmarkMetric {
  metricName: string;
  unit: string;
  description: string;
  category:
    | "traffic"
    | "conversion"
    | "revenue"
    | "engagement"
    | "marketing"
    | "operations";
}

interface IndustryBenchmark {
  industry: string;
  businessStage: "startup" | "growth" | "established" | "enterprise";
  metric: string;
  statistics: {
    p10: number;
    p25: number;
    p50: number; // Median
    p75: number;
    p90: number;
    mean: number;
    sampleSize: number;
  };
  updatedAt: Date;
}

interface BenchmarkComparison {
  businessId: string;
  industry: string;
  stage: string;
  metrics: Array<{
    metric: string;
    yourValue: number;
    benchmarks: {
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
    };
    percentile: number; // Where you rank (0-100)
    performance:
      | "top_10"
      | "top_25"
      | "above_average"
      | "average"
      | "below_average";
    gap: number; // Difference from median
    insights: string[];
  }>;
  overallScore: number; // 0-100, composite score
  strengths: string[];
  improvementAreas: string[];
  generatedAt: Date;
}

interface BenchmarkInsight {
  metric: string;
  insight: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  potentialImpact: string;
}

const STANDARD_METRICS: BenchmarkMetric[] = [
  {
    metricName: "monthly_traffic",
    unit: "visitors",
    description: "Monthly website visitors",
    category: "traffic",
  },
  {
    metricName: "conversion_rate",
    unit: "percentage",
    description: "Visitor to customer conversion rate",
    category: "conversion",
  },
  {
    metricName: "average_order_value",
    unit: "dollars",
    description: "Average transaction value",
    category: "revenue",
  },
  {
    metricName: "customer_acquisition_cost",
    unit: "dollars",
    description: "Cost to acquire one customer",
    category: "marketing",
  },
  {
    metricName: "customer_lifetime_value",
    unit: "dollars",
    description: "Total value of a customer relationship",
    category: "revenue",
  },
  {
    metricName: "monthly_recurring_revenue",
    unit: "dollars",
    description: "Predictable monthly revenue",
    category: "revenue",
  },
  {
    metricName: "churn_rate",
    unit: "percentage",
    description: "Monthly customer churn rate",
    category: "engagement",
  },
  {
    metricName: "email_open_rate",
    unit: "percentage",
    description: "Email marketing open rate",
    category: "marketing",
  },
  {
    metricName: "social_engagement_rate",
    unit: "percentage",
    description: "Social media engagement rate",
    category: "marketing",
  },
  {
    metricName: "support_response_time",
    unit: "hours",
    description: "Average customer support response time",
    category: "operations",
  },
];

export class IndustryBenchmarks {
  /**
   * Compare business metrics to industry benchmarks
   */
  async compareToIndustry(
    businessId: string,
    industry: string,
    stage: "startup" | "growth" | "established" | "enterprise",
    metrics: Record<string, number>
  ): Promise<BenchmarkComparison> {
    // Get benchmarks for this industry and stage
    const benchmarks = await this.getBenchmarks(industry, stage);

    // Compare each metric
    const comparisons = [];

    for (const [metricName, value] of Object.entries(metrics)) {
      const benchmark = benchmarks.find((b) => b.metric === metricName);

      if (!benchmark) {
        console.warn(`No benchmark found for ${metricName} in ${industry}`);
        continue;
      }

      const percentile = this.calculatePercentile(value, benchmark.statistics);

      const performance = this.determinePerformance(percentile);

      const gap = value - benchmark.statistics.p50;

      const insights = this.generateMetricInsights(
        metricName,
        value,
        benchmark,
        percentile
      );

      comparisons.push({
        metric: metricName,
        yourValue: value,
        benchmarks: {
          p10: benchmark.statistics.p10,
          p25: benchmark.statistics.p25,
          p50: benchmark.statistics.p50,
          p75: benchmark.statistics.p75,
          p90: benchmark.statistics.p90,
        },
        percentile,
        performance,
        gap,
        insights,
      });
    }

    // Calculate overall score (average percentile across all metrics)
    const overallScore =
      comparisons.length > 0
        ? comparisons.reduce((sum, c) => sum + c.percentile, 0) /
          comparisons.length
        : 0;

    // Identify strengths (top 25% metrics)
    const strengths = comparisons
      .filter((c) => c.percentile >= 75)
      .map(
        (c) =>
          `${this.formatMetricName(c.metric)}: ${c.percentile}th percentile`
      );

    // Identify improvement areas (bottom 50% metrics)
    const improvementAreas = comparisons
      .filter((c) => c.percentile < 50)
      .sort((a, b) => a.percentile - b.percentile)
      .map(
        (c) =>
          `${this.formatMetricName(c.metric)}: ${c.percentile}th percentile (${Math.abs(c.gap).toFixed(1)}${this.getUnit(c.metric)} below median)`
      );

    const comparison: BenchmarkComparison = {
      businessId,
      industry,
      stage,
      metrics: comparisons,
      overallScore,
      strengths,
      improvementAreas,
      generatedAt: new Date(),
    };

    // Store comparison
    await this.storeComparison(comparison);

    return comparison;
  }

  /**
   * Get benchmarks for industry and stage
   */
  private async getBenchmarks(
    industry: string,
    stage: string
  ): Promise<IndustryBenchmark[]> {
    const { data: benchmarks } = await supabase
      .from("industry_benchmarks")
      .select("*")
      .eq("industry", industry)
      .eq("business_stage", stage);

    if (benchmarks && benchmarks.length > 0) {
      return benchmarks.map((b) => ({
        industry: b.industry,
        businessStage: b.business_stage,
        metric: b.metric_name,
        statistics: b.statistics,
        updatedAt: new Date(b.updated_at),
      }));
    }

    // If no data, generate from aggregated user data
    return await this.buildBenchmarksFromData(industry, stage);
  }

  /**
   * Build benchmarks from aggregated user data
   */
  private async buildBenchmarksFromData(
    industry: string,
    stage: string
  ): Promise<IndustryBenchmark[]> {
    const benchmarks: IndustryBenchmark[] = [];

    for (const metricDef of STANDARD_METRICS) {
      // In production, query anonymized business_metrics table
      // For now, use industry averages
      const stats = this.getDefaultStats(metricDef.metricName, industry);

      benchmarks.push({
        industry,
        businessStage: stage as any,
        metric: metricDef.metricName,
        statistics: stats,
        updatedAt: new Date(),
      });

      // Store benchmark
      await supabase.from("industry_benchmarks").upsert({
        industry,
        business_stage: stage,
        metric_name: metricDef.metricName,
        statistics: stats,
        updated_at: new Date(),
      });
    }

    return benchmarks;
  }

  /**
   * Get default statistics for a metric (industry averages)
   */
  private getDefaultStats(metricName: string, industry: string): any {
    // These are example values - in production, calculate from real data
    const defaults: Record<string, any> = {
      monthly_traffic: {
        p10: 500,
        p25: 2000,
        p50: 10000,
        p75: 50000,
        p90: 200000,
        mean: 52000,
        sampleSize: 100,
      },
      conversion_rate: {
        p10: 0.5,
        p25: 1.0,
        p50: 2.0,
        p75: 3.5,
        p90: 5.0,
        mean: 2.4,
        sampleSize: 100,
      },
      average_order_value: {
        p10: 25,
        p25: 50,
        p50: 100,
        p75: 200,
        p90: 500,
        mean: 175,
        sampleSize: 100,
      },
      customer_acquisition_cost: {
        p10: 10,
        p25: 25,
        p50: 50,
        p75: 100,
        p90: 200,
        mean: 77,
        sampleSize: 100,
      },
      customer_lifetime_value: {
        p10: 100,
        p25: 250,
        p50: 500,
        p75: 1000,
        p90: 2500,
        mean: 770,
        sampleSize: 100,
      },
      monthly_recurring_revenue: {
        p10: 1000,
        p25: 5000,
        p50: 20000,
        p75: 100000,
        p90: 500000,
        mean: 125000,
        sampleSize: 100,
      },
      churn_rate: {
        p10: 1,
        p25: 3,
        p50: 5,
        p75: 8,
        p90: 12,
        mean: 5.8,
        sampleSize: 100,
      },
      email_open_rate: {
        p10: 10,
        p25: 15,
        p50: 20,
        p75: 28,
        p90: 35,
        mean: 22,
        sampleSize: 100,
      },
      social_engagement_rate: {
        p10: 0.5,
        p25: 1.0,
        p50: 2.0,
        p75: 4.0,
        p90: 7.0,
        mean: 2.9,
        sampleSize: 100,
      },
      support_response_time: {
        p10: 0.5,
        p25: 1,
        p50: 2,
        p75: 6,
        p90: 24,
        mean: 6.5,
        sampleSize: 100,
      },
    };

    // Adjust for industry
    const industryMultipliers: Record<string, number> = {
      technology: 1.2,
      ecommerce: 1.0,
      saas: 1.3,
      healthcare: 0.8,
      finance: 0.9,
      retail: 1.0,
    };

    const multiplier = industryMultipliers[industry.toLowerCase()] || 1.0;
    const baseStats = defaults[metricName] || defaults.monthly_traffic;

    return {
      p10: baseStats.p10 * multiplier,
      p25: baseStats.p25 * multiplier,
      p50: baseStats.p50 * multiplier,
      p75: baseStats.p75 * multiplier,
      p90: baseStats.p90 * multiplier,
      mean: baseStats.mean * multiplier,
      sampleSize: baseStats.sampleSize,
    };
  }

  /**
   * Calculate percentile rank
   */
  private calculatePercentile(
    value: number,
    stats: { p10: number; p25: number; p50: number; p75: number; p90: number }
  ): number {
    if (value <= stats.p10) return 10;
    if (value <= stats.p25)
      return 10 + ((value - stats.p10) / (stats.p25 - stats.p10)) * 15;
    if (value <= stats.p50)
      return 25 + ((value - stats.p25) / (stats.p50 - stats.p25)) * 25;
    if (value <= stats.p75)
      return 50 + ((value - stats.p50) / (stats.p75 - stats.p50)) * 25;
    if (value <= stats.p90)
      return 75 + ((value - stats.p75) / (stats.p90 - stats.p75)) * 15;
    return 90 + Math.min(((value - stats.p90) / stats.p90) * 10, 10);
  }

  /**
   * Determine performance category
   */
  private determinePerformance(
    percentile: number
  ): "top_10" | "top_25" | "above_average" | "average" | "below_average" {
    if (percentile >= 90) return "top_10";
    if (percentile >= 75) return "top_25";
    if (percentile >= 50) return "above_average";
    if (percentile >= 25) return "average";
    return "below_average";
  }

  /**
   * Generate insights for a metric
   */
  private generateMetricInsights(
    metricName: string,
    value: number,
    benchmark: IndustryBenchmark,
    percentile: number
  ): string[] {
    const insights: string[] = [];

    const performance = this.determinePerformance(percentile);

    switch (performance) {
      case "top_10":
        insights.push(
          `Excellent performance - you're in the top 10% for ${this.formatMetricName(metricName)}`
        );
        insights.push(
          `This is a competitive advantage to leverage in marketing`
        );
        break;
      case "top_25":
        insights.push(
          `Strong performance - you're in the top 25% for ${this.formatMetricName(metricName)}`
        );
        insights.push(
          `Consider pushing to break into top 10% (${benchmark.statistics.p90}${this.getUnit(metricName)})`
        );
        break;
      case "above_average":
        insights.push(`Above average for ${this.formatMetricName(metricName)}`);
        insights.push(
          `Target the 75th percentile: ${benchmark.statistics.p75}${this.getUnit(metricName)}`
        );
        break;
      case "average":
        insights.push(
          `Average performance for ${this.formatMetricName(metricName)}`
        );
        insights.push(
          `Improvement opportunity: reach median (${benchmark.statistics.p50}${this.getUnit(metricName)})`
        );
        break;
      case "below_average":
        insights.push(
          `Below average for ${this.formatMetricName(metricName)} - priority improvement area`
        );
        insights.push(
          `Industry median is ${benchmark.statistics.p50}${this.getUnit(metricName)} vs your ${value}${this.getUnit(metricName)}`
        );
        break;
    }

    return insights;
  }

  /**
   * Generate actionable recommendations
   */
  async generateRecommendations(
    comparison: BenchmarkComparison
  ): Promise<BenchmarkInsight[]> {
    const insights: BenchmarkInsight[] = [];

    // Focus on bottom 3 metrics
    const weakestMetrics = comparison.metrics
      .filter((m) => m.percentile < 50)
      .sort((a, b) => a.percentile - b.percentile)
      .slice(0, 3);

    for (const metric of weakestMetrics) {
      const recommendation = this.getRecommendation(metric.metric, metric.gap);

      insights.push({
        metric: metric.metric,
        insight: metric.insights[0],
        recommendation: recommendation.action,
        priority: recommendation.priority,
        potentialImpact: recommendation.impact,
      });
    }

    return insights;
  }

  /**
   * Get specific recommendation for a metric
   */
  private getRecommendation(
    metricName: string,
    gap: number
  ): { action: string; priority: "high" | "medium" | "low"; impact: string } {
    const recommendations: Record<string, any> = {
      monthly_traffic: {
        action:
          "Invest in SEO and content marketing to increase organic traffic",
        priority: "high",
        impact:
          "More traffic typically correlates with higher revenue opportunities",
      },
      conversion_rate: {
        action:
          "Optimize landing pages, improve CTAs, and streamline checkout process",
        priority: "high",
        impact:
          "Even small conversion rate improvements significantly impact revenue",
      },
      average_order_value: {
        action: "Implement upselling, cross-selling, and bundle offers",
        priority: "medium",
        impact: "Increasing AOV is often easier than acquiring new customers",
      },
      customer_acquisition_cost: {
        action:
          "Optimize ad spend, improve targeting, focus on organic channels",
        priority: "high",
        impact: "Lower CAC directly improves profitability and scalability",
      },
      customer_lifetime_value: {
        action:
          "Improve retention programs, add subscription options, increase engagement",
        priority: "medium",
        impact: "Higher LTV enables more aggressive customer acquisition",
      },
      churn_rate: {
        action:
          "Implement proactive customer success, improve onboarding, add value features",
        priority: "high",
        impact: "Reducing churn compounds growth and improves unit economics",
      },
      email_open_rate: {
        action: "Test subject lines, segment lists, optimize send times",
        priority: "medium",
        impact: "Better email performance increases ROI of marketing efforts",
      },
    };

    return (
      recommendations[metricName] || {
        action: `Focus on improving ${this.formatMetricName(metricName)} to match industry standards`,
        priority: "medium",
        impact: "Aligning with benchmarks improves competitive positioning",
      }
    );
  }

  /**
   * Store comparison results
   */
  private async storeComparison(
    comparison: BenchmarkComparison
  ): Promise<void> {
    await supabase.from("benchmark_comparisons").insert({
      business_id: comparison.businessId,
      industry: comparison.industry,
      stage: comparison.stage,
      metrics: comparison.metrics,
      overall_score: comparison.overallScore,
      strengths: comparison.strengths,
      improvement_areas: comparison.improvementAreas,
      generated_at: comparison.generatedAt,
    });
  }

  /**
   * Submit business metrics to build benchmark database
   */
  async submitMetricsAnonymously(
    industry: string,
    stage: string,
    metrics: Record<string, number>
  ): Promise<void> {
    // Store anonymized metrics for benchmark building
    await supabase.from("anonymous_metrics").insert({
      industry,
      business_stage: stage,
      metrics,
      submitted_at: new Date(),
    });

    // Trigger benchmark recalculation (in background)
    this.recalculateBenchmarks(industry, stage).catch((err) => {
      console.error("Failed to recalculate benchmarks:", err);
    });
  }

  /**
   * Recalculate benchmarks from anonymized data
   */
  private async recalculateBenchmarks(
    industry: string,
    stage: string
  ): Promise<void> {
    const { data: submissions } = await supabase
      .from("anonymous_metrics")
      .select("metrics")
      .eq("industry", industry)
      .eq("business_stage", stage);

    if (!submissions || submissions.length < 5) {
      // Need minimum sample size
      return;
    }

    // Calculate percentiles for each metric
    for (const metricDef of STANDARD_METRICS) {
      const values = submissions
        .map((s) => s.metrics[metricDef.metricName])
        .filter((v) => v !== null && v !== undefined);

      if (values.length < 5) continue;

      values.sort((a, b) => a - b);

      const getPercentile = (p: number) => {
        const index = Math.floor(p * values.length);
        return values[Math.min(index, values.length - 1)];
      };

      const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

      const statistics = {
        p10: getPercentile(0.1),
        p25: getPercentile(0.25),
        p50: getPercentile(0.5),
        p75: getPercentile(0.75),
        p90: getPercentile(0.9),
        mean,
        sampleSize: values.length,
      };

      // Update benchmark
      await supabase.from("industry_benchmarks").upsert({
        industry,
        business_stage: stage,
        metric_name: metricDef.metricName,
        statistics,
        updated_at: new Date(),
      });
    }
  }

  /**
   * Format metric name for display
   */
  private formatMetricName(metricName: string): string {
    return metricName
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Get unit for metric
   */
  private getUnit(metricName: string): string {
    const metric = STANDARD_METRICS.find((m) => m.metricName === metricName);
    if (!metric) return "";

    switch (metric.unit) {
      case "percentage":
        return "%";
      case "dollars":
        return "$";
      case "hours":
        return "h";
      default:
        return "";
    }
  }

  /**
   * Get available industries
   */
  async getAvailableIndustries(): Promise<string[]> {
    const { data } = await supabase
      .from("industry_benchmarks")
      .select("industry")
      .order("industry");

    if (!data) return [];

    return [...new Set(data.map((d) => d.industry))];
  }

  /**
   * Get benchmark history (trend over time)
   */
  async getBenchmarkHistory(
    industry: string,
    stage: string,
    metricName: string,
    months: number = 12
  ): Promise<Array<{ date: Date; statistics: any }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data } = await supabase
      .from("industry_benchmarks")
      .select("statistics, updated_at")
      .eq("industry", industry)
      .eq("business_stage", stage)
      .eq("metric_name", metricName)
      .gte("updated_at", startDate.toISOString())
      .order("updated_at", { ascending: true });

    if (!data) return [];

    return data.map((d) => ({
      date: new Date(d.updated_at),
      statistics: d.statistics,
    }));
  }
}
