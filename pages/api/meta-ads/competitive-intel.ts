import {
  getCompetitorAdsIntelligence,
  searchCompetitorAds,
} from "@/lib/data-collectors";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

/**
 * Meta Ads Library Competitive Intelligence API
 *
 * GET /api/meta-ads/search?keyword=restaurant&countries=US
 * POST /api/meta-ads/competitive-intel
 *
 * Provides competitive advertising intelligence from Meta's Ads Library
 */

const competitiveIntelSchema = z.object({
  competitors: z.array(
    z.object({
      name: z.string(),
      pageId: z.string().optional(),
    })
  ),
  industry: z.string().optional(),
});

const searchSchema = z.object({
  keyword: z.string(),
  countries: z.array(z.string()).optional(),
  limit: z.number().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check for Meta Ads Library token
  const token = process.env.META_ADS_LIBRARY_TOKEN;
  if (!token) {
    return res.status(503).json({
      error: "Meta Ads Library not configured",
      message:
        "META_ADS_LIBRARY_TOKEN environment variable is required. Get your token from https://www.facebook.com/ads/library/api",
    });
  }

  try {
    if (req.method === "GET") {
      // Search for ads by keyword
      const { keyword, countries, limit } = req.query;

      if (!keyword || typeof keyword !== "string") {
        return res.status(400).json({
          error: "Invalid request",
          message: "keyword query parameter is required",
        });
      }

      const parsedCountries = countries
        ? typeof countries === "string"
          ? [countries]
          : countries
        : ["US"];

      const parsedLimit = limit ? parseInt(limit as string) : 50;

      console.log(
        `[MetaAds] Searching for ads with keyword: ${keyword} in countries: ${parsedCountries.join(", ")}`
      );

      const ads = await searchCompetitorAds({
        keyword,
        countries: parsedCountries,
        limit: parsedLimit,
        accessToken: token,
      });

      return res.status(200).json({
        success: true,
        data: {
          keyword,
          totalAds: ads.length,
          ads,
        },
      });
    } else if (req.method === "POST") {
      // Collect competitive intelligence for multiple competitors
      const body = competitiveIntelSchema.parse(req.body);

      console.log(
        `[MetaAds] Collecting competitive intelligence for ${body.competitors.length} competitors`
      );

      const intelligence = await getCompetitorAdsIntelligence({
        competitors: body.competitors,
        industry: body.industry,
        accessToken: token,
      });

      return res.status(200).json({
        success: true,
        data: intelligence,
      });
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("[MetaAds] Error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid request",
        details: error.errors,
      });
    }

    return res.status(500).json({
      error: "Meta Ads collection failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
