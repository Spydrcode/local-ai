import { createClient } from "@supabase/supabase-js";
import { createAICompletion } from "../unified-ai-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * ROIPredictor
 *
 * Predicts ROI for recommendations using Monte Carlo simulations,
 * tracks actual results, and refines predictions over time.
 */

interface ROIPrediction {
  recommendationId: string;
  businessId: string;
  recommendation: {
    title: string;
    description: string;
    category: string;
  };
  prediction: {
    conservative: number;
    realistic: number;
    optimistic: number;
    expectedValue: number; // Weighted average
    confidence: number; // 0-1, based on data quality
  };
  timeframe: {
    months: number;
    breakEvenMonths?: number;
  };
  assumptions: Assumption[];
  riskFactors: RiskFactor[];
  simulation: SimulationResults;
  createdAt: Date;
}

interface Assumption {
  name: string;
  value: number;
  unit: string;
  source: "user_input" | "industry_average" | "ai_estimate" | "historical_data";
  confidence: number; // 0-1
}

interface RiskFactor {
  name: string;
  impact: "high" | "medium" | "low";
  probability: number; // 0-1
  mitigation: string;
}

interface SimulationResults {
  runs: number;
  distribution: {
    min: number;
    p10: number;
    p25: number;
    p50: number; // Median
    p75: number;
    p90: number;
    max: number;
    mean: number;
    stdDev: number;
  };
  probabilityOfProfit: number; // Chance of positive ROI
  probabilityOfBreakeven: number; // Chance of breaking even
}

interface ActualROI {
  predictionId: string;
  businessId: string;
  actualRevenue: number;
  actualCost: number;
  actualROI: number;
  timeframe: number; // Actual months to achieve
  notes?: string;
  recordedAt: Date;
}

interface PredictionAccuracy {
  predictionId: string;
  predictedROI: number;
  actualROI: number;
  accuracy: number; // 0-1, how close prediction was
  variance: number; // Absolute difference
  percentError: number; // Percentage error
  learnings: string[];
}

export class ROIPredictor {
  /**
   * Predict ROI for a recommendation
   */
  async predictROI(
    businessId: string,
    recommendationId: string,
    recommendation: {
      title: string;
      description: string;
      category: string;
      implementation?: {
        cost: number;
        timeMonths: number;
      };
    },
    businessContext: {
      currentRevenue: number;
      industry: string;
      stage: string;
      historicalGrowth?: number;
    }
  ): Promise<ROIPrediction> {
    // Generate assumptions using AI
    const assumptions = await this.generateAssumptions(
      recommendation,
      businessContext
    );

    // Identify risk factors
    const riskFactors = await this.identifyRiskFactors(
      recommendation,
      businessContext
    );

    // Run Monte Carlo simulation
    const simulation = await this.runMonteCarloSimulation(
      assumptions,
      riskFactors,
      businessContext
    );

    // Calculate scenarios
    const conservative = simulation.distribution.p25;
    const realistic = simulation.distribution.p50;
    const optimistic = simulation.distribution.p75;

    // Calculate expected value (probability-weighted)
    const expectedValue = simulation.distribution.mean;

    // Determine confidence based on data quality
    const confidence = this.calculateConfidence(assumptions, businessContext);

    // Calculate breakeven time
    const implementationCost = recommendation.implementation?.cost || 0;
    const breakEvenMonths =
      implementationCost > 0
        ? this.calculateBreakEvenTime(
            implementationCost,
            simulation,
            assumptions
          )
        : undefined;

    const prediction: ROIPrediction = {
      recommendationId,
      businessId,
      recommendation: {
        title: recommendation.title,
        description: recommendation.description,
        category: recommendation.category,
      },
      prediction: {
        conservative,
        realistic,
        optimistic,
        expectedValue,
        confidence,
      },
      timeframe: {
        months: recommendation.implementation?.timeMonths || 12,
        breakEvenMonths,
      },
      assumptions,
      riskFactors,
      simulation,
      createdAt: new Date(),
    };

    // Store prediction
    await this.storePrediction(prediction);

    return prediction;
  }

