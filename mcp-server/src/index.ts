#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { buildChatbotConfig } from "./agents/ChatbotConfigAgent.js";
import {
  generateBlogPost,
  generateSocialPost,
} from "./agents/ContentGenerationAgent.js";
import { designHomepage } from "./agents/HomepageDesignAgent.js";
import { generateProfitInsights } from "./agents/ProfitIQAgent.js";
import { analyzeSite } from "./agents/SiteAnalysisAgent.js";
import {
  analyzeStrategy,
  generateSWOT,
  generateQuickWins,
} from "./agents/StrategicAnalysisAgent.js";
import { validateOpenAIConfig } from "./config/openai.js";

/**
 * Forecasta AI MCP Server
 *
 * Exposes 5 AI agents as MCP tools for use with GitHub Copilot, Claude, and other MCP clients:
 * - SiteAnalysisAgent: Analyze websites
 * - ProfitIQAgent: Generate business insights
 * - HomepageDesignAgent: Create custom homepages
 * - ContentGenerationAgent: Generate social/blog content
 * - ChatbotConfigAgent: Build chatbot configurations
 */

// Validate configuration on startup
try {
  validateOpenAIConfig();
} catch (error) {
  console.error(
    "Configuration error:",
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Create MCP server instance
const server = new Server(
  {
    name: "local-ai-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Handler for listing available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "analyze_site",
        description:
          "Analyzes a website URL to extract business information, services, target audience, and unique value propositions. Returns detailed business insights for demo creation.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The website URL to analyze",
            },
          },
          required: ["url"],
        },
      },
      {
        name: "generate_profit_insights",
        description:
          "Generates business-specific ProfitIQ insights including exact sub-niche identification, competitive differentiators, strengths analysis, and actionable growth opportunities.",
        inputSchema: {
          type: "object",
          properties: {
            businessInfo: {
              type: "string",
              description:
                "Detailed business description including services, target market, and unique aspects",
            },
            industry: {
              type: "string",
              description: "Industry category (optional, helps with context)",
            },
          },
          required: ["businessInfo"],
        },
      },
      {
        name: "design_homepage",
        description:
          "Creates a custom homepage blueprint with industry-specific color palettes, layout recommendations, content sections, and design patterns tailored to the business type.",
        inputSchema: {
          type: "object",
          properties: {
            businessInfo: {
              type: "string",
              description: "Business details and context",
            },
            differentiators: {
              type: "string",
              description:
                "Key unique selling points and competitive advantages",
            },
          },
          required: ["businessInfo", "differentiators"],
        },
      },
      {
        name: "generate_social_post",
        description:
          "Creates platform-specific social media posts optimized for engagement. Follows mandatory specificity rules to avoid generic content.",
        inputSchema: {
          type: "object",
          properties: {
            businessInfo: {
              type: "string",
              description: "Business context and details",
            },
            platform: {
              type: "string",
              enum: ["facebook", "twitter", "linkedin", "instagram"],
              description: "Target social media platform",
            },
            topic: {
              type: "string",
              description: "Optional: Specific topic or angle for the post",
            },
          },
          required: ["businessInfo", "platform"],
        },
      },
      {
        name: "generate_blog_post",
        description:
          "Generates SEO-optimized blog content (500-700 words) with industry-specific expertise and voice markers.",
        inputSchema: {
          type: "object",
          properties: {
            businessInfo: {
              type: "string",
              description: "Business context for voice and expertise",
            },
            topic: {
              type: "string",
              description: "Blog post topic",
            },
            keywords: {
              type: "array",
              items: { type: "string" },
              description: "Optional: Target SEO keywords",
            },
          },
          required: ["businessInfo", "topic"],
        },
      },
      {
        name: "build_chatbot_config",
        description:
          "Creates a comprehensive chatbot configuration including personality, common questions, answers, and escalation rules tailored to the business.",
        inputSchema: {
          type: "object",
          properties: {
            businessInfo: {
              type: "string",
              description: "Business details and services",
            },
            tone: {
              type: "string",
              enum: ["professional", "friendly", "casual"],
              description: "Desired chatbot personality",
            },
          },
          required: ["businessInfo"],
        },
      },
      {
        name: "analyze_strategy",
        description:
          "Generates Porter's Five Forces and Blue Ocean Strategy analysis for small businesses. Automatically scrapes the website and provides competitive positioning, market opportunities, and actionable strategic plans.",
        inputSchema: {
          type: "object",
          properties: {
            websiteUrl: {
              type: "string",
              description: "Business website URL to analyze",
            },
            businessName: {
              type: "string",
              description: "Business name (optional, will extract from website if not provided)",
            },
          },
          required: ["websiteUrl"],
        },
      },
      {
        name: "generate_swot",
        description:
          "Generates a SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) by automatically scraping and analyzing the business website.",
        inputSchema: {
          type: "object",
          properties: {
            websiteUrl: {
              type: "string",
              description: "Business website URL to analyze",
            },
            businessName: {
              type: "string",
              description: "Business name (optional, will extract from website if not provided)",
            },
          },
          required: ["websiteUrl"],
        },
      },
      {
        name: "generate_quick_wins",
        description:
          "Identifies 5 actionable quick wins by automatically scraping and analyzing the business website. Provides impact and effort assessments for each recommendation.",
        inputSchema: {
          type: "object",
          properties: {
            websiteUrl: {
              type: "string",
              description: "Business website URL to analyze",
            },
            businessName: {
              type: "string",
              description: "Business name (optional, will extract from website if not provided)",
            },
          },
          required: ["websiteUrl"],
        },
      },
    ],
  };
});

/**
 * Handler for tool execution
 */
server.setRequestHandler(
  CallToolRequestSchema,
  async (request: CallToolRequest) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "analyze_site": {
          const { url } = args as { url: string };
          const result = await analyzeSite(url);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "generate_profit_insights": {
          const { businessInfo, industry } = args as {
            businessInfo: string;
            industry?: string;
          };
          const result = await generateProfitInsights(businessInfo, industry);
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "design_homepage": {
          const { businessInfo, differentiators } = args as {
            businessInfo: string;
            differentiators: string;
          };
          const result = await designHomepage(businessInfo, differentiators);
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "generate_social_post": {
          const { businessInfo, platform, topic } = args as {
            businessInfo: string;
            platform: string;
            topic?: string;
          };
          const result = await generateSocialPost(
            businessInfo,
            platform,
            topic
          );
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "generate_blog_post": {
          const { businessInfo, topic, keywords } = args as {
            businessInfo: string;
            topic: string;
            keywords?: string[];
          };
          const result = await generateBlogPost(businessInfo, topic, keywords);
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "build_chatbot_config": {
          const { businessInfo, tone } = args as {
            businessInfo: string;
            tone?: string;
          };
          const result = await buildChatbotConfig(businessInfo, tone);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "analyze_strategy": {
          const { websiteUrl, businessName } = args as {
            websiteUrl: string;
            businessName?: string;
          };
          const result = await analyzeStrategy(websiteUrl, businessName);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "generate_swot": {
          const { websiteUrl, businessName } = args as {
            websiteUrl: string;
            businessName?: string;
          };
          const result = await generateSWOT(websiteUrl, businessName);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "generate_quick_wins": {
          const { websiteUrl, businessName } = args as {
            websiteUrl: string;
            businessName?: string;
          };
          const result = await generateQuickWins(websiteUrl, businessName);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }
);

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Forecasta AI MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
