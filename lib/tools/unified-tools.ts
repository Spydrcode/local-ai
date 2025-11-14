/**
 * Unified AI Tools System
 * 10 high-value tools powered by specialized agents
 *
 * Architecture:
 * User Input → Tool (wrapper) → Agent → LLM → Structured Output
 *
 * Each tool is a lightweight wrapper that:
 * 1. Validates inputs
 * 2. Routes to the correct agent(s)
 * 3. Formats structured JSON output
 */

export interface UnifiedTool {
  id: string;
  title: string;
  description: string;
  icon: string;
  agents: string[]; // Agent IDs that power this tool
  apiEndpoint: string;
  inputs?: ToolInput[];
  outputSchema: string; // TypeScript interface name
  category: "strategic" | "marketing" | "sales" | "operations";
}

export interface ToolInput {
  name: string;
  type: "text" | "select" | "multiselect" | "textarea";
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  defaultValue?: any;
}

/**
 * THE 10 UNIFIED TOOLS
 */
export const UNIFIED_TOOLS: UnifiedTool[] = [
  // ============================================================================
  // 1. BUSINESS AUDIT / STRATEGIC DASHBOARD (FLAGSHIP)
  // ============================================================================
  {
    id: "business-audit",
    title: "Complete Business Audit",
    description:
      "Full strategic analysis: SWOT, Porter's 5 Forces, Blue Ocean, competitor analysis, content gaps, local SEO opportunities",
    icon: "🎯",
    agents: [
      "web-scraper-agent",
      "blue-ocean-strategy",
      "porter-forces-agent",
      "competitive-analysis-agent",
      "local-seo-agent",
    ],
    apiEndpoint: "/api/tools/business-audit",
    outputSchema: "BusinessAuditOutput",
    category: "strategic",
  },

  // ============================================================================
  // 2. SOCIAL CONTENT GENERATOR (ALL PLATFORMS)
  // ============================================================================
  {
    id: "social-content",
    title: "Social Media Content Generator",
    description:
      "Create platform-optimized content for Facebook, Instagram, LinkedIn, TikTok, GMB posts",
    icon: "📱",
    agents: ["facebook-marketing", "instagram-marketing", "linkedin-marketing"],
    apiEndpoint: "/api/tools/social-content",
    inputs: [
      {
        name: "platform",
        type: "select",
        label: "Platform",
        required: true,
        options: ["facebook", "instagram", "linkedin", "tiktok", "gmb"],
      },
      {
        name: "content_type",
        type: "select",
        label: "Content Type",
        required: false,
        options: [
          "promotional",
          "educational",
          "testimonial",
          "behind-the-scenes",
          "event",
        ],
      },
      {
        name: "topic",
        type: "text",
        label: "Topic (optional - auto-generated if blank)",
        required: false,
        placeholder: "Auto-generated from business intelligence",
      },
    ],
    outputSchema: "SocialContentOutput",
    category: "marketing",
  },

  // ============================================================================
  // 3. BLOG + SEO WRITER
  // ============================================================================
  {
    id: "blog-seo-writer",
    title: "Blog & SEO Content Writer",
    description:
      "Long-form content: blog posts, service pages, location pages, meta tags",
    icon: "✍️",
    agents: ["blog-writer-agent", "local-seo-agent"],
    apiEndpoint: "/api/tools/blog-seo-writer",
    inputs: [
      {
        name: "content_type",
        type: "select",
        label: "Content Type",
        required: true,
        options: ["blog", "service-page", "location-page", "meta-tags"],
      },
      {
        name: "topic",
        type: "text",
        label: "Topic (optional)",
        required: false,
        placeholder: "Auto-generated from business data",
      },
      {
        name: "tone",
        type: "select",
        label: "Tone",
        required: false,
        options: [
          "educational",
          "authoritative",
          "conversational",
          "inspirational",
        ],
      },
    ],
    outputSchema: "BlogSEOOutput",
    category: "marketing",
  },

  // ============================================================================
  // 4. WEBSITE COPY & BRAND MESSAGING
  // ============================================================================
  {
    id: "website-copy",
    title: "Website Copy & Brand Messaging",
    description:
      "Landing pages, USP, positioning statements, case studies, FAQs, service pages",
    icon: "🌐",
    agents: [
      "blog-writer-agent", // Reused for long-form content
      "faq-agent",
    ],
    apiEndpoint: "/api/tools/website-copy",
    inputs: [
      {
        name: "page_type",
        type: "select",
        label: "Page Type",
        required: true,
        options: [
          "landing-page",
          "about-us",
          "why-choose-us",
          "usp",
          "positioning-statement",
          "case-study",
          "faq",
          "service-description",
        ],
      },
      {
        name: "focus",
        type: "text",
        label: "Focus/Topic (optional)",
        required: false,
        placeholder: "Uses business differentiators by default",
      },
    ],
    outputSchema: "WebsiteCopyOutput",
    category: "marketing",
  },

  // ============================================================================
  // 5. REVIEW & REPUTATION MANAGER
  // ============================================================================
  {
    id: "review-manager",
    title: "Review & Reputation Manager",
    description:
      "Respond to reviews, request testimonials, handle negatives, turn reviews into social content",
    icon: "⭐",
    agents: [
      "facebook-marketing", // For social testimonial posts
      "instagram-marketing",
    ],
    apiEndpoint: "/api/tools/review-manager",
    inputs: [
      {
        name: "action_type",
        type: "select",
        label: "Action Type",
        required: true,
        options: [
          "respond-positive",
          "respond-negative",
          "request-testimonial",
          "create-social-post",
        ],
      },
      {
        name: "review_text",
        type: "textarea",
        label: "Review Text (if responding)",
        required: false,
        placeholder: "Paste the review here...",
      },
      {
        name: "rating",
        type: "select",
        label: "Rating",
        required: false,
        options: ["1", "2", "3", "4", "5"],
      },
    ],
    outputSchema: "ReviewManagerOutput",
    category: "operations",
  },

  // ============================================================================
  // 6. EMAIL MARKETING & AUTOMATION HUB
  // ============================================================================
  {
    id: "email-hub",
    title: "Email Marketing & Automation Hub",
    description:
      "All email types: sales sequences, referral requests, win-back, newsletters, transactional emails",
    icon: "📧",
    agents: ["newsletter-agent"],
    apiEndpoint: "/api/tools/email-hub",
    inputs: [
      {
        name: "email_type",
        type: "select",
        label: "Email Type",
        required: true,
        options: [
          "welcome-sequence",
          "sales-sequence",
          "win-back",
          "referral-request",
          "testimonial-request",
          "newsletter",
          "booking-confirmation",
          "invoice-followup",
          "networking-followup",
        ],
      },
      {
        name: "email_count",
        type: "select",
        label: "Number of Emails (for sequences)",
        required: false,
        options: ["1", "3", "5"],
      },
    ],
    outputSchema: "EmailHubOutput",
    category: "marketing",
  },

  // ============================================================================
  // 7. AD COPY GENERATOR
  // ============================================================================
  {
    id: "ad-copy",
    title: "Ad Copy Generator",
    description:
      "Facebook, Google, and Instagram ad variations with headlines, primary text, CTAs",
    icon: "📢",
    agents: ["facebook-marketing", "instagram-marketing"],
    apiEndpoint: "/api/tools/ad-copy",
    inputs: [
      {
        name: "platform",
        type: "select",
        label: "Platform",
        required: true,
        options: ["facebook", "instagram", "google"],
      },
      {
        name: "campaign_goal",
        type: "select",
        label: "Campaign Goal",
        required: true,
        options: ["awareness", "traffic", "leads", "sales"],
      },
      {
        name: "variation_count",
        type: "select",
        label: "Number of Variations",
        required: false,
        options: ["3", "5", "10"],
        defaultValue: "3",
      },
    ],
    outputSchema: "AdCopyOutput",
    category: "marketing",
  },

  // ============================================================================
  // 8. OBJECTION HANDLER / SALES ASSISTANT
  // ============================================================================
  {
    id: "objection-handler",
    title: "Objection Handler & Sales Assistant",
    description:
      "Handle price, timing, and competitor objections with strategic depth",
    icon: "💬",
    agents: [
      "blue-ocean-strategy", // For competitive positioning
      "porter-forces-agent", // For competitive analysis
    ],
    apiEndpoint: "/api/tools/objection-handler",
    inputs: [
      {
        name: "objection_type",
        type: "select",
        label: "Objection Type",
        required: true,
        options: [
          "price",
          "timing",
          "competitor",
          "need",
          "trust",
          "authority",
        ],
      },
      {
        name: "objection_text",
        type: "textarea",
        label: "Specific Objection (optional)",
        required: false,
        placeholder: 'E.g., "Your competitor is cheaper"',
      },
    ],
    outputSchema: "ObjectionHandlerOutput",
    category: "sales",
  },

  // ============================================================================
  // 9. PRICING STRATEGY TOOL
  // ============================================================================
  {
    id: "pricing-strategy",
    title: "Pricing Strategy Analyzer",
    description:
      "Analyze pricing structure and generate optimized pricing tiers",
    icon: "💵",
    agents: ["pricing-intelligence-agent", "competitive-analysis-agent"],
    apiEndpoint: "/api/tools/pricing-strategy",
    outputSchema: "PricingStrategyOutput",
    category: "strategic",
  },

  // ============================================================================
  // 10. SERVICE PACKAGE & OFFER DESIGNER
  // ============================================================================
  {
    id: "service-packages",
    title: "Service Package & Offer Designer",
    description: "Generate service tiers, bundles, upsells, and value ladders",
    icon: "📦",
    agents: [
      "blue-ocean-strategy",
      "blog-writer-agent", // For package descriptions
    ],
    apiEndpoint: "/api/tools/service-packages",
    inputs: [
      {
        name: "package_type",
        type: "select",
        label: "Package Type",
        required: true,
        options: ["tiered-pricing", "bundles", "upsells", "value-ladder"],
      },
      {
        name: "tier_count",
        type: "select",
        label: "Number of Tiers",
        required: false,
        options: ["2", "3", "4"],
        defaultValue: "3",
      },
    ],
    outputSchema: "ServicePackageOutput",
    category: "strategic",
  },
];

