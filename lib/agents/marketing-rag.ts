/**
 * Marketing RAG System - Retrieval-Augmented Generation
 * Grounds AI responses in marketing frameworks and best practices
 */

import { VectorRepository } from "../repositories/vector-repository";

interface MarketingKnowledge {
  framework: string;
  content: string;
  source: string;
  category: string;
  relevance: number;
}

/**
 * Retrieve relevant marketing frameworks for a given context
 */
export async function retrieveMarketingContext(
  marketingContext: string,
  contentType?: "social" | "content" | "email" | "seo" | "all"
): Promise<MarketingKnowledge[]> {
  try {
    const repo = new VectorRepository(
      (process.env.VECTOR_PROVIDER as "supabase" | "pinecone") || "supabase"
    );

    const results = await repo.searchMarketingKnowledge({
      demoId: "marketing-knowledge-base",
      query: marketingContext,
      contentType,
    });

    // Map vector results to MarketingKnowledge format
    const vectorKnowledge: MarketingKnowledge[] = results.map(
      (result: any) => ({
        framework: result.metadata?.framework || "general-marketing",
        content: result.content || result.metadata?.content || "",
        source: result.metadata?.source || "Marketing Framework",
        category: result.metadata?.category || "strategy",
        relevance: result.score || 0.7,
      })
    );

    // Filter by content type if specified
    if (contentType && contentType !== "all") {
      const filtered = vectorKnowledge.filter((k) =>
        isRelevantToContentType(k.framework, contentType)
      );
      if (filtered.length > 0) return filtered;
    }

    return vectorKnowledge;
  } catch (error) {
    console.error("❌ Marketing vector search failed:", error);
    // Return empty array on error - caller handles fallback
    return [];
  }
}

/**
 * Check if a framework is relevant to a content type
 */
function isRelevantToContentType(
  framework: string,
  contentType: "social" | "content" | "email" | "seo"
): boolean {
  const mapping: Record<string, string[]> = {
    social: ["social-media-strategy", "content-strategy", "consumer-journey"],
    content: ["content-strategy", "seo-strategy", "different-marketing"],
    email: ["email-marketing", "consumer-journey", "ai-personalization"],
    seo: ["seo-strategy", "content-strategy", "discovery-driven-marketing"],
  };

  return mapping[contentType]?.includes(framework) || false;
}

/**
 * Augment prompt with marketing framework context
 */
export function augmentWithMarketingContext(
  basePrompt: string,
  marketingContext: MarketingKnowledge[]
): string {
  if (marketingContext.length === 0) {
    return basePrompt; // No augmentation if no context
  }

  const contextSection = marketingContext
    .map(
      (k) =>
        `\n**${k.framework.toUpperCase().replace(/-/g, " ")} (${k.source})**:\n${k.content}`
    )
    .join("\n\n");

  return `${basePrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 MARKETING FRAMEWORK REFERENCE (Apply these best practices):
${contextSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**CRITICAL INSTRUCTIONS**:
1. Apply the marketing frameworks above to THIS SPECIFIC BUSINESS
2. Reference the framework concepts explicitly in your content
3. Avoid generic marketing advice - ground insights in proven theory
4. Use platform-specific best practices from the frameworks
5. Align content with consumer journey and positioning strategies`;
}
