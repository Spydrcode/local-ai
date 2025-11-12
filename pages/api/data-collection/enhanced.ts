import { getDataCollector } from "@/lib/data-collectors";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

/**
 * Enhanced Data Collection API
 *
 * POST /api/data-collection/enhanced
 *
 * Collects comprehensive business intelligence including:
 * - Website scraping
 * - Competitor discovery
 * - Review aggregation
 * - SEO analysis
 * - Social media presence
 * - Meta Ads competitive intelligence (if context provided)
 */

const requestSchema = z.object({
  url: z.string().url(),
  businessContext: z
    .object({
      industry: z.string().optional(),
      subNiche: z.string().optional(),
      targetAudience: z.string().optional(),
      primaryServices: z.array(z.string()).optional(),
      competitors: z
        .array(
          z.object({
            name: z.string(),
            website: z.string().optional(),
            pageId: z.string().optional(),
          })
        )
        .optional(),
      marketingGoals: z.array(z.string()).optional(),
      currentChallenges: z.array(z.string()).optional(),
      budget: z
        .object({
          monthly: z.number().optional(),
          currency: z.string().optional(),
        })
        .optional(),
      geographicScope: z.array(z.string()).optional(),
    })
    .optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate request body
    const { url, businessContext } = requestSchema.parse(req.body);

    console.log(`[EnhancedDataCollection] Starting collection for ${url}`);
    if (businessContext) {
      console.log(
        `[EnhancedDataCollection] Using business context with ${businessContext.competitors?.length || 0} competitors`
      );
    }

    // Get enhanced data collector with Meta Ads support
    const collector = getDataCollector();

    // Collect comprehensive data
    const result = await collector.collect(url, businessContext);

    console.log(
      `[EnhancedDataCollection] Completed in ${result.metadata.duration}ms`
    );
    console.log(
      `[EnhancedDataCollection] Sources: ${result.metadata.sources.join(", ")}`
    );

    if (result.metaAds) {
      console.log(
        `[EnhancedDataCollection] Meta Ads: Analyzed ${result.metaAds.competitors.length} competitors, ${result.metaAds.industryInsights.totalAdsAnalyzed} total ads`
      );
    }

    // Return enriched data
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[EnhancedDataCollection] Error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: "Data collection failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
