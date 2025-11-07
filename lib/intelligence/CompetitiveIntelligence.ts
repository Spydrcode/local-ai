import { createClient } from "@supabase/supabase-js";
import { chromium } from "playwright";
import { createAICompletion } from "../unified-ai-client";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * CompetitiveIntelligence
 *
 * Deep competitor analysis including website scraping, tech stack detection,
 * content strategy analysis, and SWOT generation.
 */

interface CompetitorProfile {
  id: string;
  name: string;
  website: string;
  industry: string;
  lastAnalyzed: Date;
  analysis: {
    website: WebsiteAnalysis;
    techStack: TechStack;
    contentStrategy: ContentStrategy;
    socialPresence: SocialPresence;
    pricing?: PricingAnalysis;
    hiring?: HiringSignals;
    funding?: FundingInfo;
    swot: SWOT;
  };
  trends: Trend[];
  marketPosition: {
    estimatedMarketShare?: number;
    growthRate?: number;
    positioning: string;
  };
}

interface WebsiteAnalysis {
  url: string;
  title: string;
  description: string;
  valueProposition: string;
  targetAudience: string;
  keyFeatures: string[];
  ctaStrategy: string[];
  design: {
    primaryColors: string[];
    style: string; // modern, traditional, minimal, etc.
    userExperience: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    headings: string[];
    keywords: string[];
  };
  performance: {
    loadTime?: number;
    mobileOptimized: boolean;
  };
}

interface TechStack {
  frontend: string[];
  backend?: string[];
  analytics: string[];
  marketing: string[];
  hosting?: string;
  cdn?: string;
  cms?: string;
}

interface ContentStrategy {
  blogFrequency: string; // daily, weekly, monthly
  contentTypes: string[]; // tutorials, case studies, news, etc.
  topTopics: string[];
  contentQuality: "high" | "medium" | "low";
  seoOptimization: "strong" | "moderate" | "weak";
}

interface SocialPresence {
  platforms: Array<{
    platform: string;
    url?: string;
    followers?: number;
    engagement?: number;
    postFrequency?: string;
    contentStyle?: string;
  }>;
  overallStrength: "strong" | "moderate" | "weak";
}

interface PricingAnalysis {
  model: string; // subscription, one-time, freemium, etc.
  tiers: Array<{
    name: string;
    price: number;
    features: string[];
  }>;
  positioning: string; // premium, mid-market, budget
}

interface HiringSignals {
  recentPostings: number;
  departments: string[];
  growthIndicators: string[];
}

interface FundingInfo {
  totalRaised?: number;
  lastRound?: {
    amount: number;
    date: Date;
    type: string;
  };
  investors?: string[];
}

interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface Trend {
  type:
    | "product_launch"
    | "feature_update"
    | "pricing_change"
    | "market_expansion"
    | "partnership";
  description: string;
  detectedAt: Date;
  significance: "high" | "medium" | "low";
}

interface MarketGapAnalysis {
  gaps: Array<{
    area: string;
    description: string;
    opportunity: string;
    difficulty: "low" | "medium" | "high";
    potentialImpact: "low" | "medium" | "high";
  }>;
  whitespace: string[];
  recommendations: string[];
}

export class CompetitiveIntelligence {
  /**
   * Perform deep analysis of a competitor
   */
  async analyzeCompetitor(
    competitorName: string,
    competitorWebsite: string,
    industry: string,
    context?: {
      yourBusinessId?: string;
      focusAreas?: string[]; // e.g., ['pricing', 'features', 'marketing']
    }
  ): Promise<CompetitorProfile> {
    console.log(`Starting deep analysis of ${competitorName}...`);

    // Scrape competitor website
    const websiteAnalysis = await this.analyzeWebsite(competitorWebsite);

    // Detect tech stack
    const techStack = await this.detectTechStack(competitorWebsite);

    // Analyze content strategy
    const contentStrategy =
      await this.analyzeContentStrategy(competitorWebsite);

    // Analyze social presence
    const socialPresence = await this.analyzeSocialPresence(competitorName);

    // Try to extract pricing (if available)
    const pricing = await this.extractPricing(competitorWebsite);

    // Check for hiring signals
    const hiring = await this.checkHiringSignals(competitorName);

    // Generate SWOT analysis
    const swot = await this.generateSWOT({
      websiteAnalysis,
      techStack,
      contentStrategy,
      socialPresence,
      pricing,
      hiring,
    });

    const profile: CompetitorProfile = {
      id: `competitor_${Date.now()}`,
      name: competitorName,
      website: competitorWebsite,
      industry,
      lastAnalyzed: new Date(),
      analysis: {
        website: websiteAnalysis,
        techStack,
        contentStrategy,
        socialPresence,
        pricing,
        hiring,
        swot,
      },
      trends: [],
      marketPosition: {
        positioning: await this.determineMarketPositioning(
          websiteAnalysis,
          pricing
        ),
      },
    };

    // Store analysis
    await this.storeCompetitorProfile(profile);

    return profile;
  }

