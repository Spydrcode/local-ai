/**
 * AI Output Validation System
 *
 * Ensures AI agents generate business-specific content, not generic templates
 */

// Generic phrases that indicate AI failed to analyze the specific business
const FORBIDDEN_GENERIC_PHRASES = [
  "boost your online presence",
  "enhance your social media",
  "improve your seo",
  "increase engagement",
  "build brand awareness",
  "leverage digital marketing",
  "optimize your website",
  "grow your business",
  "reach more customers",
  "stand out from the competition",
  "take your business to the next level",
  "unlock your potential",
  "we're passionate about",
  "industry-leading solutions",
  "best-in-class service",
  "your success is our priority",
  "trusted by thousands",
  "delivering excellence",
  "quality you can trust",
  "experience the difference",
  "welcome to",
  "your trusted partner",
  "committed to excellence",
  "our mission is",
  "we believe in",
];

// Generic section titles that indicate lazy AI output
const FORBIDDEN_GENERIC_SECTIONS = [
  "about us",
  "our story",
  "why choose us",
  "our services",
  "what we offer",
  "our products",
  "testimonials",
  "contact us",
  "get in touch",
  "our team",
  "meet the team",
  "our values",
  "our mission",
];

// Vague adjectives that don't provide specific information
const FORBIDDEN_VAGUE_ADJECTIVES = [
  "quality",
  "excellent",
  "great",
  "amazing",
  "fantastic",
  "superior",
  "premium", // unless justified with specifics
  "best",
  "top",
  "leading",
  "trusted",
  "reliable", // unless backed by specifics like "24/7 service"
];

/**
 * Validates that content is business-specific, not generic
 */