/**
 * Tool Categories for UI
 */
export const TOOL_CATEGORIES = [
  {
    id: "strategic",
    title: "🎯 Strategic Growth",
    description: "Deep business analysis and strategic planning",
    color: "emerald",
    tools: UNIFIED_TOOLS.filter((t) => t.category === "strategic"),
  },
  {
    id: "marketing",
    title: "📢 Marketing & Content",
    description: "All-in-one content creation across channels",
    color: "orange",
    tools: UNIFIED_TOOLS.filter((t) => t.category === "marketing"),
  },
  {
    id: "sales",
    title: "💰 Sales & Conversion",
    description: "Convert more prospects into customers",
    color: "green",
    tools: UNIFIED_TOOLS.filter((t) => t.category === "sales"),
  },
  {
    id: "operations",
    title: "⚙️ Operations & Reputation",
    description: "Streamline operations and manage reputation",
    color: "blue",
    tools: UNIFIED_TOOLS.filter((t) => t.category === "operations"),
  },
];

/**
 * Get tool by ID
 */
export function getToolById(toolId: string): UnifiedTool | undefined {
  return UNIFIED_TOOLS.find((t) => t.id === toolId);
}

/**
 * Get agents for a tool
 */
export function getToolAgents(toolId: string): string[] {
  const tool = getToolById(toolId);
  return tool?.agents || [];
}