  /**
   * Analyze competitor website
   */
  private async analyzeWebsite(url: string): Promise<WebsiteAnalysis> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Extract basic info
      const title = await page.title();
      const metaDescription = await page
        .$eval(
          'meta[name="description"]',
          (el) => el.getAttribute("content") || ""
        )
        .catch(() => "");

      // Extract headings
      const headings = await page.$$eval("h1, h2, h3", (elements) =>
        elements.slice(0, 20).map((el) => el.textContent?.trim() || "")
      );

      // Extract CTAs
      const ctaTexts = await page.$$eval(
        'button, a.btn, a.button, [class*="cta"]',
        (elements) =>
          elements.slice(0, 10).map((el) => el.textContent?.trim() || "")
      );

      // Get page content for AI analysis
      const bodyText = await page
        .$eval("body", (el) => el.textContent || "")
        .catch(() => "");
      const cleanedText = bodyText.substring(0, 5000); // Limit for AI

      // Detect colors
      const colors = await page
        .$$eval('[style*="background"], [class*="bg-"]', (elements) =>
          elements.slice(0, 10).map((el) => {
            const bgColor = getComputedStyle(el as Element).backgroundColor;
            return bgColor;
          })
        )
        .catch(() => []);

      // Check mobile optimization
      const viewport = page.viewportSize();
      await page.setViewportSize({ width: 375, height: 667 });
      const isMobileOptimized = await page.evaluate(() => {
        return window.innerWidth <= 768;
      });
      if (viewport) await page.setViewportSize(viewport);

      await browser.close();

      // Use AI to analyze the content
      const aiAnalysis = await this.analyzeWebsiteContent(
        title,
        metaDescription,
        headings.join("\n"),
        cleanedText,
        ctaTexts
      );

