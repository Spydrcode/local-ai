export interface ValueChainAnalysis {
  primaryActivities: {
    inbound: { current: string; costDriver: string; valueDriver: string };
    operations: { current: string; costDriver: string; valueDriver: string };
    outbound: { current: string; costDriver: string; valueDriver: string };
    marketing: { current: string; costDriver: string; valueDriver: string };
    service: { current: string; costDriver: string; valueDriver: string };
  };
  supportActivities: {
    infrastructure: string;
    hr: string;
    technology: string;
    procurement: string;
  };
}

export function analyzeValueChain(businessContent: string, industry: string): ValueChainAnalysis {
  const hasContent = businessContent && businessContent.length > 100;
  const industryLower = industry.toLowerCase();
  
  // Industry-specific analysis
  if (industryLower.includes('restaurant') || industryLower.includes('food')) {
    return {
      primaryActivities: {
        inbound: { current: "Food sourcing from suppliers", costDriver: "Ingredient costs (30-35% of revenue)", valueDriver: "Freshness and quality" },
        operations: { current: "Food preparation and cooking", costDriver: "Labor (25-30%) + kitchen overhead", valueDriver: "Taste, consistency, speed" },
        outbound: { current: "Dine-in service or delivery", costDriver: "Delivery fees, packaging", valueDriver: "Hot food, presentation" },
        marketing: { current: "Social media, local ads", costDriver: "Marketing budget (3-6%)", valueDriver: "Foot traffic, online orders" },
        service: { current: "Customer service, reservations", costDriver: "Front-of-house staff", valueDriver: "Experience, repeat visits" },
      },
      supportActivities: {
        infrastructure: "POS system, inventory management",
        hr: "Staff training, retention programs",
        technology: "Online ordering, reservation systems",
        procurement: "Supplier negotiations, bulk buying",
      },
    };
  }
  
  // Generic service business
  return {
    primaryActivities: {
      inbound: { current: hasContent ? "Materials/supplies acquisition" : "Supplier relationships", costDriver: "Material costs", valueDriver: "Quality inputs" },
      operations: { current: hasContent ? "Service delivery processes" : "Core operations", costDriver: "Labor + overhead", valueDriver: "Service quality" },
      outbound: { current: hasContent ? "Customer delivery/fulfillment" : "Delivery methods", costDriver: "Logistics costs", valueDriver: "Speed + reliability" },
      marketing: { current: hasContent ? "Lead generation channels" : "Customer acquisition", costDriver: "Marketing spend", valueDriver: "Brand awareness" },
      service: { current: hasContent ? "Customer support systems" : "Post-sale support", costDriver: "Support staff", valueDriver: "Customer retention" },
    },
    supportActivities: {
      infrastructure: hasContent ? "Business systems and processes" : "Management systems",
      hr: hasContent ? "Team development and culture" : "Team capabilities",
      technology: hasContent ? "Software and automation tools" : "Tools and automation",
      procurement: hasContent ? "Vendor and supplier management" : "Vendor management",
    },
  };
}
