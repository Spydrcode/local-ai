import { NextApiRequest, NextApiResponse } from "next";
import { IntelligentCache } from "../../../lib/caching/IntelligentCache";

const cache = new IntelligentCache();

/**
 * Cache management endpoints
 *
 * GET /api/cache/stats?businessId=xxx - Get cache statistics
 * POST /api/cache/invalidate - Invalidate cache for a business
 * POST /api/cache/cleanup - Cleanup old cache entries
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // GET: Retrieve cache stats
    if (req.method === "GET") {
      const { businessId } = req.query;

      const stats = await cache.getStats(
        businessId ? String(businessId) : undefined
      );

      return res.status(200).json({
        success: true,
        data: stats,
      });
    }

    // POST: Manage cache
    if (req.method === "POST") {
      const { action, businessId, analysisType, maxAgeHours } = req.body;

      if (action === "invalidate") {
        if (!businessId) {
          return res
            .status(400)
            .json({ error: "businessId is required for invalidation" });
        }

        await cache.invalidate(businessId, analysisType);

        return res.status(200).json({
          success: true,
          message: "Cache invalidated successfully",
        });
      }

      if (action === "cleanup") {
        const deletedCount = await cache.cleanup(maxAgeHours || 720);

        return res.status(200).json({
          success: true,
          message: `Cleaned up ${deletedCount} old cache entries`,
        });
      }

      return res
        .status(400)
        .json({ error: 'Invalid action. Use "invalidate" or "cleanup"' });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Cache management error:", error);
    res.status(500).json({
      error: "Cache operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