      return {
        url,
        title,
        description: metaDescription,
        valueProposition: aiAnalysis.valueProposition,
        targetAudience: aiAnalysis.targetAudience,
        keyFeatures: aiAnalysis.keyFeatures,
        ctaStrategy: ctaTexts.filter((t) => t.length > 0),
        design: {
          primaryColors: this.extractUniqueColors(colors),
          style: aiAnalysis.designStyle,
          userExperience: aiAnalysis.ux,
        },
        seo: {
          metaTitle: title,
          metaDescription: metaDescription,
          headings: headings.filter((h) => h.length > 0),
          keywords: aiAnalysis.keywords,
        },
        performance: {
          mobileOptimized: isMobileOptimized,
        },
      };
    } catch (error) {
      console.error("Error analyzing website:", error);
      await browser.close();
      throw error;
    }
  }

  /**
   * Use AI to analyze website content
   */
  private async analyzeWebsiteContent(
    title: string,
    description: string,
    headings: string,
    bodyText: string,
    ctas: string[]
  ): Promise<{
    valueProposition: string;
    targetAudience: string;
    keyFeatures: string[];
    designStyle: string;
    ux: string;
    keywords: string[];
  }> {
    const prompt = `Analyze this website content and extract key information.

Title: ${title}
Description: ${description}

Headings:
${headings}

CTAs: ${ctas.join(", ")}

Sample Content:
${bodyText.substring(0, 2000)}

Extract:
1. Value proposition (1-2 sentences)
2. Target audience
3. Key features/benefits (list)
4. Design style (modern, traditional, minimal, bold, etc.)
5. User experience assessment
6. Primary keywords (5-10)

Return JSON.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content:
            "You are a website analyst. Extract structured information and return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 1000,
      jsonMode: true,
    });

    const analysis = JSON.parse(completion || "{}");

    return {
      valueProposition: analysis.valueProposition || "",
      targetAudience: analysis.targetAudience || "",
      keyFeatures: analysis.keyFeatures || [],
      designStyle: analysis.designStyle || "modern",
      ux: analysis.ux || "",
      keywords: analysis.keywords || [],
    };
  }

  /**
   * Detect tech stack from website
   */
  private async detectTechStack(url: string): Promise<TechStack> {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      // Detect technologies
      const technologies = await page.evaluate(() => {
        const detections: any = {
          frontend: [],
          analytics: [],
          marketing: [],
        };

        // Check for common frameworks
        if ((window as any).React) detections.frontend.push("React");
        if ((window as any).Vue) detections.frontend.push("Vue");
        if ((window as any).angular) detections.frontend.push("Angular");
        if (document.querySelector("[data-nextjs]"))
          detections.frontend.push("Next.js");

        // Check for analytics
        if ((window as any).ga || (window as any).gtag)
          detections.analytics.push("Google Analytics");
        if ((window as any).fbq) detections.analytics.push("Facebook Pixel");
        if ((window as any).mixpanel) detections.analytics.push("Mixpanel");

        // Check for marketing tools
        if ((window as any).Intercom) detections.marketing.push("Intercom");
        if ((window as any).drift) detections.marketing.push("Drift");
        if ((window as any).HubSpotConversations)
          detections.marketing.push("HubSpot");

        return detections;
      });

      // Check meta tags for more info
      const generator = await page
        .$eval(
          'meta[name="generator"]',
          (el) => el.getAttribute("content") || ""
        )
        .catch(() => "");

      if (generator.includes("WordPress"))
        technologies.frontend.push("WordPress");
      if (generator.includes("Shopify")) technologies.frontend.push("Shopify");

      await browser.close();

      return {
        frontend: technologies.frontend,
        analytics: technologies.analytics,
        marketing: technologies.marketing,
      };
    } catch (error) {
      console.error("Error detecting tech stack:", error);
      await browser.close();
      return { frontend: [], analytics: [], marketing: [] };
    }
  }

  /**
   * Analyze content strategy
   */
  private async analyzeContentStrategy(url: string): Promise<ContentStrategy> {
    // Try to access blog/content pages
    const blogUrls = [
      `${url}/blog`,
      `${url}/resources`,
      `${url}/news`,
      `${url}/insights`,
    ];

    const browser = await chromium.launch({ headless: true });

    for (const blogUrl of blogUrls) {
      const page = await browser.newPage();

      try {
        await page.goto(blogUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });

        // Extract article titles/topics
        const articles = await page.$$eval(
          'article, [class*="post"], [class*="blog"]',
          (elements) =>
            elements.slice(0, 20).map((el) => ({
              title: el.querySelector("h1, h2, h3")?.textContent?.trim() || "",
              date:
                el
                  .querySelector('time, [class*="date"]')
                  ?.textContent?.trim() || "",
            }))
        );

        await browser.close();

        if (articles.length > 0) {
          // Analyze content with AI
          const analysis = await this.analyzeContentPatterns(articles);
          return analysis;
        }
      } catch (error) {
        // Continue to next URL
        await page.close();
      }
    }

    await browser.close();

    // Default if no blog found
    return {
      blogFrequency: "unknown",
      contentTypes: [],
      topTopics: [],
      contentQuality: "medium",
      seoOptimization: "moderate",
    };
  }

  /**
   * Analyze content patterns with AI
   */
  private async analyzeContentPatterns(
    articles: Array<{ title: string; date: string }>
  ): Promise<ContentStrategy> {
    const titles = articles.map((a) => a.title).join("\n");

    const prompt = `Analyze these blog article titles and determine:
1. Content types (tutorials, case studies, news, thought leadership, etc.)
2. Top 5 topics/themes
3. Content quality assessment (high/medium/low based on titles)
4. SEO optimization level (strong/moderate/weak)

Titles:
${titles}

Return JSON.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content: "You are a content strategist. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      maxTokens: 800,
      jsonMode: true,
    });

    const analysis = JSON.parse(completion || "{}");

    return {
      blogFrequency: articles.length > 10 ? "weekly" : "monthly",
      contentTypes: analysis.contentTypes || [],
      topTopics: analysis.topTopics || [],
      contentQuality: analysis.contentQuality || "medium",
      seoOptimization: analysis.seoOptimization || "moderate",
    };
  }

  /**
   * Analyze social media presence (simplified - would need API keys for full version)
   */
  private async analyzeSocialPresence(
    competitorName: string
  ): Promise<SocialPresence> {
    // In production, you'd use APIs for LinkedIn, Twitter, etc.
    // For now, return estimated data
    return {
      platforms: [
        { platform: "LinkedIn", postFrequency: "weekly" },
        { platform: "Twitter", postFrequency: "daily" },
      ],
      overallStrength: "moderate",
    };
  }

  /**
   * Extract pricing information
   */
  private async extractPricing(
    url: string
  ): Promise<PricingAnalysis | undefined> {
    const pricingUrls = [`${url}/pricing`, `${url}/plans`];

    const browser = await chromium.launch({ headless: true });

    for (const pricingUrl of pricingUrls) {
      const page = await browser.newPage();

      try {
        await page.goto(pricingUrl, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });

        const pageText = await page.$eval("body", (el) => el.textContent || "");

        await browser.close();

        // Use AI to extract pricing
        const pricing = await this.extractPricingWithAI(pageText);
        return pricing;
      } catch (error) {
        await page.close();
      }
    }

    await browser.close();
    return undefined;
  }

  /**
   * Extract pricing with AI
   */
  private async extractPricingWithAI(
    pageText: string
  ): Promise<PricingAnalysis | undefined> {
    const prompt = `Extract pricing information from this page.

Content:
${pageText.substring(0, 3000)}

Identify:
1. Pricing model (subscription, one-time, freemium, usage-based)
2. Pricing tiers (name, price, key features)
3. Overall positioning (premium/mid-market/budget)

Return JSON or null if no pricing found.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content: "You are a pricing analyst. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      maxTokens: 1000,
      jsonMode: true,
    });

    const data = JSON.parse(completion || "{}");

    if (!data.model) return undefined;

    return {
      model: data.model,
      tiers: data.tiers || [],
      positioning: data.positioning || "mid-market",
    };
  }

  /**
   * Check for hiring signals
   */
  private async checkHiringSignals(
    competitorName: string
  ): Promise<HiringSignals | undefined> {
    // In production, scrape job boards or use APIs
    // For now, return placeholder
    return undefined;
  }

  /**
   * Generate SWOT analysis
   */
  private async generateSWOT(data: any): Promise<SWOT> {
    const prompt = `Generate a SWOT analysis based on this competitor data:

Website Analysis:
- Value Prop: ${data.websiteAnalysis?.valueProposition}
- Target Audience: ${data.websiteAnalysis?.targetAudience}
- Key Features: ${data.websiteAnalysis?.keyFeatures.join(", ")}

Tech Stack:
- Frontend: ${data.techStack?.frontend.join(", ")}
- Analytics: ${data.techStack?.analytics.join(", ")}

Content Strategy:
- Frequency: ${data.contentStrategy?.blogFrequency}
- Topics: ${data.contentStrategy?.topTopics.join(", ")}

Social Presence: ${data.socialPresence?.overallStrength}

Generate SWOT with 4-6 points per category. Return JSON.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content: "You are a competitive analyst. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 1500,
      jsonMode: true,
    });

    const swot = JSON.parse(completion || "{}");

    return {
      strengths: swot.strengths || [],
      weaknesses: swot.weaknesses || [],
      opportunities: swot.opportunities || [],
      threats: swot.threats || [],
    };
  }

  /**
   * Determine market positioning
   */
  private async determineMarketPositioning(
    websiteAnalysis: WebsiteAnalysis,
    pricing?: PricingAnalysis
  ): Promise<string> {
    const indicators = [
      websiteAnalysis.valueProposition,
      websiteAnalysis.targetAudience,
      pricing?.positioning || "",
    ].join(" ");

    if (
      indicators.toLowerCase().includes("enterprise") ||
      pricing?.positioning === "premium"
    ) {
      return "Enterprise/Premium";
    } else if (
      indicators.toLowerCase().includes("small business") ||
      pricing?.positioning === "budget"
    ) {
      return "SMB/Budget";
    } else {
      return "Mid-Market";
    }
  }

  /**
   * Extract unique colors
   */
  private extractUniqueColors(colors: string[]): string[] {
    const unique = [
      ...new Set(colors.filter((c) => c && !c.includes("rgba(0, 0, 0"))),
    ];
    return unique.slice(0, 5);
  }

  /**
   * Store competitor profile
   */
  private async storeCompetitorProfile(
    profile: CompetitorProfile
  ): Promise<void> {
    await supabase.from("competitor_tracking").insert({
      competitor_id: profile.id,
      name: profile.name,
      website: profile.website,
      industry: profile.industry,
      analysis_data: profile.analysis,
      market_position: profile.marketPosition,
      last_analyzed: profile.lastAnalyzed,
    });
  }

  /**
   * Identify market gaps
   */
  async identifyMarketGaps(
    yourBusinessId: string,
    competitorProfiles: CompetitorProfile[]
  ): Promise<MarketGapAnalysis> {
    const prompt = `Analyze these competitor profiles and identify market gaps and opportunities.

Your business ID: ${yourBusinessId}

Competitors (${competitorProfiles.length}):
${competitorProfiles
  .map(
    (c) => `
- ${c.name}: ${c.analysis.website.valueProposition}
  Features: ${c.analysis.website.keyFeatures.join(", ")}
  Positioning: ${c.marketPosition.positioning}
`
  )
  .join("\n")}

Identify:
1. Market gaps (areas no competitor is addressing)
2. Whitespace opportunities
3. Underserved segments
4. Recommendations for differentiation

Return JSON with detailed analysis.`;

    const completion = await createAICompletion({
      messages: [
        {
          role: "system",
          content: "You are a market strategist. Return valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
      jsonMode: true,
    });

    const analysis = JSON.parse(completion || "{}");

    return {
      gaps: analysis.gaps || [],
      whitespace: analysis.whitespace || [],
      recommendations: analysis.recommendations || [],
    };
  }
}
