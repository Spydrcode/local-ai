export interface ProfitPool {
  segments: Array<{
    name: string;
    margin: "high" | "medium" | "low";
    volume: "high" | "medium" | "low";
    classification: "star" | "cash_cow" | "question_mark" | "dog";
  }>;
  opportunities: Array<{
    segment: string;
    estimatedMargin: string;
    rationale: string;
  }>;
}

export function mapProfitPools(businessContent: string, industry: string): ProfitPool {
  const industryLower = industry.toLowerCase();
  
  if (industryLower.includes('restaurant') || industryLower.includes('food')) {
    return {
      segments: [
        { name: "Dine-in meals", margin: "medium", volume: "high", classification: "star" },
        { name: "Catering/events", margin: "high", volume: "low", classification: "cash_cow" },
        { name: "Delivery orders", margin: "low", volume: "medium", classification: "question_mark" },
        { name: "Alcohol sales", margin: "high", volume: "medium", classification: "star" },
      ],
      opportunities: [
        { segment: "Private dining/events", estimatedMargin: "45-55%", rationale: "Premium pricing, pre-paid, minimal waste" },
        { segment: "Meal kits/retail products", estimatedMargin: "50-60%", rationale: "Brand extension with high margins" },
        { segment: "Loyalty program upsells", estimatedMargin: "35-40%", rationale: "Incremental revenue from existing customers" },
      ],
    };
  }
  
  return {
    segments: [
      { name: "Standard service", margin: "medium", volume: "high", classification: "star" },
      { name: "Premium/rush service", margin: "high", volume: "low", classification: "cash_cow" },
      { name: "Entry-level offering", margin: "low", volume: "medium", classification: "question_mark" },
    ],
    opportunities: [
      { segment: "Recurring contracts", estimatedMargin: "40-50%", rationale: "Predictable revenue, lower acquisition cost" },
      { segment: "Add-on services", estimatedMargin: "45-55%", rationale: "Incremental to existing customers" },
      { segment: "Premium tier", estimatedMargin: "50-60%", rationale: "Value-based pricing for specialized service" },
    ],
  };
}
