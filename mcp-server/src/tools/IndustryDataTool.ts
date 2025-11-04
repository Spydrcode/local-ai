/**
 * Industry Data Tool
 * Provides industry-specific benchmarks and best practices
 */

export interface IndustryBenchmarks {
  industry: string;
  avgConversionRate: string;
  avgResponseTime: string;
  keyMetrics: string[];
  bestPractices: string[];
  commonChallenges: string[];
}

/**
 * Gets industry benchmarks and best practices
 */
export function getIndustryData(industry: string): IndustryBenchmarks {
  // In production, this would query a database of industry benchmarks
  // For now, return generic structure that agents can use
  
  const industryLower = industry.toLowerCase();
  
  // Basic industry categorization
  if (industryLower.includes("restaurant") || industryLower.includes("food")) {
    return {
      industry,
      avgConversionRate: "2-5% for online orders",
      avgResponseTime: "Under 2 hours for inquiries",
      keyMetrics: ["Table turnover rate", "Average ticket size", "Online order %"],
      bestPractices: [
        "High-quality food photography",
        "Mobile-optimized menu",
        "Online ordering integration",
        "Customer reviews prominently displayed",
      ],
      commonChallenges: [
        "Standing out in crowded market",
        "Managing online reputation",
        "Balancing dine-in and delivery",
      ],
    };
  }
  
  // Default generic data
  return {
    industry,
    avgConversionRate: "2-5%",
    avgResponseTime: "24-48 hours",
    keyMetrics: ["Lead conversion", "Customer retention", "Average order value"],
    bestPractices: [
      "Clear value proposition",
      "Mobile-responsive design",
      "Fast page load times",
      "Trust signals (reviews, certifications)",
    ],
    commonChallenges: [
      "Differentiation from competitors",
      "Building trust online",
      "Converting visitors to customers",
    ],
  };
}
