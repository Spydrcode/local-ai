/**
 * Tests for AI Validation System
 *
 * Verifies that validation functions correctly identify:
 * - Generic vs specific content
 * - Business-appropriate homepage blueprints
 * - Comprehensive profit insights
 */

import { describe, expect, it } from "vitest";
import {
  validateAIOutput,
  validateBusinessSpecificity,
  validateHomepageBlueprint,
  validateProfitInsights,
} from "../lib/ai-validation";

describe("AI Validation System", () => {
  const sampleBusinessContext = `
    Joe's BBQ Catering - Premium oak-smoked Texas BBQ
    Services: Corporate catering, weddings, events
    Pricing: $18/person, minimum 25 people
    Location: Dallas, TX metro area
    Specialty: 14-hour smoking process
    Differentiator: Same-day emergency catering available
  `;

  describe("validateBusinessSpecificity", () => {
    it("should reject generic marketing phrases", () => {
      const genericContent =
        "Welcome to our website! We boost your online presence and take your business to the next level.";
      const result = validateBusinessSpecificity(
        genericContent,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it("should accept specific business content", () => {
      const specificContent =
        "Joe's BBQ specializes in 14-hour oak-smoked brisket at $18/person. We offer same-day emergency catering for corporate events in Dallas.";
      const result = validateBusinessSpecificity(
        specificContent,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("should detect vague adjectives", () => {
      const vagueContent =
        "We provide quality service with excellent results and professional expertise.";
      const result = validateBusinessSpecificity(
        vagueContent,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) => issue.includes("vague adjectives"))
      ).toBe(true);
    });

    it("should validate presence of specific details", () => {
      const detailedContent =
        "$18/person pricing, 14-hour smoking process, Dallas metro location, certified BBQ pitmaster";
      const result = validateBusinessSpecificity(
        detailedContent,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(true);
    });
  });

  describe("validateHomepageBlueprint", () => {
    it("should reject generic hero headlines", () => {
      const genericBlueprint = {
        hero: {
          headline: "Welcome to Our BBQ Restaurant",
          subheadline: "Experience the best BBQ in town",
          ctaLabel: "Learn More",
          backgroundIdea: "BBQ images",
        },
        sections: [],
        style: {
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          accentColor: "#ff0000",
          tone: "friendly",
        },
      };

      const result = validateHomepageBlueprint(
        genericBlueprint,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) =>
          issue.includes("generic template language")
        )
      ).toBe(true);
      expect(
        result.issues.some((issue) => issue.includes("generic button text"))
      ).toBe(true);
    });

    it("should accept specific hero with business details", () => {
      const specificBlueprint = {
        hero: {
          headline: "14-Hour Oak-Smoked Texas BBQ, Ready in 30 Minutes",
          subheadline:
            "Award-winning brisket & ribs at $18/person. Corporate catering with same-day emergency service.",
          ctaLabel: "Order Catering Now",
          backgroundIdea: "14-hour smoking process in oak-fired pits",
        },
        sections: [
          {
            title: "14-Hour Smoking Process",
            body: "Our oak-fired pits run 14 hours for perfect bark and smoke ring.",
          },
          {
            title: "Same-Day Emergency Catering",
            body: "Corporate event on short notice? We can deliver BBQ for 25-500 people with 4-hour lead time.",
          },
        ],
        style: {
          primaryColor: "#8B4513",
          secondaryColor: "#D2691E",
          accentColor: "#FF4500",
          tone: "Texas BBQ authenticity with corporate professionalism",
        },
      };

      const result = validateHomepageBlueprint(
        specificBlueprint,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("should reject generic section titles", () => {
      const blueprintWithGenericSections = {
        hero: {
          headline: "Great BBQ",
          subheadline: "Test",
          ctaLabel: "Click",
          backgroundIdea: "Images",
        },
        sections: [
          { title: "About Us", body: "We are great" },
          { title: "Why Choose Us", body: "We are the best" },
          { title: "Our Services", body: "We do BBQ" },
        ],
        style: {
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          accentColor: "#ff0000",
          tone: "friendly",
        },
      };

      const result = validateHomepageBlueprint(
        blueprintWithGenericSections,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) => issue.includes("generic section titles"))
      ).toBe(true);
    });

    it("should validate color format", () => {
      const blueprintWithInvalidColors = {
        hero: {
          headline: "Test",
          subheadline: "Test",
          ctaLabel: "Test",
          backgroundIdea: "Test",
        },
        sections: [],
        style: {
          primaryColor: "red", // Invalid - should be hex
          secondaryColor: "#ffffff",
          accentColor: "blue", // Invalid - should be hex
          tone: "friendly",
        },
      };

      const result = validateHomepageBlueprint(
        blueprintWithInvalidColors,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) => issue.includes("invalid primary color"))
      ).toBe(true);
      expect(
        result.issues.some((issue) => issue.includes("invalid accent color"))
      ).toBe(true);
    });
  });

  describe("validateProfitInsights", () => {
    it("should reject insights without competitive analysis", () => {
      const genericInsights =
        "This business should improve their website and focus on customer service.";
      const result = validateProfitInsights(
        genericInsights,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) => issue.includes("competitive analysis"))
      ).toBe(true);
    });

    it("should reject insights without quantified metrics", () => {
      const vagueInsights =
        "The business has competitive advantages and should focus on market opportunities.";
      const result = validateProfitInsights(
        vagueInsights,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) => issue.includes("quantified metrics"))
      ).toBe(true);
    });

    it("should accept insights with competitive analysis and metrics", () => {
      const specificInsights = `
        This is a specialty BBQ catering business serving corporate events in Dallas metro. 
        Their competitive advantage is 14-hour smoking process vs typical 6-8 hours at competitors.
        
        Key Differentiators:
        - Oak wood smoking (not gas/electric like 70% of competitors)
        - Same-day emergency catering (24-hour notice minimum at competitors)
        - $18/person pricing vs market average $25-30
        
        Biggest Opportunity: Target Fortune 500 companies within 30-mile radius who currently use 
        generic caterers. Their premium quality at mid-tier pricing positions them perfectly for 
        corporate accounts worth $5k-15k per event.
      `;

      const result = validateProfitInsights(
        specificInsights,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("should detect vague adjectives in insights", () => {
      const vagueInsights =
        "This is an excellent business with quality products and professional service.";
      const result = validateProfitInsights(
        vagueInsights,
        sampleBusinessContext
      );

      expect(result.isValid).toBe(false);
      expect(
        result.issues.some((issue) => issue.includes("vague adjectives"))
      ).toBe(true);
    });
  });

  describe("validateAIOutput (wrapper function)", () => {
    it("should route homepage validation correctly", async () => {
      const homepage = {
        hero: {
          headline: "Welcome to test",
          subheadline: "Test",
          ctaLabel: "Learn More",
          backgroundIdea: "Test",
        },
        sections: [],
        style: {
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          accentColor: "#ff0000",
          tone: "test",
        },
      };

      const result = await validateAIOutput(
        "homepage",
        homepage,
        sampleBusinessContext
      );

      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("issues");
      expect(result).toHaveProperty("suggestions");
      expect(result.isValid).toBe(false);
    });

    it("should route insights validation correctly", async () => {
      const insights = "Generic business advice without specifics.";
      const result = await validateAIOutput(
        "insights",
        insights,
        sampleBusinessContext
      );

      expect(result).toHaveProperty("score");
      expect(result.isValid).toBe(false);
    });

    it("should route content validation correctly", async () => {
      const content =
        "Welcome to our website! Boost your online presence today!";
      const result = await validateAIOutput(
        "content",
        content,
        sampleBusinessContext
      );

      expect(result).toHaveProperty("score");
      expect(result.isValid).toBe(false);
    });

    it("should calculate score based on issues count", async () => {
      const genericContent =
        "Welcome to our website! We boost your online presence.";
      const result = await validateAIOutput(
        "content",
        genericContent,
        sampleBusinessContext
      );

      expect(result.score).toBeLessThan(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
      // Score should be approximately 100 - (issues * 10)
      const expectedScore = Math.max(0, 100 - result.issues.length * 10);
      expect(result.score).toBe(expectedScore);
    });
  });

  describe("Real-world Business Type Tests", () => {
    it("should differentiate BBQ restaurant from propane service", () => {
      const bbqContext =
        "Joe's BBQ - 14-hour oak-smoked brisket, $18/person catering, Dallas TX";
      const propaneContext =
        "Propane Plus - 24/7 emergency delivery, tank exchange, residential/commercial, Austin TX";

      const bbqContent =
        "14-hour oak-smoking process with award-winning brisket at $18/person";
      const propaneContent =
        "24/7 emergency propane delivery with same-day tank exchange service";

      const bbqValidation = validateBusinessSpecificity(bbqContent, bbqContext);
      const propaneValidation = validateBusinessSpecificity(
        propaneContent,
        propaneContext
      );

      expect(bbqValidation.isValid).toBe(true);
      expect(propaneValidation.isValid).toBe(true);

      // Cross-contamination check
      const wrongValidation = validateBusinessSpecificity(
        bbqContent,
        propaneContext
      );
      // Should still pass basic validation, but suggestions might differ
      expect(wrongValidation).toHaveProperty("isValid");
    });

    it("should validate coffee roaster specifics", () => {
      const coffeeContext =
        "Roast Masters - Small-batch artisan coffee, roasted twice weekly, subscription service, Portland OR";
      const coffeeBlueprint = {
        hero: {
          headline: "Fresh-Roasted Coffee Delivered Twice Weekly",
          subheadline:
            "Small-batch artisan roasting from Ethiopia and Colombia beans. Subscribe and save 20%.",
          ctaLabel: "Start Subscription",
          backgroundIdea:
            "Small-batch roasting process with coffee origins map",
        },
        sections: [
          {
            title: "Tuesday & Friday Roasting Schedule",
            body: "We roast small batches twice weekly so your coffee arrives within 48 hours of roasting.",
          },
        ],
        style: {
          primaryColor: "#6F4E37",
          secondaryColor: "#C9A885",
          accentColor: "#E6BE8A",
          tone: "Artisan coffee expertise with approachable education",
        },
      };

      const result = validateHomepageBlueprint(coffeeBlueprint, coffeeContext);
      expect(result.isValid).toBe(true);
    });

    it("should validate law firm specifics", () => {
      const lawContext =
        "Smith & Associates - Personal injury law, 25 years experience, 95% success rate, Houston TX";
      const lawInsights = `
        Personal injury law firm in Houston with 25-year track record and 95% case success rate.
        
        Competitive Advantages:
        - 95% success rate vs 70-80% industry average
        - No upfront fees (contingency only)
        - Average settlement $127k vs market $85k
        
        Key Opportunity: Target auto accident cases in Houston metro (15,000 annually).
        Their success rate and settlement amounts position them 40% above typical PI firms.
      `;

      const result = validateProfitInsights(lawInsights, lawContext);
      expect(result.isValid).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty content", () => {
      const result = validateBusinessSpecificity("", sampleBusinessContext);
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it("should handle empty business context", () => {
      const result = validateBusinessSpecificity("Some content here", "");
      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("issues");
    });

    it("should handle malformed blueprint", () => {
      const malformedBlueprint = {
        // Missing hero
        sections: null,
        style: undefined,
      };

      const result = validateHomepageBlueprint(
        malformedBlueprint as any,
        sampleBusinessContext
      );
      expect(result.isValid).toBe(false);
    });

    it("should handle very long content without crashing", () => {
      const longContent = "Test content. ".repeat(1000);
      const result = validateBusinessSpecificity(
        longContent,
        sampleBusinessContext
      );
      expect(result).toHaveProperty("isValid");
    });
  });
});