export function validateBusinessSpecificity(
  content: string,
  businessContext: string
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const contentLower = content.toLowerCase();
  const contextLower = businessContext.toLowerCase();

  // Check for forbidden generic phrases
  const foundGenericPhrases = FORBIDDEN_GENERIC_PHRASES.filter((phrase) =>
    contentLower.includes(phrase.toLowerCase())
  );
  if (foundGenericPhrases.length > 0) {
    issues.push(
      `Contains ${foundGenericPhrases.length} generic marketing phrases`
    );
    suggestions.push(
      `Replace phrases like "${foundGenericPhrases.slice(0, 2).join('", "')}" with specific details about the business's actual offerings`
    );
  }

  // Extract business details from context
  const hasSpecificProducts = extractSpecificProducts(contextLower);
  const hasPricing = contextLower.includes("$") || /\d+/.test(contextLower);
  const hasLocation =
    /\b(serving|located|in|near|[A-Z][a-z]+,?\s+[A-Z]{2})\b/.test(
      businessContext
    );
  const hasCredentials =
    /(certified|award|years?|licensed|champion|master)/i.test(businessContext);

  // Check if content references these specifics
  if (
    hasSpecificProducts &&
    !containsSpecificReferences(content, businessContext)
  ) {
    issues.push(
      "Does not reference actual products/services from business context"
    );
    suggestions.push(
      'Mention specific offerings by name (e.g., "14-hour brisket", "LP tank exchange", "single-origin Ethiopian")'
    );
  }

  if (hasPricing && !content.includes("$")) {
    issues.push(
      "Business has pricing info but generated content doesn't include any prices"
    );
    suggestions.push(
      'Include specific pricing to demonstrate you analyzed this business (e.g., "$25 tank exchange", "$12/person catering")'
    );
  }

  if (hasLocation && !containsLocationReference(content, businessContext)) {
    issues.push("Does not reference geographic service area");
    suggestions.push(
      "Mention specific location/service area to show local relevance"
    );
  }

  if (
    hasCredentials &&
    !containsCredentialReference(content, businessContext)
  ) {
    issues.push("Business has credentials but content doesn't mention them");
    suggestions.push(
      'Reference specific credentials (e.g., "20 years experience", "state champion", "EPA certified")'
    );
  }

  // Check for specificity in numbers
  const numberCount = (content.match(/\d+/g) || []).length;
  if (numberCount < 3) {
    issues.push(
      "Lacks specific numbers (years, prices, quantities, percentages)"
    );
    suggestions.push(
      'Add quantifiable details (e.g., "14-hour smoking", "$25 tanks", "3x state champion", "serving 50+ mile radius")'
    );
  }

  // Check content length for depth
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 100) {
    issues.push("Content too brief to demonstrate deep business analysis");
    suggestions.push(
      "Expand with more specific details about methods, processes, or differentiators"
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

function extractSpecificProducts(context: string): boolean {
  // Look for specific product/service names (proper nouns, branded items, specific offerings)
  const specificPatterns = [
    /\b[A-Z][a-z]+\s+(brisket|pork|ribs|sausage|chicken)\b/, // Specific BBQ items
    /\b(LP|propane)\s+(tank|delivery|exchange)\b/, // Specific propane services
    /\b(single-origin|espresso|pour-over|roast)\b/, // Specific coffee terms
    /\b\d+-hour\b/, // Time-based processes
    /\b(emergency|same-day|24\/7)\s+(service|delivery)\b/, // Specific service models
  ];

  return specificPatterns.some((pattern) => pattern.test(context));
}

function containsSpecificReferences(content: string, context: string): boolean {
  // Extract potential product/service names from context
  const contextWords = context.toLowerCase().split(/\s+/);
  const contentLower = content.toLowerCase();

  // Look for industry-specific terminology from context appearing in content
  const industryTerms = [
    "brisket",
    "ribs",
    "pulled pork",
    "smoked",
    "pit",
    "catering",
    "propane",
    "tank",
    "delivery",
    "emergency",
    "refill",
    "coffee",
    "roast",
    "beans",
    "espresso",
    "single-origin",
    "certified",
    "licensed",
    "insured",
    "award",
  ];

  const contextIndustryTerms = industryTerms.filter((term) =>
    contextWords.includes(term)
  );
  const contentHasTerms = contextIndustryTerms.some((term) =>
    contentLower.includes(term)
  );

  return contentHasTerms;
}

function containsLocationReference(content: string, context: string): boolean {
  // Extract location mentions from context
  const locationPattern =
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s+([A-Z]{2})\b/g;
  const contextLocations = context.match(locationPattern) || [];

  if (contextLocations.length === 0) return true; // No location in context, so ok

  // Check if any location appears in content
  return contextLocations.some((loc) =>
    content.toLowerCase().includes(loc.toLowerCase())
  );
}

function containsCredentialReference(
  content: string,
  context: string
): boolean {
  const credentialPatterns = [
    /\d+\+?\s*years?/,
    /certified/i,
    /licensed/i,
    /award/i,
    /champion/i,
    /master/i,
    /family-owned/i,
    /since\s+\d{4}/,
  ];

  const contextHasCredentials = credentialPatterns.some((pattern) =>
    pattern.test(context)
  );

  if (!contextHasCredentials) return true; // No credentials in context

  const contentHasCredentials = credentialPatterns.some((pattern) =>
    pattern.test(content)
  );

  return contentHasCredentials;
}

/**
 * Validates homepage blueprint for business specificity
 */
export function validateHomepageBlueprint(
  blueprint: any,
  businessContext: string
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // Validate hero
  if (blueprint.hero) {
    const heroHeadline = blueprint.hero.headline?.toLowerCase() || "";
    const heroSub = blueprint.hero.subheadline?.toLowerCase() || "";

    if (
      heroHeadline.includes("welcome to") ||
      heroHeadline.includes("your trusted") ||
      heroHeadline.includes("experience the")
    ) {
      issues.push("Hero headline uses generic template language");
      suggestions.push(
        'Hero should lead with specific differentiator (e.g., "14-Hour Smoked BBQ" not "Welcome to Joe\'s BBQ")'
      );
    }

    if (!blueprint.hero.ctaLabel || blueprint.hero.ctaLabel.length === 0) {
      issues.push("Missing CTA button label");
    } else if (
      ["learn more", "read more", "click here", "get started"].includes(
        blueprint.hero.ctaLabel.toLowerCase()
      )
    ) {
      issues.push("CTA uses generic button text");
      suggestions.push(
        'CTA should be action-specific (e.g., "Order Catering", "Schedule Delivery", "Book Appointment")'
      );
    }
  }

  // Validate sections
  if (blueprint.sections && Array.isArray(blueprint.sections)) {
    const sectionTitles = blueprint.sections.map(
      (s: any) => s.title?.toLowerCase() || ""
    );

    const genericSections = FORBIDDEN_GENERIC_SECTIONS.filter((forbidden) =>
      sectionTitles.some(
        (title: string) => title === forbidden || title.includes(forbidden)
      )
    );

    if (genericSections.length > 0) {
      issues.push(`Contains ${genericSections.length} generic section titles`);
      suggestions.push(
        `Replace "${genericSections[0]}" with business-specific sections (e.g., "14-Hour Smoking Process", "Same-Day Emergency Service", "Fresh Roasted Twice Weekly")`
      );
    }

    // Check if sections are business-specific
    const hasSpecificSections = blueprint.sections.some((section: any) => {
      const title = section.title?.toLowerCase() || "";
      const body = section.body?.toLowerCase() || "";
      const combined = title + " " + body;

      // Look for specificity indicators
      return (
        combined.includes("hour") ||
        /\d+/.test(combined) ||
        combined.includes("same-day") ||
        combined.includes("emergency") ||
        combined.includes("certified") ||
        combined.includes("award") ||
        combined.includes("$")
      );
    });

    if (!hasSpecificSections) {
      issues.push(
        "All sections appear generic without specific business details"
      );
      suggestions.push(
        "Each section should include specific processes, timing, pricing, or credentials"
      );
    }
  }

  // Validate colors
  if (blueprint.style) {
    if (
      !blueprint.style.primaryColor ||
      !blueprint.style.primaryColor.startsWith("#")
    ) {
      issues.push("Missing or invalid primary color");
    }
    if (
      !blueprint.style.accentColor ||
      !blueprint.style.accentColor.startsWith("#")
    ) {
      issues.push("Missing or invalid accent color");
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Validates profit insights for specificity
 */
export function validateProfitInsights(
  insights: string,
  businessContext: string
): {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  const insightsLower = insights.toLowerCase();

  // Check for action items with specificity (look for bullet points or numbered lists)
  const bulletPoints = insights.match(/[-•*]\s*[A-Z]/g)?.length || 0;
  const numberedItems = insights.match(/^\d+\.\s+[A-Z]/gm)?.length || 0;
  const actionVerbs =
    insights.match(
      /\b(Add|Create|Feature|Showcase|Implement|Launch|Build|Optimize|Integrate|Update|Highlight)\s+[a-z]/gi
    )?.length || 0;

  const totalActionableItems = Math.max(
    bulletPoints,
    numberedItems,
    actionVerbs
  );

  if (totalActionableItems < 3) {
    issues.push("Lacks sufficient actionable recommendations");
    suggestions.push(
      "Provide at least 3-4 specific action items formatted as bullet points (e.g., '- Add [specific feature]', '- Feature [specific product]') with implementation details"
    );
  }

  // Check for competitive references
  const hasCompetitiveAnalysis =
    insightsLower.includes("competitor") ||
    insightsLower.includes("compared to") ||
    insightsLower.includes("unlike") ||
    insightsLower.includes("vs") ||
    insightsLower.includes("better than");

  if (!hasCompetitiveAnalysis) {
    issues.push("Lacks competitive analysis or differentiation insights");
    suggestions.push(
      "Compare to typical competitors and identify specific advantages or gaps"
    );
  }

  // Check for metrics or numbers
  const hasMetrics = /\d+%|\$\d+|\d+x|\d+-\d+/.test(insights);
  if (!hasMetrics) {
    issues.push("Lacks quantified impact or metrics");
    suggestions.push(
      'Include specific numbers (e.g., "35% higher average ticket", "$2.89/gallon", "4-hour response time")'
    );
  }

  return {
    isValid: issues.length === 0,
    issues,
    suggestions,
  };
}

/**
 * Main validation orchestrator
 */
export async function validateAIOutput(
  outputType: "homepage" | "insights" | "content",
  output: any,
  businessContext: string
): Promise<{
  isValid: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
}> {
  let validation;

  switch (outputType) {
    case "homepage":
      validation = validateHomepageBlueprint(output, businessContext);
      break;
    case "insights":
      validation = validateProfitInsights(
        typeof output === "string" ? output : JSON.stringify(output),
        businessContext
      );
      break;
    case "content":
      validation = validateBusinessSpecificity(
        typeof output === "string" ? output : JSON.stringify(output),
        businessContext
      );
      break;
    default:
      validation = { isValid: true, issues: [], suggestions: [] };
  }

  // Calculate score
  const maxIssues = 10;
  const score = Math.max(
    0,
    Math.round((1 - validation.issues.length / maxIssues) * 100)
  );

  return {
    ...validation,
    score,
  };
}