  /**
   * Generate assumptions for the prediction
   */
  private async generateAssumptions(
    recommendation: any,
    context: any
  ): Promise<Assumption[]> {
    const prompt = `Analyze this business recommendation and generate key assumptions for ROI calculation.

Business: ${context.stage} ${context.industry} company
Current Revenue: $${context.currentRevenue}/month
Recommendation: ${recommendation.title}
Description: ${recommendation.description}

Generate 5-8 key assumptions needed to predict ROI, such as:
- Conversion rates
- Customer acquisition costs
- Average order value
- Retention rates
- Implementation timeline
- Market size/demand

For each assumption, provide:
- Name
- Estimated value
- Unit (%, $, months, etc.)
- Confidence level (0-1)

Return JSON array of assumptions.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst generating realistic business assumptions. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 1500,
      jsonMode: true,
    });

    const data = JSON.parse(completion || '{"assumptions": []}');

    return (data.assumptions || []).map((a: any) => ({
      name: a.name,
      value: a.value,
      unit: a.unit,
      source: "ai_estimate" as const,
      confidence: a.confidence || 0.6,
    }));
  }

  /**
   * Identify risk factors
   */
  private async identifyRiskFactors(
    recommendation: any,
    context: any
  ): Promise<RiskFactor[]> {
    const prompt = `Identify potential risks for implementing this recommendation.

Business: ${context.stage} ${context.industry} company
Recommendation: ${recommendation.title}
Description: ${recommendation.description}

Identify 3-5 key risks such as:
- Market risks (competition, demand changes)
- Execution risks (technical challenges, resource constraints)
- Financial risks (costs overruns, revenue shortfalls)
- External risks (regulatory, economic)

For each risk, provide:
- Name
- Impact (high/medium/low)
- Probability (0-1)
- Mitigation strategy

Return JSON array of risks.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a risk analyst identifying business risks. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      maxTokens: 1200,
      jsonMode: true,
    });

    const data = JSON.parse(completion || '{"risks": []}');

    return (data.risks || []).map((r: any) => ({
      name: r.name,
      impact: r.impact || "medium",
      probability: r.probability || 0.3,
      mitigation: r.mitigation || "Monitor and adjust strategy as needed",
    }));
  }

  /**
   * Run Monte Carlo simulation
   */
  private async runMonteCarloSimulation(
    assumptions: Assumption[],
    riskFactors: RiskFactor[],
    context: any,
    runs: number = 1000
  ): Promise<SimulationResults> {
    const results: number[] = [];

    for (let i = 0; i < runs; i++) {
      // Sample each assumption with variance
      const sampledAssumptions: Record<string, number> = {};

      for (const assumption of assumptions) {
        // Add randomness based on confidence
        // Lower confidence = higher variance
        const variance = (1 - assumption.confidence) * 0.5;
        const randomFactor = 1 + (Math.random() - 0.5) * 2 * variance;
        sampledAssumptions[assumption.name] = assumption.value * randomFactor;
      }

      // Apply risk factors randomly
      let riskMultiplier = 1.0;
      for (const risk of riskFactors) {
        if (Math.random() < risk.probability) {
          // Risk occurs
          const impactMultipliers = { high: 0.7, medium: 0.85, low: 0.95 };
          riskMultiplier *= impactMultipliers[risk.impact];
        }
      }

      // Calculate ROI for this simulation run
      const roi =
        this.calculateROIFromAssumptions(sampledAssumptions, context) *
        riskMultiplier;

      results.push(roi);
    }

    // Sort for percentile calculations
    results.sort((a, b) => a - b);

    // Calculate statistics
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const variance =
      results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      results.length;
    const stdDev = Math.sqrt(variance);

    const getPercentile = (p: number) => {
      const index = Math.floor(p * results.length);
      return results[Math.min(index, results.length - 1)];
    };

    const profitCount = results.filter((r) => r > 0).length;
    const breakEvenCount = results.filter(
      (r) => r >= -1000 && r <= 1000
    ).length;

    return {
      runs,
      distribution: {
        min: results[0],
        p10: getPercentile(0.1),
        p25: getPercentile(0.25),
        p50: getPercentile(0.5),
        p75: getPercentile(0.75),
        p90: getPercentile(0.9),
        max: results[results.length - 1],
        mean,
        stdDev,
      },
      probabilityOfProfit: profitCount / results.length,
      probabilityOfBreakeven: breakEvenCount / results.length,
    };
  }

  /**
   * Calculate ROI from sampled assumptions
   */
  private calculateROIFromAssumptions(
    assumptions: Record<string, number>,
    context: any
  ): number {
    // This is a simplified calculation - in production, you'd have
    // more sophisticated formulas based on the specific recommendation type

    // Extract common assumptions
    const conversionRate =
      assumptions["Conversion Rate"] || assumptions["conversion_rate"] || 0.02;
    const avgOrderValue =
      assumptions["Average Order Value"] ||
      assumptions["aov"] ||
      context.currentRevenue * 0.1;
    const customerLifetimeMonths =
      assumptions["Customer Lifetime"] || assumptions["ltv_months"] || 12;
    const monthlyTraffic =
      assumptions["Monthly Traffic"] || assumptions["traffic"] || 1000;
    const implementationCost =
      assumptions["Implementation Cost"] || assumptions["cost"] || 5000;

    // Calculate revenue
    const monthlyCustomers = monthlyTraffic * conversionRate;
    const monthlyRevenue = monthlyCustomers * avgOrderValue;
    const totalRevenue = monthlyRevenue * customerLifetimeMonths;

    // Calculate ROI
    const roi = totalRevenue - implementationCost;

    return roi;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(assumptions: Assumption[], context: any): number {
    // Average assumption confidence
    const avgAssumptionConfidence =
      assumptions.length > 0
        ? assumptions.reduce((sum, a) => sum + a.confidence, 0) /
          assumptions.length
        : 0.5;

    // Boost confidence if we have historical data
    const historicalDataBonus = context.historicalGrowth ? 0.2 : 0;

    // Industry maturity affects confidence
    const matureIndustries = ["retail", "healthcare", "finance"];
    const industryBonus = matureIndustries.includes(
      context.industry.toLowerCase()
    )
      ? 0.1
      : 0;

    const confidence = Math.min(
      1,
      avgAssumptionConfidence + historicalDataBonus + industryBonus
    );

    return confidence;
  }

  /**
   * Calculate break-even time
   */
  private calculateBreakEvenTime(
    implementationCost: number,
    simulation: SimulationResults,
    assumptions: Assumption[]
  ): number {
    // Estimate monthly benefit from median ROI
    const totalROI = simulation.distribution.p50;
    const timeframeMonths = 12; // Default assumption
    const monthlyBenefit = totalROI / timeframeMonths;

    if (monthlyBenefit <= 0) {
      return Infinity; // Never breaks even
    }

    return Math.ceil(implementationCost / monthlyBenefit);
  }

  /**
   * Store prediction in database
   */
  private async storePrediction(prediction: ROIPrediction): Promise<void> {
    await supabase.from("roi_tracking").insert({
      recommendation_id: prediction.recommendationId,
      business_id: prediction.businessId,
      recommendation_data: prediction.recommendation,
      predicted_conservative: prediction.prediction.conservative,
      predicted_realistic: prediction.prediction.realistic,
      predicted_optimistic: prediction.prediction.optimistic,
      expected_value: prediction.prediction.expectedValue,
      confidence: prediction.prediction.confidence,
      timeframe_months: prediction.timeframe.months,
      breakeven_months: prediction.timeframe.breakEvenMonths,
      assumptions: prediction.assumptions,
      risk_factors: prediction.riskFactors,
      simulation_results: prediction.simulation,
      created_at: prediction.createdAt,
    });
  }

  /**
   * Record actual ROI results
   */
  async recordActualROI(
    predictionId: string,
    actualData: {
      revenue: number;
      cost: number;
      timeframeMonths: number;
      notes?: string;
    }
  ): Promise<ActualROI> {
    const { data: prediction } = await supabase
      .from("roi_tracking")
      .select("*")
      .eq("recommendation_id", predictionId)
      .single();

    if (!prediction) {
      throw new Error("Prediction not found");
    }

    const actualROI: ActualROI = {
      predictionId,
      businessId: prediction.business_id,
      actualRevenue: actualData.revenue,
      actualCost: actualData.cost,
      actualROI: actualData.revenue - actualData.cost,
      timeframe: actualData.timeframeMonths,
      notes: actualData.notes,
      recordedAt: new Date(),
    };

    // Update the prediction record with actual data
    await supabase
      .from("roi_tracking")
      .update({
        actual_revenue: actualROI.actualRevenue,
        actual_cost: actualROI.actualCost,
        actual_roi: actualROI.actualROI,
        actual_timeframe: actualROI.timeframe,
        actual_notes: actualROI.notes,
        actual_recorded_at: actualROI.recordedAt,
      })
      .eq("recommendation_id", predictionId);

    // Analyze accuracy and learn
    await this.analyzePredictionAccuracy(predictionId);

    return actualROI;
  }

  /**
   * Analyze prediction accuracy
   */
  private async analyzePredictionAccuracy(
    predictionId: string
  ): Promise<PredictionAccuracy> {
    const { data: record } = await supabase
      .from("roi_tracking")
      .select("*")
      .eq("recommendation_id", predictionId)
      .single();

    if (!record || record.actual_roi === null) {
      throw new Error("No actual ROI data available");
    }

    const predictedROI = record.expected_value;
    const actualROI = record.actual_roi;

    const variance = Math.abs(predictedROI - actualROI);
    const percentError =
      predictedROI !== 0 ? (variance / Math.abs(predictedROI)) * 100 : 100;

    // Accuracy score: 1.0 = perfect, 0.0 = completely wrong
    const accuracy = Math.max(0, 1 - percentError / 100);

    // Generate learnings based on the discrepancy
    const learnings = await this.generateLearnings(
      record,
      predictedROI,
      actualROI
    );

    const accuracyAnalysis: PredictionAccuracy = {
      predictionId,
      predictedROI,
      actualROI,
      accuracy,
      variance,
      percentError,
      learnings,
    };

    // Store accuracy analysis
    await supabase
      .from("roi_tracking")
      .update({
        accuracy_score: accuracy,
        variance: variance,
        percent_error: percentError,
        learnings: learnings,
      })
      .eq("recommendation_id", predictionId);

    return accuracyAnalysis;
  }

  /**
   * Generate learnings from prediction vs actual
   */
  private async generateLearnings(
    record: any,
    predictedROI: number,
    actualROI: number
  ): Promise<string[]> {
    const learnings: string[] = [];

    const difference = actualROI - predictedROI;
    const percentDiff =
      predictedROI !== 0 ? (difference / predictedROI) * 100 : 0;

    if (Math.abs(percentDiff) < 20) {
      learnings.push("Prediction was highly accurate (within 20%)");
    } else if (difference > 0) {
      learnings.push(
        `Actual ROI exceeded prediction by ${percentDiff.toFixed(1)}%`
      );

      // Analyze why it was better than expected
      if (record.actual_timeframe < record.timeframe_months) {
        learnings.push("Implementation was faster than expected");
      }
      learnings.push(
        "Consider increasing confidence for similar recommendations"
      );
    } else {
      learnings.push(
        `Actual ROI fell short of prediction by ${Math.abs(percentDiff).toFixed(1)}%`
      );

      // Analyze why it underperformed
      if (record.actual_timeframe > record.timeframe_months) {
        learnings.push("Implementation took longer than expected");
      }
      if (record.actual_cost > record.assumptions?.[0]?.value) {
        learnings.push("Costs were higher than assumed");
      }
      learnings.push(
        "Consider more conservative assumptions for similar recommendations"
      );
    }

    return learnings;
  }

  /**
   * Get prediction accuracy statistics for a business
   */
  async getPredictionAccuracy(businessId: string): Promise<{
    totalPredictions: number;
    predictionsWithActuals: number;
    avgAccuracy: number;
    avgPercentError: number;
    bestPrediction: any;
    worstPrediction: any;
  }> {
    const { data: records } = await supabase
      .from("roi_tracking")
      .select("*")
      .eq("business_id", businessId);

    if (!records || records.length === 0) {
      return {
        totalPredictions: 0,
        predictionsWithActuals: 0,
        avgAccuracy: 0,
        avgPercentError: 0,
        bestPrediction: null,
        worstPrediction: null,
      };
    }

    const withActuals = records.filter((r) => r.actual_roi !== null);

    const avgAccuracy =
      withActuals.length > 0
        ? withActuals.reduce((sum, r) => sum + (r.accuracy_score || 0), 0) /
          withActuals.length
        : 0;

    const avgPercentError =
      withActuals.length > 0
        ? withActuals.reduce((sum, r) => sum + (r.percent_error || 0), 0) /
          withActuals.length
        : 0;

    const sortedByAccuracy = [...withActuals].sort(
      (a, b) => (b.accuracy_score || 0) - (a.accuracy_score || 0)
    );

    return {
      totalPredictions: records.length,
      predictionsWithActuals: withActuals.length,
      avgAccuracy,
      avgPercentError,
      bestPrediction: sortedByAccuracy[0] || null,
      worstPrediction: sortedByAccuracy[sortedByAccuracy.length - 1] || null,
    };
  }

  /**
   * Get all predictions for a business
   */
  async getPredictions(
    businessId: string,
    options?: {
      includeActuals?: boolean;
      sortBy?: "created_at" | "expected_value" | "confidence";
      limit?: number;
    }
  ): Promise<ROIPrediction[]> {
    let query = supabase
      .from("roi_tracking")
      .select("*")
      .eq("business_id", businessId);

    if (options?.includeActuals) {
      query = query.not("actual_roi", "is", null);
    }

    if (options?.sortBy) {
      query = query.order(options.sortBy, { ascending: false });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: records } = await query;

    if (!records) return [];

    return records.map((r) => this.recordToPrediction(r));
  }

  /**
   * Convert database record to ROIPrediction
   */
  private recordToPrediction(record: any): ROIPrediction {
    return {
      recommendationId: record.recommendation_id,
      businessId: record.business_id,
      recommendation: record.recommendation_data,
      prediction: {
        conservative: record.predicted_conservative,
        realistic: record.predicted_realistic,
        optimistic: record.predicted_optimistic,
        expectedValue: record.expected_value,
        confidence: record.confidence,
      },
      timeframe: {
        months: record.timeframe_months,
        breakEvenMonths: record.breakeven_months,
      },
      assumptions: record.assumptions,
      riskFactors: record.risk_factors,
      simulation: record.simulation_results,
      createdAt: new Date(record.created_at),
    };
  }
}
